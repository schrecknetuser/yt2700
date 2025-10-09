# YT2700 App Architecture

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        YT2700App                             │
│                    (Main Entry Point)                        │
│                                                              │
│  • Initializes PersistenceController (Core Data)            │
│  • Initializes AudioPlayerService (Singleton)               │
│  • Sets up Environment Objects                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      ContentView                             │
│                   (TabView Container)                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Library Tab │  │  Search Tab  │  │Now Playing   │      │
│  │              │  │              │  │    Tab       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Library View Structure

```
LibraryView
│
├── Tracks Tab
│   ├── "Shuffle Play All" Button
│   ├── Track List (with multi-select)
│   │   ├── Track Name
│   │   ├── Author Name
│   │   └── Duration
│   └── Action Controls
│       ├── Play Now
│       ├── Play Next
│       ├── Add to Playlist
│       └── Delete from Library
│
├── Authors Tab
│   └── Author List
│       ├── Author Name
│       ├── Track Count
│       └── Navigation to Author Detail
│           ├── Sort Controls (Date/Name)
│           ├── Search Bar
│           └── Filtered Track List
│
└── Playlists Tab
    ├── "Create Playlist" Button
    └── Playlist List
        ├── Playlist Name
        ├── Track Count
        └── Navigation to Playlist Detail
            ├── "Shuffle Play" Button
            └── Track List
```

## Search View Structure

```
SearchView
│
├── Search Bar
├── Search History (when not searching)
│   └── Last 10 Searches (clickable)
│
└── Search Results (when searching)
    ├── Authors Section
    │   ├── Author Name
    │   ├── Track Count
    │   └── Link to Author Detail
    │
    └── Tracks Section
        ├── Track List (multi-select)
        │   ├── Track Name (colored by library status)
        │   ├── Author Name
        │   └── Duration
        └── Action Controls
            ├── Play Now
            ├── Play Next
            ├── Add to Library
            └── Add to Playlist
```

## Now Playing View Structure

```
NowPlayingView
│
├── Current Track Display
│   ├── Album Art Placeholder
│   ├── Track Name
│   └── Author Name
│
├── Playback Controls
│   ├── Progress Slider (seekable)
│   ├── Time Display (current / total)
│   └── Control Buttons
│       ├── Shuffle Toggle
│       ├── Previous Track
│       ├── Play/Pause
│       ├── Next Track
│       └── Repeat Toggle
│
└── Queue Display ("Up Next")
    └── Reorderable Track List
        ├── Track Name
        ├── Author Name
        └── Drag Handle
```

## CarPlay Integration

```
CarPlaySceneDelegate
│
├── Root Template (Tab Bar)
│   │
│   ├── Library Tab
│   │   └── Track List
│   │       └── Tap to Play
│   │
│   ├── Playlists Tab
│   │   └── Playlist List
│   │       └── Tap to View Tracks
│   │           └── Tap to Play
│   │
│   └── Now Playing Tab
│       ├── Shuffle Button
│       ├── Previous Button
│       ├── Play/Pause Button
│       ├── Next Button
│       └── Repeat Button
│
└── Auto-Resume
    └── Restores last played track on connect
```

## Data Flow

```
┌──────────────────┐
│  User Interface  │
│   (SwiftUI)      │
└────────┬─────────┘
         │
         │ User Actions
         │
         ▼
┌──────────────────────┐      ┌─────────────────────┐
│ AudioPlayerService   │◄─────┤  MediaPlayer API    │
│  (Singleton)         │      │  (Lock Screen/CC)   │
└────────┬─────────────┘      └─────────────────────┘
         │
         │ Playback State
         │
         ▼
┌──────────────────────┐
│    AVFoundation      │
│   (Audio Engine)     │
└──────────────────────┘

┌──────────────────┐
│  User Interface  │
│   (SwiftUI)      │
└────────┬─────────┘
         │
         │ Data Operations
         │
         ▼
┌──────────────────────┐      ┌─────────────────────┐
│PersistenceController │◄─────┤   Core Data Store   │
│    (Singleton)       │      │   (SQLite)          │
└──────────────────────┘      └─────────────────────┘
```

## Core Data Schema

```
TrackEntity
├── id: UUID
├── name: String
├── authorName: String
├── duration: Double
├── fileURL: URL?
├── youtubeID: String?
├── dateAdded: Date
├── isDownloaded: Bool
└── playlists: [PlaylistEntity]

PlaylistEntity
├── id: UUID
├── name: String
├── dateCreated: Date
└── tracks: [TrackEntity] (ordered)

SearchHistoryEntity
├── id: UUID
├── searchText: String
└── timestamp: Date
```

## Key Features Implementation

### Shuffle Play
1. User enables shuffle
2. AudioPlayerService stores original queue
3. Current queue is shuffled
4. On repeat cycle, queue reshuffles automatically

### Repeat Mode
1. User enables repeat
2. When queue ends, playback restarts from beginning
3. If shuffle enabled, queue reshuffles on restart

### Multi-Select Actions
1. User selects multiple tracks
2. Action sheet appears with options
3. Actions are applied to all selected tracks
4. Selection cleared after action

### CarPlay Auto-Resume
1. App saves last played track ID and position to UserDefaults
2. On CarPlay connection, CarPlaySceneDelegate restores playback
3. Audio starts from saved position

### Search History
1. Every search query saved to Core Data
2. Only last 10 searches displayed
3. Tap on history item repeats search

## Background Audio

The app maintains playback in background via:
1. Audio background mode in Info.plist
2. AVAudioSession configuration
3. MediaPlayer framework integration
4. Remote control event handling

## Future Integration Points

### YouTube API Integration
```
YouTubeService (to be implemented)
├── Search Videos
├── Get Playlist Contents
├── Extract Audio URL
├── OAuth Authentication
└── Download Manager
    ├── Queue Downloads
    ├── Track Progress
    ├── Convert Format
    └── Store Locally
```

### iCloud Sync (Future)
```
CloudKitService (to be implemented)
├── Sync Library
├── Sync Playlists
├── Sync Preferences
└── Conflict Resolution
```
