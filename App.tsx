import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MusicProvider } from './src/contexts/MusicContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <MusicProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </MusicProvider>
  );
}
