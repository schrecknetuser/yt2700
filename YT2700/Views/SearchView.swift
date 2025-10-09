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
    @EnvironmentObject var audioPlayer: AudioPlayerService
    
    var body: some View {
        NavigationView {
            VStack {
                SearchBar(text: $searchText, placeholder: "Search for tracks or authors...")
                    .padding(.top)
                
                if !hasSearched && searchHistory.isEmpty {
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
        
        PersistenceController.shared.addSearchHistory(query)
        loadSearchHistory()
        
        let allTracks = PersistenceController.shared.fetchTracks()
        searchResults = generateMockSearchResults(query: query, existingTracks: allTracks)
        
        let authorNames = Set(searchResults.map { $0.authorName })
        searchAuthors = authorNames.map { name in
            let count = searchResults.filter { $0.authorName == name }.count
            return Author(name: name, trackCount: count)
        }.filter { $0.name.localizedCaseInsensitiveContains(query) }
        
        searchResults = searchResults.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }
    
    func generateMockSearchResults(query: String, existingTracks: [Track]) -> [Track] {
        var results: [Track] = []
        let existingIDs = Set(existingTracks.map { $0.id })
        
        for i in 1...10 {
            let trackID = UUID()
            let track = Track(
                id: trackID,
                name: "Track \(i) - \(query)",
                authorName: "Artist \(i % 3 + 1)",
                duration: Double.random(in: 120...300),
                youtubeID: "yt_\(trackID.uuidString.prefix(8))",
                inLibrary: existingIDs.contains(trackID)
            )
            results.append(track)
        }
        
        return results
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
