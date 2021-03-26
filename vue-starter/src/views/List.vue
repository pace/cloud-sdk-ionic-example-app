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

      <ion-list>
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
import { onMounted, reactive } from "vue";
import GasStationModal from "./GasStationModal.vue";

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
    const { PaceSDK } = Plugins;
    const gasStations = reactive<Map<string, GasStation>>(new Map());

    async function openGasStationModal(gasStation: GasStation) {
      const modal = await modalController.create({
        component: GasStationModal,
        cssClass: "my-custom-class",
        componentProps: {
          title: `${gasStation.brand} - Details`,
          gasStation,
        },
      });

      return modal.present();
    }

    onMounted(async () => {
      try {
        const results = await PaceSDK.listAvailableCoFuStations();

        results.forEach((result) => {
          gasStations.set(result.id, result);
        });
      } catch (err) {
        console.error(err);
      }
    });

    return {
      gasStations,
      openGasStationModal,
    };
  },
};
</script>
