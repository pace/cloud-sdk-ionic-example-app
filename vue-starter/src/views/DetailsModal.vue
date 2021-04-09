<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div>
        {{ `${distance.toFixed()}km` }}

        <div>
          <ion-button :disabled="!canStartFueling" v-on:click="startFueling">
            Start fueling
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  alertController,
} from "@ionic/vue";
import { Plugins } from "@capacitor/core";
import { GasStation } from "cloud-sdk-capacitor-plugin";

export default defineComponent({
  name: "DetailsModal",
  props: {
    title: { type: String, default: "Modal", required: true },
    distance: { type: Number, required: true },
    gasStation: { type: Object as PropType<GasStation>, required: true },
  },
  components: { IonPage, IonContent, IonHeader, IonTitle, IonToolbar },
  setup(props) {
    const canStartFueling = ref(false);
    const { CloudSDK } = Plugins;

    /**
     * Checks if the gasStation is nearby enough to initiate the fueling flow
     */
    async function checkGasStationInRange() {
      try {
        const { result } = await CloudSDK.isPoiInRange({
          poiId: props.gasStation.id,
        });

        canStartFueling.value = result;
      } catch (err) {
        console.error(err);
      }
    }

    async function startFueling() {
      if (!canStartFueling.value) {
        const alert = await alertController.create({
          header: "Not close enough",
          message: "You need to move closer to the pump to start fueling",
          buttons: ["Ok"],
        });
        return alert.present();
      }

      CloudSDK.startFuelingApp({ poiId: props.gasStation.id });
    }

    onMounted(() => {
      checkGasStationInRange();
    });

    return {
      canStartFueling,
      startFueling,
    };
  },
});
</script>
