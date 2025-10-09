# TODO: YouTube Integration Implementation

## 🎉 NEW: User-Friendly Approach

**For End Users**: Simply sign in with your Google account in the Settings screen - no technical setup required!

**For Developers**: This TODO is for completing the backend OAuth and API integration. Once done, users get a seamless experience.

## ✅ COMPLETED: User-Friendly Authentication

The app now includes a **Settings screen** where users can sign in with their Google account. No developer configuration needed by end users!

### What's Already Built:
- ✅ Settings view with YouTube account management
- ✅ OAuth sign-in flow interface
- ✅ Secure credential storage in Keychain
- ✅ YouTubeService with authentication framework
- ✅ Automatic YouTube search when signed in
- ✅ Graceful fallback to local search when not signed in
- ✅ Connection status indicators in UI

## Remaining Work for Developers

This document outlines the **developer-side** work needed to complete the YouTube integration. End users will only need to sign in through Settings once this is complete.

## Phase 1: Complete OAuth Implementation (High Priority)

## Phase 1: Complete OAuth Implementation (High Priority)

### 1.1 Google Cloud Platform Setup (One-Time, Developer Only)
- [ ] Create Google Cloud Platform project
- [ ] Enable YouTube Data API v3
- [ ] Create OAuth 2.0 Client ID for iOS
  - Application type: iOS
  - Bundle ID: com.yt2700.app
- [ ] Download OAuth configuration
- [ ] **Important**: These credentials are built into the app, users don't need to configure anything

### 1.2 Implement Real OAuth Flow in YouTubeService.swift
Currently using mock authentication. Replace with:
- [ ] Add `GoogleSignIn` SDK via Swift Package Manager
  ```swift
  dependencies: [
    .package(url: "https://github.com/google/GoogleSignIn-iOS", from: "7.0.0")
  ]
  ```
- [ ] Implement real `authenticate()` method using ASWebAuthenticationSession
- [ ] Handle OAuth redirect URL scheme in Info.plist
- [ ] Exchange authorization code for tokens
- [ ] Implement token refresh logic
- [ ] Store tokens securely in Keychain (already scaffolded)

## Phase 2: Complete YouTube API Integration

### 2.1 Implement Real API Calls in YouTubeService.swift
Currently using mock data. Replace with real YouTube Data API v3 calls:

- [ ] **searchVideos()**: Implement real YouTube search
  ```swift
  GET https://www.googleapis.com/youtube/v3/search
  Parameters: q={query}, part=snippet, type=video, maxResults={limit}
  Headers: Authorization: Bearer {accessToken}
  ```

- [ ] **getUserPlaylists()**: Fetch user's YouTube playlists
  ```swift
  GET https://www.googleapis.com/youtube/v3/playlists
  Parameters: part=snippet,contentDetails, mine=true
  ```

- [ ] **getPlaylistVideos()**: Get videos in a playlist
  ```swift
  GET https://www.googleapis.com/youtube/v3/playlistItems
  Parameters: part=snippet, playlistId={id}, maxResults=50
  ```

- [ ] **getVideoDetails()**: Get detailed video information
  ```swift
  GET https://www.googleapis.com/youtube/v3/videos
  Parameters: part=snippet,contentDetails,statistics, id={videoId}
  ```

- [ ] Handle API errors and rate limiting
- [ ] Implement pagination for large result sets
- [ ] Add response caching to reduce API calls

## Phase 3: Download Manager

### 3.1 Create DownloadService.swift
```swift
Location: YT2700/Services/DownloadService.swift

Required Features:
- [ ] Queue management for downloads
- [ ] Progress tracking per download
- [ ] Pause/Resume capability
- [ ] Background download support
- [ ] Storage management
- [ ] Format conversion (if needed)
- [ ] Error handling and retry logic
```

### 3.2 Download Manager Features
- [ ] Implement URLSessionDownloadTask for downloads
- [ ] Create download queue with priority
- [ ] Add progress observers (@Published properties)
- [ ] Implement file naming and organization
- [ ] Add storage space checking
- [ ] Handle network interruptions
- [ ] Implement concurrent download limits

## Phase 4: Audio Extraction

### 4.1 Choose Implementation Method

**Option A: YouTube-DL Integration**
- [ ] Embed youtube-dl or yt-dlp
- [ ] Create Swift wrapper
- [ ] Handle subprocess execution
- [ ] Parse output for audio URLs

**Option B: Third-Party Service**
- [ ] Research and select service (e.g., Invidious API)
- [ ] Implement API client
- [ ] Handle rate limiting
- [ ] Implement caching

**Option C: Custom Parser**
- [ ] Parse YouTube video page
- [ ] Extract streaming manifest
- [ ] Select audio-only format
- [ ] Handle signature decryption

### 4.2 Audio Processing
- [ ] Download audio stream
- [ ] Convert to compatible format (AAC/MP3)
- [ ] Add metadata (title, artist, artwork)
- [ ] Store in app's Documents directory
- [ ] Update Track entity with local file URL

## Phase 5: Update Search View

### 5.1 Replace Mock Search
In `SearchView.swift`:
- [ ] Remove `generateMockSearchResults()` function
- [ ] Add YouTube API search call
- [ ] Map YouTubeVideo to Track objects
- [ ] Handle API errors gracefully
- [ ] Add loading states
- [ ] Implement pagination for results

### 5.2 Add Preview Functionality
- [ ] Implement 30-second preview player
- [ ] Add preview button to search results
- [ ] Stream preview without downloading
- [ ] Show loading indicator during preview

## Phase 6: Authentication & Authorization

### 6.1 Implement Google Sign-In
- [ ] Add Sign In button to Settings view
- [ ] Implement OAuth flow
- [ ] Store authentication tokens securely (Keychain)
- [ ] Handle token refresh
- [ ] Add Sign Out functionality

### 6.2 User Playlist Import
- [ ] Fetch user's YouTube playlists
- [ ] Display import UI
- [ ] Allow selective playlist import
- [ ] Show import progress
- [ ] Handle large playlists (pagination)

## Phase 7: UI Enhancements

### 7.1 Settings View
Create new `SettingsView.swift`:
- [ ] YouTube account connection status
- [ ] Download quality preferences
- [ ] Storage management
- [ ] Clear cache option
- [ ] API usage statistics

### 7.2 Download Manager UI
Create new `DownloadsView.swift`:
- [ ] Active downloads list
- [ ] Progress bars for each download
- [ ] Pause/Resume/Cancel buttons
- [ ] Download queue viewer
- [ ] Completed downloads history

### 7.3 Enhanced Track Display
Update `TrackRow.swift`:
- [ ] Show download status icon
- [ ] Display download progress
- [ ] Add thumbnail/artwork display
- [ ] Show YouTube view count (optional)

## Phase 8: Offline Mode

### 8.1 Download Functionality
- [ ] Add "Download" action to track actions
- [ ] Implement batch download for playlists
- [ ] Show download progress
- [ ] Handle download failures
- [ ] Resume interrupted downloads

### 8.2 Storage Management
- [ ] Calculate total storage used
- [ ] Show available space
- [ ] Implement "Delete Downloaded" action
- [ ] Add automatic cleanup for old downloads
- [ ] Warn when storage is low

## Phase 9: Error Handling

### 9.1 Network Errors
- [ ] Handle no internet connection
- [ ] Handle API rate limiting
- [ ] Handle authentication failures
- [ ] Show user-friendly error messages
- [ ] Implement retry mechanisms

### 9.2 Validation
- [ ] Validate YouTube URLs
- [ ] Check video availability
- [ ] Handle region-restricted content
- [ ] Handle age-restricted content
- [ ] Validate playlist permissions

## Phase 10: Testing

### 10.1 Unit Tests
- [ ] Test YouTube API parsing
- [ ] Test download manager
- [ ] Test authentication flow
- [ ] Test error handling
- [ ] Test Core Data operations

### 10.2 Integration Tests
- [ ] Test search to download flow
- [ ] Test playlist import
- [ ] Test playback of downloaded tracks
- [ ] Test CarPlay with downloaded content

### 10.3 Manual Testing
- [ ] Test with various YouTube content types
- [ ] Test with slow network
- [ ] Test with no network (offline mode)
- [ ] Test storage limits
- [ ] Test CarPlay integration

## Phase 11: Legal & Compliance

### 11.1 YouTube Terms of Service
- [ ] Review YouTube API Terms of Service
- [ ] Implement required attributions
- [ ] Add YouTube logo where required
- [ ] Handle content takedowns
- [ ] Implement age verification if needed

### 11.2 Privacy Policy
- [ ] Create privacy policy
- [ ] Document data collection
- [ ] Explain YouTube data usage
- [ ] Add consent mechanisms
- [ ] Implement data deletion

### 11.3 App Store Requirements
- [ ] Review App Store guidelines
- [ ] Add required disclaimers
- [ ] Implement content filtering
- [ ] Handle copyright claims

## Phase 12: Optimization

### 12.1 Performance
- [ ] Implement image caching for thumbnails
- [ ] Optimize Core Data queries
- [ ] Implement lazy loading for large lists
- [ ] Reduce memory footprint
- [ ] Optimize background downloads

### 12.2 User Experience
- [ ] Add pull-to-refresh
- [ ] Implement smart search suggestions
- [ ] Add recently played section
- [ ] Implement trending/recommended
- [ ] Add share functionality

## Phase 13: Documentation

### 13.1 Update Documentation
- [ ] Update README with YouTube setup instructions
- [ ] Document API key configuration
- [ ] Create troubleshooting guide
- [ ] Add screenshots
- [ ] Document limitations

### 13.2 Code Documentation
- [ ] Add code comments to YouTube integration
- [ ] Document API usage patterns
- [ ] Create integration examples
- [ ] Document third-party dependencies

## Implementation Priority

**High Priority (Core Functionality):**
1. YouTube API Setup (Phase 1)
2. YouTube Service Implementation (Phase 2)
3. Update Search View (Phase 5)
4. Download Manager (Phase 3)

**Medium Priority (Essential Features):**
5. Audio Extraction (Phase 4)
6. Offline Mode (Phase 8)
7. Error Handling (Phase 9)
8. Authentication (Phase 6)

**Low Priority (Nice to Have):**
9. UI Enhancements (Phase 7)
10. Optimization (Phase 12)
11. Additional Features

**Required Before Release:**
12. Legal & Compliance (Phase 11)
13. Testing (Phase 10)
14. Documentation Updates (Phase 13)

## Estimated Timeline

- Phase 1-2: 1-2 weeks
- Phase 3-4: 2-3 weeks
- Phase 5-6: 1-2 weeks
- Phase 7-8: 1-2 weeks
- Phase 9-10: 1 week
- Phase 11-13: 1 week

**Total: 7-11 weeks for complete implementation**

## Notes

### Alternative Approaches
1. **Use Existing Apps**: Instead of downloading from YouTube directly, integrate with apps like:
   - YouTube Music app (via URL schemes)
   - Third-party download apps (if legal in your region)

2. **YouTube Music API**: Consider using YouTube Music API if available in the future

3. **User-Provided Files**: Allow users to import their own audio files via Files app

### Security Considerations
- Never commit API keys to version control
- Use environment variables or secure configuration
- Store tokens in Keychain
- Implement certificate pinning for API calls
- Validate all user inputs

### Rate Limiting
- YouTube API has daily quotas
- Implement caching to reduce API calls
- Show quota usage to users
- Implement exponential backoff

### Content Safety
- Implement content filtering
- Respect age restrictions
- Handle copyright claims
- Provide reporting mechanism
