import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eschatonicwell.app',
  appName: 'eschatonic-well',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always',
  },
  backgroundColor: '#2d302f'
};

export default config;
