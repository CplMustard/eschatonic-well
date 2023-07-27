import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eschatonicwell.app',
  appName: 'eschatonic-well',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
