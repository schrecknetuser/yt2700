import SwiftUI

struct SettingsView: View {
    @State private var isYouTubeConnected = false
    @State private var youtubeEmail = ""
    @State private var downloadQuality = "High"
    @State private var autoDownload = false
    @State private var showingSignIn = false
    @State private var showingDisconnectAlert = false
    @EnvironmentObject var youtubeService: YouTubeService
    
    let qualityOptions = ["Low", "Medium", "High"]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("YouTube Account")) {
                    if isYouTubeConnected {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            VStack(alignment: .leading) {
                                Text("Connected")
                                    .font(.headline)
                                Text(youtubeEmail)
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                        }
                        
                        Button("Disconnect Account") {
                            showingDisconnectAlert = true
                        }
                        .foregroundColor(.red)
                    } else {
                        Button(action: {
                            showingSignIn = true
                        }) {
                            HStack {
                                Image(systemName: "person.circle")
                                Text("Sign in with Google")
                            }
                        }
                        
                        Text("Sign in to access your YouTube playlists and enable downloading")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                
                Section(header: Text("Download Settings")) {
                    Picker("Audio Quality", selection: $downloadQuality) {
                        ForEach(qualityOptions, id: \.self) { quality in
                            Text(quality)
                        }
                    }
                    
                    Toggle("Auto-download added tracks", isOn: $autoDownload)
                    
                    Text("Downloads will be saved to your device for offline playback")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                
                Section(header: Text("Storage")) {
                    HStack {
                        Text("Used Storage")
                        Spacer()
                        Text(formatStorageSize(calculateUsedStorage()))
                            .foregroundColor(.gray)
                    }
                    
                    HStack {
                        Text("Downloaded Tracks")
                        Spacer()
                        Text("\(countDownloadedTracks())")
                            .foregroundColor(.gray)
                    }
                    
                    Button("Clear All Downloads") {
                        clearAllDownloads()
                    }
                    .foregroundColor(.red)
                }
                
                Section(header: Text("About")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.gray)
                    }
                    
                    Link("Privacy Policy", destination: URL(string: "https://example.com/privacy")!)
                    Link("Terms of Service", destination: URL(string: "https://example.com/terms")!)
                }
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showingSignIn) {
                YouTubeSignInView(isConnected: $isYouTubeConnected, email: $youtubeEmail)
            }
            .alert("Disconnect YouTube Account", isPresented: $showingDisconnectAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Disconnect", role: .destructive) {
                    disconnectYouTube()
                }
            } message: {
                Text("Are you sure you want to disconnect your YouTube account? Your downloaded tracks will remain, but you won't be able to access YouTube playlists or download new content.")
            }
            .onAppear {
                loadYouTubeStatus()
                loadSettings()
            }
        }
    }
    
    func loadYouTubeStatus() {
        isYouTubeConnected = youtubeService.isAuthenticated
        youtubeEmail = youtubeService.currentUserEmail ?? ""
    }
    
    func loadSettings() {
        downloadQuality = UserDefaults.standard.string(forKey: "downloadQuality") ?? "High"
        autoDownload = UserDefaults.standard.bool(forKey: "autoDownload")
    }
    
    func disconnectYouTube() {
        youtubeService.signOut()
        isYouTubeConnected = false
        youtubeEmail = ""
    }
    
    func calculateUsedStorage() -> Int64 {
        // Calculate total size of downloaded audio files
        guard let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return 0
        }
        
        let audioPath = documentsPath.appendingPathComponent("Audio")
        guard let enumerator = FileManager.default.enumerator(at: audioPath, includingPropertiesForKeys: [.fileSizeKey]) else {
            return 0
        }
        
        var totalSize: Int64 = 0
        for case let fileURL as URL in enumerator {
            if let fileSize = try? fileURL.resourceValues(forKeys: [.fileSizeKey]).fileSize {
                totalSize += Int64(fileSize)
            }
        }
        
        return totalSize
    }
    
    func formatStorageSize(_ bytes: Int64) -> String {
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useKB, .useMB, .useGB]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: bytes)
    }
    
    func countDownloadedTracks() -> Int {
        let tracks = PersistenceController.shared.fetchTracks()
        return tracks.filter { $0.isDownloaded }.count
    }
    
    func clearAllDownloads() {
        guard let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return
        }
        
        let audioPath = documentsPath.appendingPathComponent("Audio")
        try? FileManager.default.removeItem(at: audioPath)
        
        // Update Core Data to mark tracks as not downloaded
        let tracks = PersistenceController.shared.fetchTracks()
        tracks.forEach { track in
            var updatedTrack = track
            updatedTrack.isDownloaded = false
            // In a real implementation, you'd update the Core Data entity
        }
    }
}

struct YouTubeSignInView: View {
    @Binding var isConnected: Bool
    @Binding var email: String
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var youtubeService: YouTubeService
    @State private var isAuthenticating = false
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: "play.rectangle.fill")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 100, height: 100)
                    .foregroundColor(.red)
                
                Text("Connect to YouTube")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Sign in with your Google account to access your YouTube playlists and enable downloading")
                    .multilineTextAlignment(.center)
                    .foregroundColor(.gray)
                    .padding(.horizontal)
                
                if let error = errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding()
                }
                
                if isAuthenticating {
                    ProgressView()
                        .padding()
                } else {
                    Button(action: {
                        authenticateWithYouTube()
                    }) {
                        HStack {
                            Image(systemName: "person.circle.fill")
                            Text("Sign in with Google")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .cornerRadius(10)
                    }
                    .padding(.horizontal)
                }
                
                Spacer()
                
                VStack(spacing: 8) {
                    Text("By signing in, you agree to:")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Link("YouTube Terms of Service", destination: URL(string: "https://www.youtube.com/t/terms")!)
                        .font(.caption)
                    
                    Link("Google Privacy Policy", destination: URL(string: "https://policies.google.com/privacy")!)
                        .font(.caption)
                }
                .padding(.bottom)
            }
            .navigationTitle("YouTube Sign In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    func authenticateWithYouTube() {
        isAuthenticating = true
        errorMessage = nil
        
        Task {
            do {
                let result = try await youtubeService.authenticate()
                await MainActor.run {
                    isConnected = true
                    email = result.email
                    isAuthenticating = false
                    dismiss()
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Authentication failed: \(error.localizedDescription)"
                    isAuthenticating = false
                }
            }
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(YouTubeService.shared)
    }
}
