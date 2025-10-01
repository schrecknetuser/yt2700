# Quick Start Guide

Get up and running with YT2700 in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- iOS Simulator (Mac only) or Android Emulator
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/schrecknetuser/yt2700.git
cd yt2700

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm start
```

## Running the App

After `npm start`, you'll see options to:

- Press `i` - Run on iOS Simulator (Mac only)
- Press `a` - Run on Android Emulator
- Press `w` - Run in web browser
- Scan QR code with Expo Go app on your phone

## First Time Setup

1. **Open the app** - You'll see the Library screen
2. **Add some tracks** - Tap the + button to search (mock data)
3. **Create a playlist** - Go to Playlists tab, tap "Create New Playlist"
4. **Start playing** - Select tracks and tap "Play Now"

## Key Features to Try

### Library Screen
- Switch between Tracks, Authors, and Playlists tabs
- Long-press any track to enter selection mode
- Select multiple tracks and use action buttons
- Tap "Shuffle Play All" to play all tracks

### Add Tracks Screen
- Tap the + button on Library screen
- Enter a search term (returns mock data)
- Long-press tracks to select multiple
- Add to library or playlists

### Now Playing Screen
- See current track and controls
- View upcoming queue
- Toggle shuffle and repeat modes

### Author Detail
- Tap any author in Library
- See all tracks by that author
- Sort by name or date
- Search within author's tracks

### Playlist Detail
- Tap any playlist
- View all tracks in playlist
- Multi-select and manage tracks

## Common Actions

### Play Tracks
```
1. Go to Library > Tracks
2. Long-press a track
3. Select more tracks (optional)
4. Tap "Play Now"
```

### Create Playlist
```
1. Go to Library > Playlists
2. Tap "Create New Playlist"
3. Enter a name
4. Add tracks from Library or Search
```

### Shuffle All
```
1. Go to Library > Tracks
2. Tap "Shuffle Play All"
```

## Testing

```bash
# Run all tests
npm test

# Type checking
npx tsc --noEmit
```

## Mock Data

Currently, the app uses mock data for:
- YouTube search results
- Track downloads
- Audio playback (state only)

This allows you to test the UI and features without external services.

## Configuration

To configure for production:

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to `.env`:
   ```
   YOUTUBE_API_KEY=your_key_here
   BACKEND_API_URL=your_backend_url
   ```

3. Update `src/config/AppConfig.ts` as needed

## Project Structure

```
src/
├── screens/          # Main app screens
├── components/       # Reusable UI components
├── contexts/         # State management
├── services/         # Business logic
├── models/           # TypeScript types
├── navigation/       # Route configuration
└── config/           # App settings
```

## Troubleshooting

**Metro bundler won't start:**
```bash
npx expo start -c
```

**iOS build fails:**
```bash
cd ios && pod install && cd ..
```

**Android build fails:**
```bash
cd android && ./gradlew clean && cd ..
```

**Dependency issues:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Next Steps

- Read [README.md](README.md) for detailed features
- Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for architecture
- See [DEPLOYMENT.md](DEPLOYMENT.md) for building apps
- Review [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Support

- 📖 [Documentation](README.md)
- 🐛 [Report Issues](https://github.com/schrecknetuser/yt2700/issues)
- 💬 [Discussions](https://github.com/schrecknetuser/yt2700/discussions)

## Features Overview

✅ **Working Now:**
- Library with tracks, authors, playlists
- Search with history
- Multi-select operations
- Playlist management
- Playback controls (UI only)
- Queue management
- Shuffle and repeat modes

🚧 **Coming Soon:**
- Real YouTube API integration
- Actual audio playback
- Download functionality
- CarPlay support
- Android Auto support

Happy coding! 🎵
