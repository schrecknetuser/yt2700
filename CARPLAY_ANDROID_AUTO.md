# CarPlay and Android Auto Integration Guide

## Overview

This document outlines the approach for integrating CarPlay (iOS) and Android Auto support into the YT2700 application.

## CarPlay Integration (iOS)

### Requirements
- iOS 12.0 or later
- CarPlay-enabled vehicle or CarPlay simulator
- Apple Developer account with CarPlay entitlement

### Implementation Steps

1. **Install react-native-carplay**
   ```bash
   npm install react-native-carplay
   ```

2. **Configure Xcode Project**
   - Add CarPlay capability in Xcode
   - Update Info.plist with CarPlay audio app declaration
   - Configure background audio modes

3. **Create CarPlay Templates**
   ```typescript
   import CarPlay from 'react-native-carplay';
   
   // Initialize CarPlay with list template
   CarPlay.setRootTemplate({
     template: 'list',
     id: 'library',
     leadingNavigationBarButtons: [],
     trailingNavigationBarButtons: [],
     sections: [
       {
         header: 'Playlists',
         items: playlists.map(playlist => ({
           text: playlist.name,
           detailText: `${playlist.trackIds.length} tracks`,
           onPress: () => handlePlaylistPress(playlist),
         })),
       },
     ],
   });
   ```

4. **Handle Playback Controls**
   ```typescript
   // Listen to CarPlay playback commands
   CarPlay.registerPlayHandler(() => {
     resumePlayback();
   });
   
   CarPlay.registerPauseHandler(() => {
     pausePlayback();
   });
   
   CarPlay.registerNextTrackHandler(() => {
     nextTrack();
   });
   
   CarPlay.registerPreviousTrackHandler(() => {
     previousTrack();
   });
   ```

5. **Update Now Playing Info**
   ```typescript
   CarPlay.updateNowPlayingInfo({
     title: currentTrack.title,
     artist: currentTrack.authorName,
     duration: currentTrack.duration,
     elapsedTime: playbackState.position,
     artwork: currentTrack.thumbnailUrl,
   });
   ```

6. **Auto-Start Playback on Connection**
   ```typescript
   CarPlay.registerConnectHandler(async () => {
     // Load last played track
     const lastTrackId = await StorageService.getLastPlayedTrack();
     if (lastTrackId) {
       const track = tracks.find(t => t.id === lastTrackId);
       if (track) {
         playTrack(track);
       }
     }
   });
   ```

### CarPlay Template Guidelines
- Use List Templates for browsing playlists and tracks
- Use Now Playing Template for playback control
- Keep text concise and readable while driving
- Support voice commands via Siri integration

## Android Auto Integration

### Requirements
- Android 5.0 (API level 21) or later
- Android Auto-enabled vehicle or Android Auto simulator
- Google Play Services

### Implementation Steps

1. **Install react-native-android-auto** (if available) or use native implementation
   ```bash
   npm install react-native-android-auto
   ```

2. **Configure Android Manifest**
   ```xml
   <application>
     <meta-data
       android:name="com.google.android.gms.car.application"
       android:resource="@xml/automotive_app_desc"/>
       
     <service
       android:name=".MediaPlaybackService"
       android:exported="true">
       <intent-filter>
         <action android:name="android.media.browse.MediaBrowserService"/>
       </intent-filter>
     </service>
   </application>
   ```

3. **Create MediaBrowserService**
   - Implement MediaBrowserServiceCompat
   - Provide browsable media hierarchy (playlists, tracks)
   - Handle playback commands through MediaSession

4. **Implement Media Session**
   ```kotlin
   class MediaPlaybackService : MediaBrowserServiceCompat() {
     private lateinit var mediaSession: MediaSessionCompat
     
     override fun onCreate() {
       super.onCreate()
       mediaSession = MediaSessionCompat(this, "YT2700")
       mediaSession.setCallback(MediaSessionCallback())
       sessionToken = mediaSession.sessionToken
     }
     
     inner class MediaSessionCallback : MediaSessionCompat.Callback() {
       override fun onPlay() {
         // Resume playback
       }
       
       override fun onPause() {
         // Pause playback
       }
       
       override fun onSkipToNext() {
         // Next track
       }
       
       override fun onSkipToPrevious() {
         // Previous track
       }
     }
   }
   ```

5. **Update Metadata**
   ```kotlin
   val metadata = MediaMetadataCompat.Builder()
     .putString(MediaMetadataCompat.METADATA_KEY_TITLE, track.title)
     .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, track.authorName)
     .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, track.duration * 1000)
     .putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, bitmap)
     .build()
   
   mediaSession.setMetadata(metadata)
   ```

6. **Auto-Start Playback on Connection**
   - Listen for Android Auto connection events
   - Load and play last track when connected

## Common Features

### Background Audio
Both platforms require proper background audio configuration:

**iOS:**
- Add audio background mode in Info.plist
- Use AVAudioSession to configure audio session

**Android:**
- Add FOREGROUND_SERVICE permission
- Show persistent notification during playback

### Offline Playback
- Ensure downloaded tracks are accessible when vehicle is disconnected from internet
- Use local file paths for downloaded audio
- Handle network availability gracefully

### Voice Commands
**iOS (Siri):**
- Implement SiriKit Media Intents
- Support "Play [track/playlist] in YT2700"

**Android (Google Assistant):**
- Implement voice search in MediaBrowserService
- Support media controls via voice

## Testing

### CarPlay Testing
1. Use CarPlay Simulator in Xcode
2. Test with physical CarPlay device
3. Verify all templates render correctly
4. Test playback controls and navigation

### Android Auto Testing
1. Use Android Auto Desktop Head Unit (DHU)
2. Test with physical Android Auto device
3. Verify media browsing hierarchy
4. Test playback controls and notifications

## Implementation Priority

1. ✅ Core playback functionality (completed)
2. ✅ Playlist management (completed)
3. ✅ Last played track persistence (completed)
4. ⏳ Background audio support
5. ⏳ CarPlay basic integration
6. ⏳ Android Auto basic integration
7. ⏳ Advanced features (voice commands, artwork)

## Resources

### CarPlay
- [Apple CarPlay Documentation](https://developer.apple.com/carplay/)
- [react-native-carplay](https://github.com/birkir/react-native-carplay)
- [CarPlay Audio App Guide](https://developer.apple.com/design/human-interface-guidelines/carplay/overview/audio-apps/)

### Android Auto
- [Android Auto Documentation](https://developer.android.com/training/cars)
- [Media Apps for Auto](https://developer.android.com/training/cars/media)
- [MediaBrowserService Guide](https://developer.android.com/guide/topics/media-apps/audio-app/building-a-mediabrowserservice)

## Notes

- Both integrations require actual vehicles or simulators for testing
- CarPlay requires Apple Developer account with specific entitlements
- Android Auto is more flexible with emulator testing
- Background audio is critical for both platforms
- Offline playback should work seamlessly in vehicles
