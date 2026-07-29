import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl =
  process.env.CAPACITOR_SERVER_URL ||
  (process.env.CAPACITOR_DEV_SERVER === 'true' ? 'http://172.30.18.126:3000' : 'http://172.30.18.126:3000');

const config: CapacitorConfig = {
  appId: 'com.lms.frontend',
  appName: 'LMS App',
  webDir: 'out',
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith('http://'),
        },
      }
    : {}),
  plugins: {
    SplashScreen: {
      backgroundColor: "#000000",
      launchShowDuration: 3000,
      launchAutoHide: true,
      androidSplashResourceName: "splash"
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: "#171923",
      style: "DARK"
    }
  }
};

export default config;
