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

export default {
  name: "Map",
  components: {
    IonContent,
    IonPage,
  },
  setup() {
    const { CloudSDK, Geolocation } = Plugins;

    const gasStations = reactive<Map<string, GasStation>>(new Map());

    const map = ref<mapboxgl.Map>();
    const mapCenter = ref<LngLatLike>();
    const markers = reactive<Map<string, mapboxgl.Marker>>(new Map());

    const SOURCE_ID = "gasStations";

    const defaultCenter: [number, number] = [5.886479, 51.000626];

    function createMarker(gasStation: GasStation): HTMLDivElement {
      const { name } = gasStation;

      const el = document.createElement("div");

      el.classList.add("marker");

      el.innerText = name;

      return el;
    }

    const handleMarkerClick = (id: string) => async () => {
      const gasStation = gasStations.get(id);

      if (!gasStation) return;

      const modal = await modalController.create({
        component: DetailsModal,
        componentProps: {
          title: `${gasStation.name} - Details`,
          gasStation,
        },
      });

      return modal.present();
      // @todo open modal
    };

    const updateMarkers = () => {
      if (!map.value) return;

      const features = map.value.querySourceFeatures(SOURCE_ID);

      if (!features.length) return;

      const addedMarkers: Map<string, mapboxgl.Marker> = new Map();

      features.forEach((feature) => {
        const { properties, geometry } = feature;

        // @ts-ignore
        const { gasStation } = properties;
        if (!gasStation) return;

        // @ts-ignore
        const coords = LngLat.convert(geometry.coordinates);

        let marker = markers.get(gasStation.id);

        // Remove any existing references
        if (marker && marker.getElement()) {
          marker
            .getElement()
            .removeEventListener("click", handleMarkerClick(gasStation.id));

          marker.remove();

          markers.delete(gasStation.id);
        }

        const el = createMarker(gasStation);

        marker = new mapboxgl.Marker({
          element: el,
        }).setLngLat(coords);

        el.addEventListener("click", handleMarkerClick(gasStation.id));

        if (map.value) marker.addTo(map.value);

        markers.set(gasStation.id, marker);
        addedMarkers.set(gasStation.id, marker);
      });

      // Remove markers for gasStations we are not rendering
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
      gasStations: Map<string, GasStation>
    ): GeoJSON.FeatureCollection<GeoJSON.Point, { gasStation: GasStation }> {
      const data: GeoJSON.FeatureCollection<
        GeoJSON.Point,
        { gasStation: GasStation }
      > = {
        type: "FeatureCollection",
        features: [],
      };

      gasStations.forEach((gasStation) => {
        data.features.push({
          type: "Feature",
          properties: {
            gasStation,
          },
          geometry: {
            type: "Point",
            coordinates: [
              gasStation.coordinates[0][0],
              gasStation.coordinates[0][1],
            ],
          },
        });
      });

      return data;
    }

    async function getUserPosition() {
      try {
        const response = await Geolocation.getCurrentPosition();
        mapCenter.value = [response.coords.longitude, response.coords.latitude];
      } catch (err) {
        console.error(err);

        mapCenter.value = defaultCenter;
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
        // minZoom: 9,
        // maxZoom: 14,
      });

      map.value.on("load", async function() {
        if (!map.value) return;

        // Resize the map so it fills the entire screen
        map.value.resize();

        // getUserPosition();
      });

      map.value.on("data", function(e) {
        if (e.sourceId !== SOURCE_ID || !e.isSourceLoaded) return;

        updateMarkers();
      });

      map.value.on("dragend", handleDoneMapInteraction);
      map.value.on("zoomend", handleDoneMapInteraction);
    });

    watch(mapCenter, async (value) => {
      if (!value) return;

      map.value?.setCenter(value);

      const loading = await loadingController.create({
        cssClass: "",
        message: "Fetching gasstations...",
      });

      await loading.present();

      try {
        const coords = LngLat.convert(value);

        const { results } = await CloudSDK.getNearbyGasStations({
          coordinate: [coords.lat, coords.lng],

          // @todo make radius dependent on current bounding box
          radius: 250,
        });

        results.forEach((result) => {
          gasStations.set(result.id, result);
        });

        loading.dismiss();
      } catch (err) {
        console.error(err);

        loading.dismiss();
      }
    });

    watch(gasStations, (values) => {
      if (!map.value || !values.size) return;

      const sourceData = getSourceData(values);

      if (!map.value.isSourceLoaded(SOURCE_ID)) {
        map.value.addSource(SOURCE_ID, {
          type: "geojson",
        });

        map.value.addLayer({
          id: "markers",
          type: "symbol",
          source: SOURCE_ID,
        });

        return;
      }

      (map.value.getSource(SOURCE_ID) as GeoJSONSource).setData(sourceData);
    });
  },
};
</script>

<style scoped>
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
  padding: 0.8rem 1.2rem;
  border-radius: 100%;
}
</style>
