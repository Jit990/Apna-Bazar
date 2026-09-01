import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apnabazar.app',
  appName: 'Apna Bazar',
  webDir: 'public',

  server: {
    // IMPORTANT: Replace this with your actual Vercel production URL before building the APK!
    url: 'https://apna-bazar-seven.vercel.app',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#1A7850",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#ffffff",
    },
  },
};

export default config;
