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
            `${gasStation.distance.toFixed(1)}km`
          }}</ion-label>
        </ion-item>
      </ion-list>
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
} from "@ionic/vue";
import { Plugins } from "@capacitor/core";
import { onMounted, ref, watch } from "vue";
import DetailsModal from "./DetailsModal.vue";
import { GasStation } from "cloud-sdk-capacitor-plugin";
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
      distance: haversineDistance(userPosition, result.coordinates),
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

    async function openDetailsModal(gasStation: GasStation) {
      if (!userPosition.value) return;

      const distance = haversineDistance(
        userPosition.value,
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
    }

    async function getUserPosition() {
      try {
        const response = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
        });

        userPosition.value = [
          response.coords.longitude,
          response.coords.latitude,
        ];
      } catch (err) {
        console.error(err);
      }
    }

    watch(userPosition, async (value) => {
      if (!value) return;

      try {
        const response = await CloudSDK.getNearbyGasStations({
          coordinate: [value[0], value[1]],
          radius: 10000,
        });

        gasStations.value = withDistanceSorted(response.results, value);
      } catch (err) {
        console.error(err);
      }
    });

    onMounted(() => {
      getUserPosition();
    });

    return {
      getUserPosition,
      gasStations,
      openDetailsModal,
    };
  },
};
</script>
