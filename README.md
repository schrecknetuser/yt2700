# YT2700 - YouTube Playlist Music Player

A cross-platform mobile application for iOS and Android that allows users to create, manage, and play playlists of YouTube videos and music with offline support.

## Features

### 🔐 Authentication
- **Google OAuth Sign-In**: Secure login with your Google account
- **YouTube API Access**: Full access to YouTube content with proper authentication
- **Guest Mode**: Limited functionality for users who prefer not to sign in
- **Profile Management**: View account information and sign out

### 📚 Library Management
- **Three-tab library view:**
  - **Tracks Tab**: View all tracks sorted by name with search functionality
  - **Authors Tab**: Browse all artists in your library
  - **Playlists Tab**: Access your custom playlists
- Multi-select support with action controls (Play Now, Play Next, Add to Playlist, Delete)
- Shuffle Play All functionality
- Color-coded tracks (library tracks shown differently)

### 🔍 Track Discovery
- **Real YouTube Integration**: Search for tracks and authors using YouTube Data API
- **OAuth-Authenticated Search**: Access your YouTube playlists and history
- View search history (last 10 searches)
- Search results display tracks with clear indicators for already downloaded content
- Multi-select from search results
- Add tracks to library or playlists directly from search

### 🎵 Playback
- **Real Audio Playback**: Play audio using Expo AV
- **Background Audio**: Continue playback when app is in background
- Full playback control (Play, Pause, Next, Previous)
- Queue management with visual display
- Shuffle and repeat modes
- Progress tracking with seek functionality
- Auto-start from last played track
- Automatic playlist reshuffling when repeat is enabled
- Real-time playback status updates

### 👤 Author Details
- View all tracks by a specific author
- Sort by name or date
- Search within author's tracks
- Multi-select and action controls

### 📝 Playlist Management
- Create custom playlists
- Add tracks to playlists
- View playlist contents
- Multi-select support

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack and Bottom Tabs)
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data persistence
- **Audio Playback**: Expo AV with background audio support
- **Authentication**: Google OAuth 2.0 with expo-auth-session
- **YouTube Integration**: YouTube Data API v3 with OAuth scopes

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── TrackItem.tsx
│   └── ActionBar.tsx
├── screens/         # Application screens
│   ├── LoginScreen.tsx
│   ├── LibraryScreen.tsx
│   ├── AddTracksScreen.tsx
│   ├── NowPlayingScreen.tsx
│   ├── AuthorDetailScreen.tsx
│   ├── PlaylistDetailScreen.tsx
│   └── SettingsScreen.tsx
├── contexts/        # React Context providers
│   └── MusicContext.tsx
├── services/        # Business logic and API services
│   ├── AuthService.ts
│   ├── AudioService.ts
│   ├── StorageService.ts
│   ├── YouTubeService.ts
│   └── DownloadService.ts
├── models/          # TypeScript interfaces and types
│   └── Track.ts
├── config/          # Application configuration
│   └── AppConfig.ts
└── navigation/      # Navigation configuration
    └── AppNavigator.tsx
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone https://github.com/schrecknetuser/yt2700.git
cd yt2700
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your credentials:
# - YOUTUBE_API_KEY: Get from Google Cloud Console
# - EXPO_PUBLIC_GOOGLE_CLIENT_ID: OAuth client ID
# - EXPO_PUBLIC_GOOGLE_CLIENT_SECRET: OAuth client secret
```

4. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run ios      # iOS Simulator (Mac only)
npm run android  # Android Emulator
npm run web      # Web browser
```

## Future Enhancements

### To Be Implemented:
1. **YouTube Integration**: 
   - Actual YouTube Data API integration
   - OAuth authentication
   - Real search functionality

2. **Offline Support**:
   - Track downloading using youtube-dl or similar
   - Local file system management
   - Download progress tracking

3. **CarPlay & Android Auto**:
   - CarPlay integration for iOS
   - Android Auto integration for Android
   - Auto-start playback when connected

4. **Enhanced Playback**:
   - Real audio playback using Expo AV
   - Background audio support
   - Lock screen controls
   - Audio focus management

5. **Additional Features**:
   - Playlist sharing
   - Import/export functionality
   - Lyrics support
   - Equalizer
   - Sleep timer

## Development Notes

### Current Implementation Status:
- ✅ Project structure and navigation
- ✅ Data models and TypeScript interfaces
- ✅ Local storage service
- ✅ Music context with full state management
- ✅ Library screen with three tabs
- ✅ Add tracks screen with search
- ✅ Now playing screen with queue
- ✅ Author detail screen
- ✅ Playlist detail screen
- ✅ Multi-select functionality
- ✅ Action bar for bulk operations
- ⏳ YouTube API integration (mock implementation)
- ⏳ Actual audio playback
- ⏳ Track downloading
- ⏳ CarPlay integration
- ⏳ Android Auto integration

### Mock Services:
The current implementation includes mock services for:
- YouTube search (returns sample data)
- Track downloading (logs action but doesn't download)
- Audio playback (state management only, no actual audio)

To implement production features:
1. Add YouTube Data API key in `YouTubeService.ts`
2. Implement actual audio playback in `MusicContext.tsx`
3. Add download functionality using youtube-dl
4. Integrate react-native-carplay and react-native-android-auto

## Contributing

This is a personal project, but suggestions and contributions are welcome.

## License

MIT License
