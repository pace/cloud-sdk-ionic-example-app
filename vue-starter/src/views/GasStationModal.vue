<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <div>
      <span>{{ gasStation.name }}</span>

      <ion-button :disabled="!canStartFueling" v-on:click="startFueling">
      </ion-button>
    </div>
  </ion-content>
</template>

<script>
import { defineComponent } from "@vue";
import { IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/vue";
import { Plugins } from "@capacitor/core";

export default defineComponent({
  name: "GasStationModal",
  props: {
    title: { type: String, default: "Modal" },
    gasStation: { type: Object, default: () => {} },
  },
  components: { IonContent, IonHeader, IonTitle, IonToolbar },
  setup(props) {
    const canStartFueling = ref(false);
    const { PaceSDK } = Plugins;

    /**
     * Checks if the gasStation is nearby enough to initiate the fueling flow
     */
    async function checkGasStationInRange() {
      const value = await PaceSDK.isPoiInRange(props.id);

      canStartFueling.value = value;
    }

    function startFueling() {
      if (!canStartFueling.value) {
        // @todo show error that gasStation is not nearby
      }

      PaceSDK.startApp(); // with which url?
    }

    onMounted(() => {
      checkGasStationInRange();
    });

    return {
      openGasStationApp,
      startFueling,
    };
  },
});
</script>
