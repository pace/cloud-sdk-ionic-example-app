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


## Manual adjustments - Android

There are several adjustments to be made manually in order to get it running on Android:
* In project level `build.gradle` file: Set version in this line `classpath 'com.android.tools.build:gradle:$version'` to `7.0.3`

* In module (android.capacitor-cordova-android-plugins) level `build.gradle` file: Set the `targetSdkVersion` like this:
  `targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 29`

* In `gradle-wrapper-properties` change `distributionUrl` to: `distributionUrl=https\://services.gradle.org/distributions/gradle-7.3-all.zip
  `

* In `variables.gradle` set `compileSDKVersion` and `targetSDKVersion` to 31

* In App's `AndroidManifest` add `android:exported = "true"` to `MainActivity`

<img width="800" alt="Screenshot 2021-11-24 at 14 36 22" src="https://user-images.githubusercontent.com/38315701/143467845-3e9323cc-8ae8-476a-aae0-7a26f69743b5.png">

* In `capacitor-android`'s `AndroidManifest` add `android:exported = "false"` to `CapacitorFirebaseMessagingService`

<img width="900" alt="Screenshot" src = "https://user-images.githubusercontent.com/38315701/143468088-984265dc-0d13-48ec-9ea6-c748665f2a91.png">

* In `Preferences` set Gradle JDK to 11

<img width="600" alt="Screenshot" src = "https://user-images.githubusercontent.com/38315701/143468535-60ea0fa6-8c01-4d4d-86aa-52ed0e455a6d.png">


## After you made changes to the example app

If you made changes to any file in the `src` directory, you need to run `npm run build` and then either `npx cap copy ios` or `npx cap copy android` before you can see the changes in a simulator.


## After you updated the `cloud-sdk-capacitor-plugin` dependency

You need to run `npx cap sync` in order to install any changed dependencies. After that, you can run the commands noted above to make an app build, and copy the build files to the `ios` or `android` directory.