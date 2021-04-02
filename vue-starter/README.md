# vue-starter

## Installation

First, make a copy of `.env.example`, rename it to `.env`, and supply your own PACE and Mapbox API keys.

Then, run the following commands:

```
npm install
npm run build
npx cap sync
```

To open the app in XCode, run: `npx cap open ios`.

To open the app in Android Studio, run: `npx cap open android`.

## After you made changes to the example app

If you made changes to any file in the `src` directory, you need to run `npm run build` and then either `npx cap copy ios` or `npx cap copy android` before you can see the changes in a simulator.

## After you updated the `cloud-sdk-capacitor-plugin` dependency

You need to run `npx cap sync` in order to install any changed dependencies. After that, you can run the commands noted above to make an app build, and copy the build files to the `ios` or `android` directory.
