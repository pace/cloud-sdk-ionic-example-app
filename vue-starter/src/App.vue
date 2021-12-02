<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { Plugins } from "@capacitor/core";
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import {Environment, AuthenticationMode} from "cloud-sdk-capacitor-plugin";
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
        authenticationMode: AuthenticationMode.NATIVE,
        isRedirectSchemeCheckEnabled: false,
        enableLogging: true,
      };

      try {
        CloudSDK.setup(config);
        const token = '';
        CloudSDK.addListener('TOKEN_INVALID', (data: any) => {
          const ID = data.id;
          console.log(ID);

          CloudSDK.respondToEvent({name: 'TOKEN_INVALID', id: ID, value: token})
        });
      } catch (err) {
        console.error(err);
      }
    });
  },
});
</script>