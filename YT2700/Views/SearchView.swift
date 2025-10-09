import SwiftUI

struct SearchView: View {
    @State private var searchText = ""
    @State private var searchHistory: [String] = []
    @State private var searchResults: [Track] = []
    @State private var searchAuthors: [Author] = []
    @State private var selectedTracks = Set<UUID>()
    @State private var showingActionSheet = false
    @State private var showingPlaylistPicker = false
    @State private var hasSearched = false
    @State private var isSearching = false
    @State private var errorMessage: String?
    @EnvironmentObject var audioPlayer: AudioPlayerService
    @EnvironmentObject var youtubeService: YouTubeService
    
    var body: some View {
        NavigationView {
            VStack {
                SearchBar(text: $searchText, placeholder: "Search for tracks or authors...")
                    .padding(.top)
                
                if !youtubeService.isAuthenticated {
                    HStack {
                        Image(systemName: "exclamationmark.triangle")
                            .foregroundColor(.orange)
                        Text("Sign in to YouTube in Settings to search online")
                            .font(.caption)
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background(Color.orange.opacity(0.1))
                    .cornerRadius(8)
                    .padding(.horizontal)
                }
                
                if let error = errorMessage {
                    HStack {
                        Image(systemName: "exclamationmark.circle")
                            .foregroundColor(.red)
                        Text(error)
                            .font(.caption)
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background(Color.red.opacity(0.1))
                    .cornerRadius(8)
                    .padding(.horizontal)
                }
                
                if isSearching {
                    VStack {
                        ProgressView()
                        Text("Searching YouTube...")
                            .foregroundColor(.gray)
                            .font(.caption)
                    }
                    .padding()
                    Spacer()
                } else if !hasSearched && searchHistory.isEmpty {
                    Text("Enter a search term to find tracks and authors")
                        .foregroundColor(.gray)
                        .padding()
                    Spacer()
                } else if !hasSearched {
                    searchHistoryView
                } else {
                    searchResultsView
                }
            }
            .navigationTitle("Search")
            .toolbar {
                if !selectedTracks.isEmpty {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Actions") {
                            showingActionSheet = true
                        }
                    }
                }
            }
            .confirmationDialog("Track Actions", isPresented: $showingActionSheet) {
                Button("Play Now") { playNow() }
                Button("Play Next") { playNext() }
                Button("Add to Library") { addToLibrary() }
                Button("Add to Playlist") { showingPlaylistPicker = true }
                Button("Cancel", role: .cancel) { }
            }
            .onChange(of: searchText) { newValue in
                if !newValue.isEmpty && newValue.count > 2 {
                    performSearch(newValue)
                }
            }
        }
        .onAppear {
            loadSearchHistory()
        }
    }
    
    var searchHistoryView: some View {
        VStack(alignment: .leading) {
            Text("Recent Searches")
                .font(.headline)
                .padding(.horizontal)
            
            List(searchHistory, id: \.self) { query in
                Button(action: {
                    searchText = query
                    performSearch(query)
                }) {
                    HStack {
                        Image(systemName: "clock.arrow.circlepath")
                            .foregroundColor(.gray)
                        Text(query)
                        Spacer()
                    }
                }
            }
        }
    }
    
    var searchResultsView: some View {
        List {
            if !searchAuthors.isEmpty {
                Section("Authors") {
                    ForEach(searchAuthors) { author in
                        NavigationLink(destination: AuthorDetailView(author: author)) {
                            HStack {
                                Text(author.name)
                                Spacer()
                                Text("\(author.trackCount) tracks")
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                }
            }
            
            if !searchResults.isEmpty {
                Section("Tracks") {
                    ForEach(searchResults, selection: $selectedTracks) { track in
                        TrackRow(track: track, isInLibrary: track.inLibrary)
                            .contentShape(Rectangle())
                            .onTapGesture {
                                if selectedTracks.isEmpty {
                                    audioPlayer.playTracks(searchResults, startingAt: searchResults.firstIndex(of: track) ?? 0)
                                } else {
                                    toggleSelection(track.id)
                                }
                            }
                    }
                }
            }
            
            if searchAuthors.isEmpty && searchResults.isEmpty {
                Text("No results found")
                    .foregroundColor(.gray)
            }
        }
    }
    
    func loadSearchHistory() {
        searchHistory = PersistenceController.shared.fetchSearchHistory()
    }
    
    func performSearch(_ query: String) {
        hasSearched = true
        isSearching = true
        errorMessage = nil
        
        PersistenceController.shared.addSearchHistory(query)
        loadSearchHistory()
        
        // If YouTube is connected, search YouTube
        // Otherwise, search local library only
        if youtubeService.isAuthenticated {
            Task {
                do {
                    let videos = try await youtubeService.searchVideos(query: query, maxResults: 25)
                    let existingTracks = PersistenceController.shared.fetchTracks()
                    let existingYouTubeIDs = Set(existingTracks.compactMap { $0.youtubeID })
                    
                    await MainActor.run {
                        searchResults = videos.map { video in
                            var track = video.toTrack()
                            track.inLibrary = existingYouTubeIDs.contains(video.id)
                            return track
                        }
                        
                        let authorNames = Set(searchResults.map { $0.authorName })
                        searchAuthors = authorNames.map { name in
                            let count = searchResults.filter { $0.authorName == name }.count
                            return Author(name: name, trackCount: count)
                        }.sorted { $0.name < $1.name }
                        
                        isSearching = false
                    }
                } catch {
                    await MainActor.run {
                        errorMessage = error.localizedDescription
                        isSearching = false
                        // Fall back to local search
                        searchLocalLibrary(query: query)
                    }
                }
            }
        } else {
            // Search local library only
            searchLocalLibrary(query: query)
            isSearching = false
        }
    }
    
    func searchLocalLibrary(query: String) {
        let allTracks = PersistenceController.shared.fetchTracks()
        searchResults = allTracks.filter {
            $0.name.localizedCaseInsensitiveContains(query) ||
            $0.authorName.localizedCaseInsensitiveContains(query)
        }
        
        let authorNames = Set(searchResults.map { $0.authorName })
        searchAuthors = authorNames.map { name in
            let count = searchResults.filter { $0.authorName == name }.count
            return Author(name: name, trackCount: count)
        }.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }
    
    func toggleSelection(_ id: UUID) {
        if selectedTracks.contains(id) {
            selectedTracks.remove(id)
        } else {
            selectedTracks.insert(id)
        }
    }
    
    func playNow() {
        let selected = searchResults.filter { selectedTracks.contains($0.id) }
        audioPlayer.playNow(selected)
        selectedTracks.removeAll()
    }
    
    func playNext() {
        let selected = searchResults.filter { selectedTracks.contains($0.id) }
        audioPlayer.playNext(selected)
        selectedTracks.removeAll()
    }
    
    func addToLibrary() {
        let selected = searchResults.filter { selectedTracks.contains($0.id) }
        selected.forEach { track in
            var libraryTrack = track
            libraryTrack.inLibrary = true
            PersistenceController.shared.addTrack(libraryTrack)
        }
        selectedTracks.removeAll()
    }
}
