import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pdfimagesuite.app',
  appName: 'PDF & Image Suite',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'ais-dev-hji562mgv4l6gn7t3kyq3w-428076052372.europe-west2.run.app',
      'ais-pre-hji562mgv4l6gn7t3kyq3w-428076052372.europe-west2.run.app'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4f46e5',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'large',
      spinnerColor: '#ffffff'
    }
  }
};

export default config;
