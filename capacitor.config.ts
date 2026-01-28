import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.denttrack.app',
  appName: 'DentTrack',
  webDir: 'dist',
  server: {
    // For development - allows loading from dev server
    // Remove or comment out for production builds
    // url: 'http://localhost:3000',
    // cleartext: true
  },
  ios: {
    scheme: 'DentTrack',
    contentInset: 'automatic',
    // Allow inline media playback
    allowsLinkPreview: true,
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f8fafc',
      showSpinner: false,
    },
  },
};

export default config;
