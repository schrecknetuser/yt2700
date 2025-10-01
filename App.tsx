import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { MusicProvider } from './src/contexts/MusicContext';
import AppNavigator from './src/navigation/AppNavigator';
import { logConfigStatus } from './src/config/AppConfig';

export default function App() {
  useEffect(() => {
    // Log configuration status on app start
    logConfigStatus();
  }, []);

  return (
    <MusicProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </MusicProvider>
  );
}
