<template>
  <ion-page>
    <ion-content :fullscreen="true" no-bounce>
      <div id="map"></div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonPage,
  IonContent,
  loadingController,
  modalController,
} from "@ionic/vue";
import { onMounted, reactive, ref, watch } from "vue";
import mapboxgl, { GeoJSONSource, LngLat, LngLatLike } from "mapbox-gl";
import { GasStation } from "cloud-sdk-capacitor-plugin";
import { Plugins } from "@capacitor/core";
import DetailsModal from "./DetailsModal.vue";
import { haversineDistance } from "../utils/coordinates";

interface FeatureProps {
  id: string;
  name: string;
}

export default {
  name: "Map",
  components: {
    IonContent,
    IonPage,
  },
  setup() {
    const { CloudSDK, Geolocation } = Plugins;

    const gasStations = ref<GasStation[]>([]);

    const map = ref<mapboxgl.Map>();
    const mapCenter = ref<LngLatLike>();
    const markers = reactive<Map<string, mapboxgl.Marker>>(new Map());

    const SOURCE_ID = "gasStations";

    // Karlsruhe, Germany
    const defaultCenter: LngLatLike = [8.403653, 49.006889];

    function createMarker(name: string): HTMLDivElement {
      const el = document.createElement("div");
      const label = name;

      el.classList.add("marker");

      el.innerText = label;

      return el;
    }

    const handleMarkerClick = (id: string) => async () => {
      const gasStation = gasStations.value.find(
        (gasStation) => gasStation.id === id
      );

      if (!gasStation) return;

      if (!mapCenter.value) return;

      const center = LngLat.convert(mapCenter.value);

      const distance = haversineDistance(
        [center.lng, center.lat],
        gasStation.coordinates
      );

      const modal = await modalController.create({
        component: DetailsModal,
        componentProps: {
          title: gasStation.name,
          gasStation,
          distance,
        },
      });

      return modal.present();
    };

    const updateMarkers = () => {
      if (!map.value || !mapCenter.value) return;

      const features = map.value.querySourceFeatures(SOURCE_ID);
      if (!features.length) return;

      const addedMarkers: Map<string, mapboxgl.Marker> = new Map();

      features.forEach((feature) => {
        const { properties, geometry } = feature;
        const { id, name } = properties as FeatureProps;
        // @ts-ignore
        const coords = LngLat.convert(geometry.coordinates);

        let marker = markers.get(id);

        // Remove any existing references to prevent duplicate markers
        if (marker && marker.getElement()) {
          marker
            .getElement()
            .removeEventListener("click", handleMarkerClick(id));

          marker.remove();

          markers.delete(id);
        }

        const el = createMarker(name);

        marker = new mapboxgl.Marker({
          element: el,
        }).setLngLat(coords);

        el.addEventListener("click", handleMarkerClick(id));

        if (map.value) marker.addTo(map.value);

        markers.set(id, marker);
        addedMarkers.set(id, marker);
      });

      // Remove markers that should not be rendered any more
      Array.from(markers.keys()).map((key) => {
        if (!addedMarkers.has(key)) {
          const marker = markers.get(key);

          if (marker && marker.getElement()) {
            marker
              .getElement()
              .removeEventListener("click", handleMarkerClick(key));

            marker.remove();
          }

          markers.delete(key);
        }
      });
    };

    function getSourceData(
      gasStations: GasStation[]
    ): GeoJSON.FeatureCollection<GeoJSON.Point, FeatureProps> {
      const data: GeoJSON.FeatureCollection<GeoJSON.Point, FeatureProps> = {
        type: "FeatureCollection",
        features: [],
      };

      gasStations.forEach((gasStation) => {
        data.features.push({
          type: "Feature",
          properties: {
            id: gasStation.id,
            name: gasStation.name,
          },
          geometry: {
            type: "Point",
            coordinates: [gasStation.coordinates[0], gasStation.coordinates[1]],
          },
        });
      });

      return data;
    }

    async function getUserPosition() {
      try {
        const response = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
        });

        mapCenter.value = [response.coords.longitude, response.coords.latitude];
      } catch (err) {
        console.error(err);
      }
    }

    function handleDoneMapInteraction() {
      mapCenter.value = map.value?.getCenter();
    }

    onMounted(() => {
      map.value = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: defaultCenter,
        zoom: 11,
      });

      map.value.on("load", function() {
        if (!map.value) return;

        // Resize the map so it fills the entire screen
        map.value.resize();

        getUserPosition();
      });

      map.value.on("data", function(e) {
        if (e.sourceId !== SOURCE_ID || !e.isSourceLoaded) return;

        updateMarkers();
      });

      map.value.on("dragend", handleDoneMapInteraction);
      map.value.on("zoomend", handleDoneMapInteraction);
    });

    watch(mapCenter, async (value) => {
      if (!value || !map.value) return;

      map.value.setCenter(value);

      const loading = await loadingController.create({
        cssClass: "",
        message: "Fetching gasstations...",
      });

      const coords = LngLat.convert(value);

      await loading.present();

      try {
        const { results } = await CloudSDK.getNearbyGasStations({
          coordinate: [coords.lng, coords.lat],

          // @todo make radius dependent on current bounding box
          radius: 10000,
        });

        gasStations.value = [...results];
      } catch (err) {
        console.error(err);
      } finally {
        loading.dismiss();
      }
    });

    watch(gasStations, (values) => {
      if (!map.value || !values.length) return;

      const source = map.value.getSource(SOURCE_ID);

      const data = getSourceData(values);

      if (!source) {
        map.value.addSource(SOURCE_ID, {
          type: "geojson",
          data,
        });

        map.value.addLayer({
          id: "markers",
          type: "symbol",
          source: SOURCE_ID,
        });

        return;
      }

      (map.value.getSource(SOURCE_ID) as GeoJSONSource).setData(data);
    });
  },
};
</script>

<style>
#map {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.marker {
  display: inline-block;
  background: #121212;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}
</style>
