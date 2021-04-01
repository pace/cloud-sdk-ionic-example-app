<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div>
        <span>{{ gasStation.name }}</span>

        <ion-button :disabled="!canStartFueling" v-on:click="startFueling">
          Begin met
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from "vue";
import { IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/vue";
import { Plugins } from "@capacitor/core";
import { GasStation } from "cloud-sdk-capacitor-plugin";

export default defineComponent({
  name: "DetailsModal",
  props: {
    title: { type: String, default: "Modal", required: true },
    gasStation: { type: Object as PropType<GasStation>, required: true },
  },
  components: { IonContent, IonHeader, IonTitle, IonToolbar },
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

    function startFueling() {
      if (!canStartFueling.value) {
        // @todo show error that gasStation is not nearby
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
