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

      <ion-button
        v-if="!isLocationPermitted"
        v-on:click="requestLocationPermission"
      >
        Get Location
      </ion-button>

      <ion-list v-if="gasStations.length > 0">
        <ion-item v-bind:for="(gasStation, index) in gasStations">
          <ion-label v-on:click="openGasStationModal(gasStation)">{{
            gasStation.brand
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
  modalController,
} from "@ionic/vue";
import { Plugins } from "@capacitor/core";
import { onMounted, reactive, ref } from "vue";
import GasStationModal from "./GasStationModal.vue";
import { GasStation } from "cloud-sdk-capacitor-plugin";

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
  },

  setup() {
    const { CloudSDK, Geolocation } = Plugins;

    const isLocationPermitted = ref(false);
    const gasStations = reactive<Map<string, GasStation>>(new Map());

    async function getGasStations() {
      try {
        const { results } = await CloudSDK.listAvailableCoFuStations();

        results.forEach((result) => {
          gasStations.set(result.id, result);
        });
      } catch (err) {
        console.error(err);
      }
    }

    async function openGasStationModal(gasStation: GasStation) {
      const modal = await modalController.create({
        component: GasStationModal,
        componentProps: {
          title: `${gasStation.brand} - Details`,
          gasStation,
        },
      });

      return modal.present();
    }

    async function requestLocationPermission() {
      try {
        await Geolocation.getCurrentPosition();

        isLocationPermitted.value = true;

        getGasStations();
      } catch (err) {
        console.error(err);
      }
    }

    onMounted(() => {
      requestLocationPermission();
    });

    return {
      isLocationPermitted,
      gasStations,
      openGasStationModal,
    };
  },
};
</script>
