# YT2700 Quick Start Guide

## Opening the Project

1. **Open Xcode**
   ```bash
   open YT2700.xcodeproj
   ```

2. **Select Target**
   - Choose iPhone or iPad simulator from the device menu
   - Or connect a physical iOS device

3. **Build and Run**
   - Press `⌘R` or click the Play button
   - Wait for the build to complete

## First Launch

When you first launch the app, you'll see:
- Empty library (no tracks yet)
- Four tabs: Library, Search, Now Playing, Settings

### Connecting to YouTube (Recommended)

For the best experience, connect your YouTube account first:

1. Tap the "Settings" tab
2. In the "YouTube Account" section, tap "Sign in with Google"
3. A sign-in screen will appear
4. Tap "Sign in with Google" button
5. Follow the OAuth authentication flow
6. Once authenticated, you'll see:
   - Green checkmark with "Connected" status
   - Your email address
7. You can now search YouTube and access your playlists!

**Note**: You only need to sign in once. The app will remember your credentials securely.

## Adding Tracks

### Prerequisites
For best results, sign in to YouTube first (see "Connecting to YouTube" above).

### Method 1: Using Search Tab (with YouTube connected)
1. Tap the "Search" tab
2. Enter a search term (e.g., "rock music")
3. Browse YouTube results
4. Select tracks you want to add
5. Tap "Actions" → "Add to Library"

### Method 2: Using Search Tab (without YouTube)
1. If not signed in, you'll see a notice: "Sign in to YouTube in Settings to search online"
2. You can still search your local library
3. Search will only show tracks already downloaded

### Method 3: From Library Tab
1. Tap the "Library" tab
2. Tap the "+" button in the top right
3. This opens the Search view
4. Follow steps from Method 1 or 2

## Playing Music

### Play a Single Track
1. Navigate to Library → Tracks
2. Tap any track to play it

### Play Multiple Tracks
1. Tap and hold on a track to enter selection mode
2. Select multiple tracks
3. Tap "Actions"
4. Choose:
   - "Play Now" - Replace queue and play immediately
   - "Play Next" - Add after current track

### Shuffle Play All
1. Go to Library → Tracks
2. Tap "Shuffle Play All" button
3. All tracks will play in random order
4. Queue reshuffles automatically when it completes

## Creating Playlists

1. Go to Library → Playlists tab
2. Tap "Create Playlist"
3. Enter a playlist name
4. Tap "Create"
5. To add tracks to a playlist:
   - Select tracks in any view
   - Tap "Actions" → "Add to Playlist"
   - Choose your playlist

## Playback Controls

### Now Playing Screen
- **Slider**: Drag to seek within the track
- **⏮**: Previous track (or restart current if > 3 seconds)
- **⏯**: Play/Pause
- **⏭**: Next track
- **🔀**: Toggle shuffle mode
- **🔁**: Toggle repeat mode

### Queue Management
1. Scroll down on Now Playing screen
2. See "Up Next" section
3. Drag tracks to reorder
4. Queue updates immediately

## Search Features

### Search History
- Last 10 searches are saved automatically
- Tap any previous search to repeat it
- History shown when search bar is empty

### YouTube Connection Status
- **Connected**: Green indicator, searches YouTube catalog
- **Not Connected**: Orange warning, searches local library only
- Sign in anytime in Settings to enable YouTube search

### Search Results
- **Authors Section**: Artists matching your search
  - Tap to see all tracks by that artist
- **Tracks Section**: Songs matching your search
  - Blue text = not in library (YouTube results)
  - Normal text = already in library

### Author Detail
When viewing an author's tracks:
- **Sort by Date**: Newest tracks first
- **Sort by Name**: Alphabetical order
- **Search Bar**: Filter tracks by name

## Settings & Preferences

### YouTube Account
1. Go to Settings tab
2. View connection status
3. **Sign In**: Tap "Sign in with Google" to authenticate
4. **Sign Out**: Tap "Disconnect Account" (with confirmation)
5. Your email is displayed when connected

### Download Settings
1. **Audio Quality**: Choose Low, Medium, or High
2. **Auto-download**: Toggle to automatically download tracks when added
3. Settings are saved automatically

### Storage Management
1. View total storage used by downloads
2. See count of downloaded tracks
3. **Clear All Downloads**: Remove all downloaded files
   - Note: This doesn't remove tracks from library, only local files

### About Section
- View app version
- Access Privacy Policy
- Access Terms of Service

## CarPlay Usage

### First Connection
1. Connect your iPhone to CarPlay
2. App will appear in CarPlay interface
3. Last played track resumes automatically

### CarPlay Navigation
- **Library Tab**: Browse all tracks
- **Playlists Tab**: Browse playlists
- **Now Playing Tab**: Playback controls

### CarPlay Controls
- Shuffle button (blue when enabled)
- Previous/Next track buttons
- Play/Pause button
- Repeat button (blue when enabled)

## Tips & Tricks

### Batch Operations
1. Select multiple tracks
2. Use actions to:
   - Build a quick playlist
   - Delete unwanted tracks
   - Queue up multiple songs

### Smart Shuffle
- Enable shuffle + repeat for continuous random playback
- Queue automatically reshuffles between cycles
- Different order each time

### Background Playback
- Music continues when app is in background
- Control from:
  - Lock screen
  - Control Center
  - CarPlay
  - AirPods/Headphones

### Search Tips
- Search works on partial matches
- Finds both track names and artist names
- Case-insensitive search

## Troubleshooting

### No Sound
1. Check device volume
2. Check mute switch
3. Verify track has file URL set
4. Check if track is downloaded

### CarPlay Not Appearing
1. Verify entitlements are properly configured
2. Check Info.plist for CarPlay scene configuration
3. Ensure development provisioning includes CarPlay

### Tracks Not Saving
1. Check Core Data permissions
2. Verify app has storage space
3. Check console for error messages

### Search Not Working
1. Currently using mock data
2. YouTube integration needs to be implemented
3. See README for integration instructions

## Development Mode

### Testing with Mock Data
The search currently generates mock results for testing:
- 10 sample tracks per search
- 3 sample artists
- Random durations

### Adding Real Tracks
To test with real audio files:
1. Add .mp3 or .m4a files to Documents directory
2. Create Track objects with fileURL pointing to files
3. Use PersistenceController to save

Example code:
```swift
let fileURL = /* URL to your audio file */
let track = Track(
    name: "Song Name",
    authorName: "Artist Name",
    duration: 240.0,
    fileURL: fileURL,
    isDownloaded: true,
    inLibrary: true
)
PersistenceController.shared.addTrack(track)
```

## Next Steps

### Implementing YouTube Integration
1. Get YouTube Data API key
2. Implement search API calls
3. Extract audio URLs
4. Implement download manager
5. Handle authentication

### Additional Features to Add
- Audio visualizer
- Lyrics display
- Equalizer settings
- Sleep timer
- Social sharing

## Getting Help

### Resources
- README.md: Comprehensive documentation
- ARCHITECTURE.md: Technical architecture details
- Code comments: Inline documentation

### Support
For issues or questions:
1. Check existing documentation
2. Review code comments
3. Create an issue on GitHub

## Keyboard Shortcuts (Xcode)

- `⌘R`: Build and Run
- `⌘B`: Build only
- `⌘.`: Stop running app
- `⌘⇧K`: Clean build folder
- `⌘⇧O`: Open quickly (find files)

## Simulator Tips

### Audio in Simulator
- Mac audio output is used
- Volume controlled by Mac settings
- Test headphone controls not available

### CarPlay Simulator
1. Go to I/O → External Displays → CarPlay
2. CarPlay window appears
3. Interact with virtual CarPlay display

### Debugging
- Use print statements to console
- Set breakpoints in Xcode
- View Core Data in Xcode Database viewer
