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
- Three tabs: Library, Search, Now Playing

## Adding Tracks

### Method 1: Using Search Tab
1. Tap the "Search" tab
2. Enter a search term (e.g., "rock music")
3. Browse results
4. Select tracks you want to add
5. Tap "Actions" → "Add to Library"

### Method 2: From Library Tab
1. Tap the "Library" tab
2. Tap the "+" button in the top right
3. This opens the Search view
4. Follow steps 2-5 from Method 1

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

### Search Results
- **Authors Section**: Artists matching your search
  - Tap to see all tracks by that artist
- **Tracks Section**: Songs matching your search
  - Blue text = not in library
  - Normal text = already in library

### Author Detail
When viewing an author's tracks:
- **Sort by Date**: Newest tracks first
- **Sort by Name**: Alphabetical order
- **Search Bar**: Filter tracks by name

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
