<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { Plugins } from "@capacitor/core";
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { Environment } from "cloud-sdk-capacitor-plugin";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
  },
  setup() {
    const { CloudSDK } = Plugins;

    onMounted(() => {
      const config = {
        apiKey: process.env.VUE_APP_CLOUD_SDK_API_KEY,
        environment: Environment.SANDBOX,
      };

      try {
        CloudSDK.setup(config);
      } catch (err) {
        console.error(err);
      }
    });
  },
});
</script>
