import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { AuthService, UserInfo } from '../services/AuthService';

interface LoginScreenProps {
  onLoginSuccess: (userInfo: UserInfo) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const isSignedIn = await AuthService.isSignedIn();
      if (isSignedIn) {
        const userInfo = await AuthService.getUserInfo();
        if (userInfo) {
          onLoginSuccess(userInfo);
        }
      }
    } catch (error) {
      console.error('Check auth error:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const userInfo = await AuthService.signInWithGoogle();
      if (userInfo) {
        onLoginSuccess(userInfo);
      } else {
        alert('Sign in failed. Please try again.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.appName}>YT2700</Text>
        <Text style={styles.tagline}>YouTube Music Player</Text>

        <View style={styles.features}>
          <Text style={styles.featureText}>🎵 Search and play YouTube music</Text>
          <Text style={styles.featureText}>📂 Create custom playlists</Text>
          <Text style={styles.featureText}>💾 Download for offline playback</Text>
          <Text style={styles.featureText}>🚗 CarPlay & Android Auto support</Text>
        </View>

        <TouchableOpacity
          style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.signInButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Sign in with your Google account to access YouTube content
        </Text>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => onLoginSuccess({
            id: 'guest',
            email: 'guest@example.com',
            name: 'Guest User',
          })}
        >
          <Text style={styles.skipButtonText}>Continue as Guest (Limited Features)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#666',
    marginBottom: 48,
  },
  features: {
    marginBottom: 48,
    width: '100%',
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  skipButton: {
    marginTop: 24,
    padding: 12,
  },
  skipButtonText: {
    color: '#2196F3',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;
