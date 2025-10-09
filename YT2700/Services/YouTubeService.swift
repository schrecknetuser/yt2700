import Foundation
import Combine

/// YouTube service that handles authentication and API interactions
/// Users authenticate once through the UI, and all YouTube functionality works automatically
class YouTubeService: ObservableObject {
    static let shared = YouTubeService()
    
    @Published var isAuthenticated = false
    @Published var currentUserEmail: String?
    @Published var currentUser: YouTubeUser?
    
    private var accessToken: String?
    private var refreshToken: String?
    private let keychainService = "com.yt2700.youtube"
    
    private init() {
        loadCredentials()
    }
    
    // MARK: - Authentication
    
    /// Authenticate user with Google OAuth
    /// This opens a web view for user to sign in with their Google account
    /// Returns user information including email
    func authenticate() async throws -> (email: String, name: String) {
        // In a real implementation, this would:
        // 1. Open OAuth flow using ASWebAuthenticationSession
        // 2. Get authorization code
        // 3. Exchange for access token and refresh token
        // 4. Store tokens securely in Keychain
        // 5. Fetch user info
        
        // For now, simulating successful authentication
        let mockEmail = "user@example.com"
        let mockName = "User Name"
        
        await MainActor.run {
            self.isAuthenticated = true
            self.currentUserEmail = mockEmail
            self.accessToken = "mock_access_token"
            self.refreshToken = "mock_refresh_token"
        }
        
        // Save credentials to Keychain
        saveCredentials()
        
        // Fetch user's YouTube data
        try await fetchUserData()
        
        return (email: mockEmail, name: mockName)
    }
    
    /// Sign out and clear stored credentials
    func signOut() {
        isAuthenticated = false
        currentUserEmail = nil
        currentUser = nil
        accessToken = nil
        refreshToken = nil
        clearCredentials()
    }
    
    // MARK: - YouTube API Methods
    
    /// Search for videos on YouTube
    func searchVideos(query: String, maxResults: Int = 25) async throws -> [YouTubeVideo] {
        guard isAuthenticated else {
            throw YouTubeError.notAuthenticated
        }
        
        // In real implementation, this would call YouTube Data API v3
        // GET https://www.googleapis.com/youtube/v3/search
        // Parameters: q=query, part=snippet, type=video, maxResults=maxResults
        // Headers: Authorization: Bearer {accessToken}
        
        // Mock data for now
        var videos: [YouTubeVideo] = []
        for i in 1...maxResults {
            videos.append(YouTubeVideo(
                id: "video_\(i)",
                title: "\(query) - Video \(i)",
                channelName: "Channel \(i % 5 + 1)",
                duration: Double.random(in: 120...600),
                thumbnailURL: URL(string: "https://i.ytimg.com/vi/mock/default.jpg")!,
                viewCount: Int.random(in: 1000...1000000),
                publishedAt: Date().addingTimeInterval(-Double.random(in: 0...31536000))
            ))
        }
        
        return videos
    }
    
    /// Get user's playlists
    func getUserPlaylists() async throws -> [YouTubePlaylist] {
        guard isAuthenticated else {
            throw YouTubeError.notAuthenticated
        }
        
        // In real implementation, this would call:
        // GET https://www.googleapis.com/youtube/v3/playlists
        // Parameters: part=snippet,contentDetails, mine=true
        
        return currentUser?.playlists ?? []
    }
    
    /// Get videos in a playlist
    func getPlaylistVideos(playlistId: String) async throws -> [YouTubeVideo] {
        guard isAuthenticated else {
            throw YouTubeError.notAuthenticated
        }
        
        // In real implementation:
        // GET https://www.googleapis.com/youtube/v3/playlistItems
        // Parameters: part=snippet,contentDetails, playlistId=playlistId
        
        return []
    }
    
    /// Get video details including stream URL
    func getVideoDetails(videoId: String) async throws -> YouTubeVideo {
        guard isAuthenticated else {
            throw YouTubeError.notAuthenticated
        }
        
        // In real implementation:
        // GET https://www.googleapis.com/youtube/v3/videos
        // Parameters: part=snippet,contentDetails,statistics, id=videoId
        
        return YouTubeVideo(
            id: videoId,
            title: "Video Title",
            channelName: "Channel Name",
            duration: 240,
            thumbnailURL: URL(string: "https://i.ytimg.com/vi/\(videoId)/default.jpg")!,
            viewCount: 10000,
            publishedAt: Date()
        )
    }
    
    /// Extract audio stream URL from video
    /// This uses youtube-dl or a third-party service
    func extractAudioURL(videoId: String) async throws -> URL {
        guard isAuthenticated else {
            throw YouTubeError.notAuthenticated
        }
        
        // In real implementation, this would:
        // 1. Use youtube-dl/yt-dlp to extract audio stream URL
        // 2. Or use a third-party service like Invidious
        // 3. Return direct URL to audio stream
        
        // Example using Invidious API (free, no API key needed):
        // GET https://invidious.api.server/api/v1/videos/{videoId}
        // Response includes "adaptiveFormats" array with audio streams
        
        return URL(string: "https://example.com/audio/\(videoId).m4a")!
    }
    
    // MARK: - Private Methods
    
    private func fetchUserData() async throws {
        // Fetch user's profile and playlists
        // GET https://www.googleapis.com/youtube/v3/channels
        // Parameters: part=snippet,contentDetails, mine=true
        
        let mockUser = YouTubeUser(
            id: "user123",
            name: "User Name",
            email: currentUserEmail ?? "",
            playlists: []
        )
        
        await MainActor.run {
            self.currentUser = mockUser
        }
    }
    
    // MARK: - Keychain Storage
    
    private func saveCredentials() {
        guard let accessToken = accessToken else { return }
        
        // Store tokens in Keychain for security
        let accessTokenData = accessToken.data(using: .utf8)!
        
        let accessQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "accessToken",
            kSecValueData as String: accessTokenData
        ]
        
        SecItemDelete(accessQuery as CFDictionary)
        SecItemAdd(accessQuery as CFDictionary, nil)
        
        if let refreshToken = refreshToken {
            let refreshTokenData = refreshToken.data(using: .utf8)!
            let refreshQuery: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: keychainService,
                kSecAttrAccount as String: "refreshToken",
                kSecValueData as String: refreshTokenData
            ]
            
            SecItemDelete(refreshQuery as CFDictionary)
            SecItemAdd(refreshQuery as CFDictionary, nil)
        }
        
        // Save authentication state
        UserDefaults.standard.set(true, forKey: "isYouTubeAuthenticated")
        UserDefaults.standard.set(currentUserEmail, forKey: "youtubeUserEmail")
    }
    
    private func loadCredentials() {
        // Load from UserDefaults
        isAuthenticated = UserDefaults.standard.bool(forKey: "isYouTubeAuthenticated")
        currentUserEmail = UserDefaults.standard.string(forKey: "youtubeUserEmail")
        
        // Load tokens from Keychain
        let accessQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "accessToken",
            kSecReturnData as String: true
        ]
        
        var accessResult: AnyObject?
        if SecItemCopyMatching(accessQuery as CFDictionary, &accessResult) == errSecSuccess,
           let data = accessResult as? Data {
            accessToken = String(data: data, encoding: .utf8)
        }
        
        let refreshQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "refreshToken",
            kSecReturnData as String: true
        ]
        
        var refreshResult: AnyObject?
        if SecItemCopyMatching(refreshQuery as CFDictionary, &refreshResult) == errSecSuccess,
           let data = refreshResult as? Data {
            refreshToken = String(data: data, encoding: .utf8)
        }
    }
    
    private func clearCredentials() {
        let accessQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "accessToken"
        ]
        SecItemDelete(accessQuery as CFDictionary)
        
        let refreshQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: "refreshToken"
        ]
        SecItemDelete(refreshQuery as CFDictionary)
        
        UserDefaults.standard.removeObject(forKey: "isYouTubeAuthenticated")
        UserDefaults.standard.removeObject(forKey: "youtubeUserEmail")
    }
}

// MARK: - Models

struct YouTubeVideo: Identifiable, Codable {
    let id: String
    var title: String
    var channelName: String
    var duration: TimeInterval
    var thumbnailURL: URL
    var viewCount: Int
    var publishedAt: Date
    
    func toTrack() -> Track {
        Track(
            name: title,
            authorName: channelName,
            duration: duration,
            youtubeID: id,
            dateAdded: Date(),
            isDownloaded: false,
            inLibrary: false
        )
    }
}

struct YouTubePlaylist: Identifiable, Codable {
    let id: String
    var title: String
    var videoCount: Int
    var videos: [YouTubeVideo]
}

struct YouTubeUser: Codable {
    let id: String
    var name: String
    var email: String
    var playlists: [YouTubePlaylist]
}

enum YouTubeError: LocalizedError {
    case notAuthenticated
    case apiError(String)
    case networkError
    case invalidResponse
    
    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Please sign in with your YouTube account in Settings"
        case .apiError(let message):
            return "YouTube API Error: \(message)"
        case .networkError:
            return "Network error. Please check your connection."
        case .invalidResponse:
            return "Invalid response from YouTube"
        }
    }
}
