<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div>
        <ion-grid>
          <ion-row>
            <ion-col>
              <h6 class="ion-no-margin">Address</h6>
              <div class="ion-margin-bottom">
                {{ gasStation.address.street }}<br />
                {{ gasStation.address.houseNumber }},
                {{ gasStation.address.zipCode }}
                {{ gasStation.address.city }}
              </div>
            </ion-col>
            <ion-col>
              <h6 class="ion-no-margin ion-text-right">Distance</h6>
              <div class="ion-margin-bottom ion-text-right">
                {{ `${distance.toFixed(1)}km` }}
              </div>
            </ion-col>
          </ion-row>

          <ion-row>
            <ion-col>
              <h6 class="ion-no-margin">Opening Hours</h6>

              <table
                v-if="gasStation.openingHours.length"
                class="opening-hours-table ion-margin-bottom"
              >
                <tbody>
                  <tr
                    v-for="dayHours in gasStation.openingHours"
                    v-bind:key="dayHours.day"
                  >
                    <td>
                      <span class="ion-text-capitalize">{{
                        dayHours.day
                      }}</span>
                    </td>
                    <td>
                      <div
                        v-for="(hours, index) in dayHours.hours"
                        v-bind:key="index"
                        class="ion-text-right"
                      >
                        {{ hours[0] }} - {{ hours[1] }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="ion-margin-bottom">Not available</div>
            </ion-col>
          </ion-row>

          <ion-row>
            <ion-col>
              <h6 class="ion-no-margin">Fuel Prices</h6>

              <table
                v-if="gasStation.fuelPrices.length"
                class="opening-hours-table ion-margin-bottom"
              >
                <tbody>
                  <tr
                    v-for="fuelPrice in gasStation.fuelPrices"
                    v-bind:key="fuelPrice.productName"
                  >
                    <td>
                      <span class="ion-text-capitalize">{{
                        fuelPrice.productName
                      }}</span>
                    </td>
                    <td>
                      <div class="ion-text-right">
                        {{ fuelPrice.currency }} {{ fuelPrice.price }}/{{
                          fuelPrice.unit
                        }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="ion-margin-bottom">Not available</div>
            </ion-col>
          </ion-row>
        </ion-grid>

        <div class="ion-padding-top">
          <ion-button
            :disabled="!canStartFueling"
            v-on:click="startFueling"
            expand="block"
          >
            Start Fueling
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.opening-hours-table {
  width: 100%;
  table-layout: fixed;
}
</style>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
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
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
  },
  setup(props) {
    const canStartFueling = ref(false);
    const { CloudSDK, Geolocation } = Plugins;

    async function getUserPosition(): Promise<[number, number]> {
      try {
        const response = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
        });

        return [
          response.coords.longitude,
          response.coords.latitude,
        ];
      } catch (err) {
        console.error(err);
        throw new Error("Couldn't retrieve location");
      }
    }

    /**
     * Checks if the gasStation is nearby enough to initiate the fueling flow
     */
    async function checkGasStationInRange() {
      try {
        const userPosition = await getUserPosition()
        const { result } = await CloudSDK.isPoiInRange({
          poiId: props.gasStation.id,
          coordinate: [userPosition[0], userPosition[1]],
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

      console.log(props.gasStation);
    });

    return {
      getUserPosition,
      canStartFueling,
      startFueling,
    };
  },
});
</script>
