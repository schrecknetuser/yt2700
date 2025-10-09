# YT2700 - YouTube Music Player for iOS with CarPlay

A comprehensive iOS application for managing and playing YouTube music playlists with full CarPlay integration.

## Features

### Core Functionality
- **YouTube Integration**: Simple sign-in with your Google account - no developer setup required
  - One-time authentication through the Settings screen
  - Automatic access to YouTube search and playlists
  - No need to manually configure API keys or modify code
- **Offline Playback**: Download tracks to local storage for playback without internet connection
- **Custom Playlists**: Create and manage your own playlists
- **Smart Playback**: 
  - Shuffle play with automatic reshuffling between cycles
  - Repeat mode for continuous playback
  - Auto-resume from last played track when connected to CarPlay

### Library Management
The app includes a comprehensive library with three tabs:

1. **Tracks Tab**
   - View all tracks sorted by name
   - Multi-select support
   - Search and filter capabilities
   - "Shuffle Play All" button

2. **Authors Tab**
   - Browse all artists in your library
   - View track count per artist
   - Click to see all tracks by an artist
   - Sort by date or name

3. **Playlists Tab**
   - View all user-created playlists
   - Click to open and play playlists
   - Create new playlists

### Settings & Account Management
- **YouTube Account**: Sign in once with your Google account
  - OAuth authentication for secure access
  - View connection status and connected email
  - Disconnect option available
  - Credentials stored securely in Keychain
- **Download Settings**: Configure audio quality and auto-download preferences
- **Storage Management**: View usage and clear downloads when needed

### Track Actions
Available actions for selected tracks:
- **Play Now**: Replace current queue and start playing
- **Play Next**: Insert tracks after currently playing track
- **Add to Playlist**: Add to existing or new playlist
- **Add to Library**: Save tracks for offline access
- **Delete from Library**: Remove tracks from local storage

### Search Functionality
- **Intelligent Search**: 
  - When signed in: Search YouTube's entire catalog
  - When offline: Search local library only
  - Visual indicator shows YouTube connection status
- Search bar with autocomplete
- Last 10 searches history for quick access
- Search results split into:
  - Authors matching search term
  - Tracks matching search term
- Tracks already in library displayed in different color
- Multi-select support for batch actions
- Error handling with user-friendly messages

### Now Playing Screen
- Current track display with name and author
- Playback position slider with seek capability
- Control buttons:
  - Previous track
  - Play/Pause
  - Next track
  - Shuffle toggle
  - Repeat toggle
- Queue view with drag-and-drop reordering
- Real-time position updates

### CarPlay Integration
Full CarPlay support including:
- Auto-start playback from last track when connected
- Library browsing
- Playlist access
- Now Playing controls
- Shuffle and repeat controls
- Background audio playback

## Technical Details

### Architecture
- **SwiftUI**: Modern declarative UI framework
- **Core Data**: Local persistence for tracks, playlists, and search history
- **AVFoundation**: Audio playback engine
- **MediaPlayer**: Lock screen and Control Center integration
- **CarPlay Framework**: Full CarPlay template integration

### Requirements
- iOS 16.0 or later
- Xcode 15.0 or later
- Swift 5.0 or later

### Project Structure
```
YT2700/
├── YT2700App.swift           # App entry point
├── Models/                   # Data models
│   ├── Track.swift
│   ├── Author.swift
│   ├── Playlist.swift
│   └── YT2700DataModel.xcdatamodeld
├── Views/                    # SwiftUI views
│   ├── ContentView.swift
│   ├── LibraryView.swift
│   ├── SearchView.swift
│   └── NowPlayingView.swift
├── Services/                 # Business logic
│   ├── AudioPlayerService.swift
│   └── PersistenceController.swift
├── CarPlay/                  # CarPlay integration
│   └── CarPlaySceneDelegate.swift
└── Resources/                # Assets and resources
    └── Assets.xcassets
```

## Getting Started

### Building the Project
1. Open `YT2700.xcodeproj` in Xcode
2. Select your target device or simulator
3. Build and run (⌘R)

### Running on Device
To test CarPlay functionality:
1. Configure a development provisioning profile with CarPlay entitlements
2. Connect your iOS device
3. Build and install the app
4. Connect to a CarPlay-enabled system or use CarPlay simulator in Xcode

### Configuration
The app requires the following entitlements:
- `com.apple.developer.carplay-audio`: CarPlay audio support
- `com.apple.developer.playable-content`: Playable content API

Background modes enabled:
- `audio`: Background audio playback

## Development

### Adding New Features
The app is designed with extensibility in mind:
- Add new views in the `Views/` directory
- Extend models in the `Models/` directory
- Add new services in the `Services/` directory

### YouTube Integration
The current implementation includes placeholder search functionality. To integrate with YouTube:
1. Implement YouTube Data API v3 integration
2. Add OAuth authentication for YouTube account access
3. Implement video-to-audio extraction using third-party services
4. Add download manager for offline storage

### Data Persistence
Core Data is used for:
- Track metadata and library management
- Playlist creation and management
- Search history tracking

Downloaded audio files are stored in the app's Documents directory.

## Testing

### Unit Testing
The project structure supports unit testing for:
- Audio player logic
- Data persistence
- Playlist management

### CarPlay Testing
Test CarPlay integration using:
- Xcode CarPlay simulator
- Physical CarPlay-enabled vehicle
- CarPlay-enabled head unit

## Known Limitations
- YouTube integration requires third-party implementation
- Audio download functionality needs implementation
- App icons need to be added to Assets.xcassets

## Future Enhancements
- [ ] Full YouTube API integration
- [ ] Download manager with progress tracking
- [ ] Audio format conversion
- [ ] Lyrics display
- [ ] Social sharing features
- [ ] Cross-device sync via iCloud
- [ ] Equalizer and audio effects
- [ ] Sleep timer
- [ ] Podcast support

## License
Copyright © 2024. All rights reserved.

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)**: Step-by-step guide to get started with the app
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Detailed technical architecture and design
- **[TODO.md](TODO.md)**: Comprehensive checklist for implementing YouTube integration

## Support
For issues and feature requests, please create an issue in the repository.
