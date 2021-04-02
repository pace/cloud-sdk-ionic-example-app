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
            formatDistance(gasStation.coordinates[0])
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
  isPlatform,
} from "@ionic/vue";
import { Plugins } from "@capacitor/core";
import { onMounted, ref, watch } from "vue";
import DetailsModal from "./DetailsModal.vue";
import { GasStation } from "cloud-sdk-capacitor-plugin";
import { mockGasStations } from "../mocks";
import { haversineDistance } from "../utils/coordinates";

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
      const modal = await modalController.create({
        component: DetailsModal,
        componentProps: {
          title: gasStation.name,
          gasStation,
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

    function formatDistance(coordinate: [number, number]) {
      if (!userPosition.value) return;

      const distance = haversineDistance(userPosition.value, coordinate);

      return `${distance.toFixed()}km`;
    }

    watch(userPosition, async (value) => {
      if (!value) return;

      try {
        const { results } = await CloudSDK.getNearbyGasStations({
          coordinate: [value[0], value[1]],
          radius: 25000,
        });

        gasStations.value = [...results];
      } catch (err) {
        console.error(err);

        // @note since the plugin does not have a web implementation results are mocked
        if (!isPlatform("desktop")) return;

        const results = mockGasStations([value[0], value[1]]);
        gasStations.value = [...results];
      }
    });

    onMounted(() => {
      getUserPosition();
    });

    return {
      getUserPosition,
      gasStations,
      openDetailsModal,
      formatDistance,
    };
  },
};
</script>
