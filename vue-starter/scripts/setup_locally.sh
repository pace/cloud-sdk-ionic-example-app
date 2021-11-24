PLATFORM=$1

cd ../../../cloud-sdk-capacitor-plugin
npm install
npm run build
cd ../cloud-sdk-ionic-example-app/vue-starter
npm install ../../cloud-sdk-capacitor-plugin
npm run build
npx cap sync
npx cap open $PLATFORM