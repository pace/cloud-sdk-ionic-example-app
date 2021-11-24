# vue-starter

## Installation

1. Make a copy of `.env.example`, rename it to `.env`, and supply your own PACE and Mapbox API keys.
2. Run the following commands:

```
npm install
npm run build
npx cap sync
```

To open the app in XCode, run: `npx cap open ios`.

To open the app in Android Studio, run: `npx cap open android`.

## Local Installation

1. Clone the [Capacitor plugin project](https://github.com/pace/cloud-sdk-capacitor-plugin) into the **same** directory as the `cloud-sdk-ionic-example-app` repository. Your file structure should look something like this:
```
my_repositories  
└───cloud-sdk-ionic-example-app
│   └───vue-starter
│       │   ...
│   
└───cloud-sdk-capacitor-plugin
    │   ...
```
2. Make a copy of `.env.example`, rename it to `.env`, and supply your own PACE and Mapbox API keys.
3. Go to `/scripts`
4. Run `sh setup_locally android` or `sh setup_locally ios` to install the capacitor plugin locally and open the `vue-starter` project for the desired platform.

## After you made changes to the example app

If you made changes to any file in the `src` directory, you need to run `npm run build` and then either `npx cap copy ios` or `npx cap copy android` before you can see the changes in a simulator.

## After you updated the `cloud-sdk-capacitor-plugin` dependency

You need to run `npx cap sync` in order to install any changed dependencies. After that, you can run the commands noted above to make an app build, and copy the build files to the `ios` or `android` directory.