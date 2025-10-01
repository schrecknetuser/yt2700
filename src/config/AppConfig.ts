/**
 * Application Configuration
 * 
 * Central configuration file for the application.
 * In production, these values should come from environment variables.
 */

export const AppConfig = {
  // YouTube API Configuration
  youtube: {
    // Get your API key from: https://console.cloud.google.com/
    apiKey: process.env.YOUTUBE_API_KEY || '',
    apiBaseUrl: 'https://www.googleapis.com/youtube/v3',
    // Maximum results per search
    maxSearchResults: 25,
  },

  // Backend API Configuration (for downloading)
  backend: {
    // Your backend API URL for handling downloads
    apiUrl: process.env.BACKEND_API_URL || '',
    timeout: 30000, // 30 seconds
  },

  // Download Configuration
  download: {
    // Maximum concurrent downloads
    maxConcurrentDownloads: 3,
    // Default audio quality
    audioQuality: 'high', // 'low', 'medium', 'high'
    // Estimated size per track (in MB) for storage check
    estimatedTrackSize: 5,
  },

  // Playback Configuration
  playback: {
    // Auto-start playback when CarPlay connects
    autoStartOnCarPlay: true,
    // Auto-start playback when Android Auto connects
    autoStartOnAndroidAuto: true,
    // Resume last played track on app launch
    resumeLastTrack: false, // Set to false to prevent auto-play on app open
    // Seek step in seconds for forward/backward
    seekStep: 10,
  },

  // Storage Configuration
  storage: {
    // Maximum search history items
    maxSearchHistory: 10,
    // Cache duration in milliseconds (7 days)
    cacheDuration: 7 * 24 * 60 * 60 * 1000,
  },

  // UI Configuration
  ui: {
    // Theme colors
    colors: {
      primary: '#2196F3',
      secondary: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      success: '#4CAF50',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#666666',
    },
    // Default thumbnail for tracks without image
    defaultThumbnail: 'https://via.placeholder.com/300x300?text=No+Image',
  },

  // Feature Flags
  features: {
    // Enable/disable features
    enableDownload: true,
    enableCarPlay: false, // Set to true when CarPlay is implemented
    enableAndroidAuto: false, // Set to true when Android Auto is implemented
    enableOfflineMode: true,
    enableSocialSharing: false,
    enableAnalytics: false,
  },

  // App Info
  app: {
    name: 'YT2700',
    version: '1.0.0',
    description: 'YouTube Playlist Music Player',
    author: 'Your Name',
    website: 'https://github.com/schrecknetuser/yt2700',
    supportEmail: 'support@example.com',
  },
};

/**
 * Validate configuration
 */
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check YouTube API key if YouTube features are enabled
  if (!AppConfig.youtube.apiKey) {
    errors.push('YouTube API key is not configured. Search functionality will use mock data.');
  }

  // Check backend API URL if download is enabled
  if (AppConfig.features.enableDownload && !AppConfig.backend.apiUrl) {
    errors.push('Backend API URL is not configured. Download functionality will use mock implementation.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Log configuration status
 */
export const logConfigStatus = () => {
  const { valid, errors } = validateConfig();

  console.log('=== App Configuration ===');
  console.log(`App Name: ${AppConfig.app.name}`);
  console.log(`Version: ${AppConfig.app.version}`);
  console.log(`YouTube API: ${AppConfig.youtube.apiKey ? 'Configured' : 'Not configured (using mock)'}`);
  console.log(`Backend API: ${AppConfig.backend.apiUrl ? 'Configured' : 'Not configured (using mock)'}`);
  console.log(`CarPlay: ${AppConfig.features.enableCarPlay ? 'Enabled' : 'Disabled'}`);
  console.log(`Android Auto: ${AppConfig.features.enableAndroidAuto ? 'Enabled' : 'Disabled'}`);

  if (!valid) {
    console.warn('Configuration warnings:');
    errors.forEach(error => console.warn(`  - ${error}`));
  }

  console.log('========================');
};
