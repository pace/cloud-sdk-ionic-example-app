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
        <ion-item v-bind:for="(gasStation, index) in gasStations">
          <ion-label v-on:click="openDetailsModal(gasStation)">{{
            gasStation.name
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
import { Plugins, GeolocationPosition } from "@capacitor/core";
import { onMounted, reactive, ref, watch } from "vue";
import DetailsModal from "./DetailsModal.vue";
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
    IonLabel,
    IonButton,
  },

  setup() {
    const { CloudSDK, Geolocation } = Plugins;

    const position = ref<GeolocationPosition>();

    const gasStations = reactive<Map<string, GasStation>>(new Map());

    async function openDetailsModal(gasStation: GasStation) {
      const modal = await modalController.create({
        component: DetailsModal,
        componentProps: {
          title: `${gasStation.name} - Details`,
          gasStation,
        },
      });

      return modal.present();
    }

    async function getUserPosition() {
      try {
        const response = await Geolocation.getCurrentPosition();
        position.value = response;
      } catch (err) {
        console.error(err);
      }
    }

    onMounted(() => {
      getUserPosition();
    });

    watch(position, async (value) => {
      if (!value) return;

      const { coords } = value;

      try {
        const { results } = await CloudSDK.getNearbyGasStations({
          coordinate: [coords.longitude, coords.latitude],
          radius: 250000,
        });

        results.forEach((result) => {
          gasStations.set(result.id, result);
        });
      } catch (err) {
        console.error(err);
      }
    });

    return {
      getUserPosition,
      gasStations,
      openDetailsModal,
    };
  },
};
</script>
