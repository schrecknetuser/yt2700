import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { MusicProvider } from './src/contexts/MusicContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { logConfigStatus } from './src/config/AppConfig';
import { UserInfo } from './src/services/AuthService';

export default function App() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Log configuration status on app start
    logConfigStatus();
  }, []);

  const handleLoginSuccess = (user: UserInfo) => {
    setUserInfo(user);
  };

  if (!userInfo) {
    return (
      <>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <MusicProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </MusicProvider>
  );
}
