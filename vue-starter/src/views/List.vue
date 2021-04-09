<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>List</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">List</ion-title>
        </ion-toolbar>
      </ion-header>

      <p class="ion-padding-start ion-padding-end">
        <ion-button v-on:click="getUserPosition()" expand="block" fill="outline"
          >Refresh</ion-button
        >
      </p>

      <ion-list v-if="gasStations.length > 0">
        <ion-item
          v-for="gasStation in gasStations"
          :key="gasStation.id"
          button
          @click="openDetailsModal(gasStation)"
        >
          <ion-label>
            <h2>{{ gasStation.name }}</h2>
            <p>
              {{ gasStation.address.street }}
              {{ gasStation.address.houseNumber }}
            </p>
          </ion-label>

          <ion-label slot="end" class="ion-text-end">{{
            `${gasStation.distance.toFixed()}km`
          }}</ion-label>
        </ion-item>
      </ion-list>

      <p class="ion-padding-start ion-padding-end">
        <ion-button v-on:click="startFueling()" expand="block" fill="outline"
          >Plugin.startFuelingApp</ion-button
        >
      </p>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  modalController,
  isPlatform,
} from "@ionic/vue";
import { Plugins } from "@capacitor/core";
import { onMounted, ref, watch } from "vue";
import DetailsModal from "./DetailsModal.vue";
import { GasStation } from "cloud-sdk-capacitor-plugin";
import { mockGasStations } from "../mocks";
import { haversineDistance } from "../utils/coordinates";

/**
 * Adds a `distance` prop the GasStation results and sorts them on most nearby
 */
const withDistanceSorted = (
  results: GasStation[],
  userPosition: [number, number]
) =>
  results
    .map((result) => ({
      ...result,
      distance: haversineDistance(userPosition, result.coordinates[0]),
    }))
    .sort((a, b) => a.distance - b.distance);

export default {
  name: "List",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
  },

  setup() {
    const { CloudSDK, Geolocation } = Plugins;

    const userPosition = ref<[number, number]>();

    const gasStations = ref<GasStation[]>([]);

    function startFueling() {
      CloudSDK.startFuelingApp({
        poiId: "00281251-54cb-471b-bb1a-689604df2bf8",
      });
    }

    async function openDetailsModal(gasStation: GasStation) {
      if (!userPosition.value) return;

      const distance = haversineDistance(
        userPosition.value,
        gasStation.coordinates[0]
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
    }

    async function getUserPosition() {
      try {
        const response = await Geolocation.getCurrentPosition();
        userPosition.value = [
          response.coords.longitude,
          response.coords.latitude,
        ];
      } catch (err) {
        console.error(err);

        // @note only for demonstration purposes
        if (!isPlatform("desktop")) return;

        const defaultCenter: [number, number] = [5.886479, 51.000626];
        userPosition.value = defaultCenter;
      }
    }

    watch(userPosition, async (value) => {
      if (!value) return;

      try {
        const { results } = await CloudSDK.getNearbyGasStations({
          coordinate: [value[0], value[1]],
          radius: 25000,
        });

        gasStations.value = withDistanceSorted(results, value);
      } catch (err) {
        console.error(err);

        // @note since the plugin does not have a web implementation results are mocked
        if (!isPlatform("desktop")) return;

        const results = mockGasStations([value[0], value[1]]);

        gasStations.value = withDistanceSorted(results, value);
      }
    });

    onMounted(() => {
      getUserPosition();
    });

    return {
      getUserPosition,
      gasStations,
      openDetailsModal,
      startFueling,
    };
  },
};
</script>
