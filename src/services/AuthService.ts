import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_OAUTH_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_OAUTH_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@yt2700_access_token',
  REFRESH_TOKEN: '@yt2700_refresh_token',
  TOKEN_EXPIRY: '@yt2700_token_expiry',
  USER_INFO: '@yt2700_user_info',
};

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export class AuthService {
  private static redirectUri = AuthSession.makeRedirectUri({
    scheme: 'yt2700',
    path: 'redirect',
  });

  /**
   * Sign in with Google using OAuth
   */
  static async signInWithGoogle(): Promise<UserInfo | null> {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_OAUTH_CLIENT_ID,
        scopes: [
          'openid',
          'profile',
          'email',
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/youtube.force-ssl',
        ],
        redirectUri: this.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        extraParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      });

      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        const { code } = result.params;
        
        // Exchange code for tokens
        const tokens = await this.exchangeCodeForTokens(code, request.codeVerifier!);
        
        if (tokens) {
          await this.storeTokens(tokens);
          
          // Get user info
          const userInfo = await this.fetchUserInfoFromGoogle(tokens.accessToken);
          if (userInfo) {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
            return userInfo;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Sign in error:', error);
      return null;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  private static async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<AuthTokens | null> {
    try {
      const response = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_OAUTH_CLIENT_ID,
          client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
          code_verifier: codeVerifier,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        };
      }

      return null;
    } catch (error) {
      console.error('Token exchange error:', error);
      return null;
    }
  }

  /**
   * Fetch user information from Google
   */
  private static async fetchUserInfoFromGoogle(accessToken: string): Promise<UserInfo | null> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.id) {
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          picture: data.picture,
        };
      }

      return null;
    } catch (error) {
      console.error('Get user info error:', error);
      return null;
    }
  }

  /**
   * Store authentication tokens
   */
  private static async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      
      if (tokens.refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      }
      
      const expiryTime = Date.now() + tokens.expiresIn * 1000;
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    } catch (error) {
      console.error('Store tokens error:', error);
    }
  }

  /**
   * Get stored access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const expiry = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

      if (!token || !expiry) {
        return null;
      }

      // Check if token is expired
      if (Date.now() >= parseInt(expiry)) {
        // Try to refresh token
        return await this.refreshAccessToken();
      }

      return token;
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private static async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        return null;
      }

      const response = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: GOOGLE_OAUTH_CLIENT_ID,
          client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
          grant_type: 'refresh_token',
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        const tokens: AuthTokens = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
          expiresIn: data.expires_in,
        };
        await this.storeTokens(tokens);
        return data.access_token;
      }

      return null;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }

  /**
   * Get stored user info
   */
  static async getUserInfo(): Promise<UserInfo | null> {
    try {
      const userInfoStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch (error) {
      console.error('Get user info error:', error);
      return null;
    }
  }

  /**
   * Check if user is signed in
   */
  static async isSignedIn(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // Revoke token
      if (token) {
        await fetch(discovery.revocationEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token,
          }).toString(),
        });
      }

      // Clear stored data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.TOKEN_EXPIRY,
        STORAGE_KEYS.USER_INFO,
      ]);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
}
