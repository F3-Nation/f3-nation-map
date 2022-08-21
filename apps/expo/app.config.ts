import type { ExpoConfig } from "expo/config";

import type { EasExtra } from "~/utils/types";

const versionCode = 5;

const extra: EasExtra = {
  eas: {
    // TODO PUBLISH: Change this to your own EAS project ID
    projectId: "9ae04bbe-5ef6-4ea9-b148-ac984152b1b4",
  },
  apiUrl:
    // https://docs.expo.dev/build-reference/variables/#setting-plaintext-environment-variables-in-easjson
    process.env.EXPO_PUBLIC_API_URL ?? "http://create-t3-turbo-jade.vercel.app",
};

const defineConfig = (): ExpoConfig => ({
  name: process.env.APP_NAME ?? "t3template",
  slug: "t3template",
  scheme: "t3template",
  version: "0.1.0",
  owner: "mountain_dev",
  orientation: "portrait",
  icon: process.env.APP_ICON ?? "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#1F104A",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    config: {
      usesNonExemptEncryption: false,
    },
    bundleIdentifier: "com.mountaindev.t3template",
    buildNumber: versionCode.toString(),
  },
  android: {
    package: "com.mountaindev.t3template",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#1F104A",
    },
    versionCode,
  },
  extra,
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: ["expo-router"],
});

export default defineConfig;
