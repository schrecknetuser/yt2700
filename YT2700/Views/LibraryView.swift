import SwiftUI

struct LibraryView: View {
    @State private var selectedTab = 0
    @State private var tracks: [Track] = []
    @State private var authors: [Author] = []
    @State private var playlists: [Playlist] = []
    @State private var selectedTracks = Set<UUID>()
    @State private var showingActionSheet = false
    @State private var showingAddTrack = false
    @State private var showingCreatePlaylist = false
    @State private var newPlaylistName = ""
    @EnvironmentObject var audioPlayer: AudioPlayerService
    
    var body: some View {
        NavigationView {
            VStack {
                Picker("View", selection: $selectedTab) {
                    Text("Tracks").tag(0)
                    Text("Authors").tag(1)
                    Text("Playlists").tag(2)
                }
                .pickerStyle(.segmented)
                .padding()
                
                if selectedTab == 0 {
                    tracksView
                } else if selectedTab == 1 {
                    authorsView
                } else {
                    playlistsView
                }
            }
            .navigationTitle("Library")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddTrack = true }) {
                        Image(systemName: "plus")
                    }
                }
                
                if !selectedTracks.isEmpty {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Actions") {
                            showingActionSheet = true
                        }
                    }
                }
            }
            .sheet(isPresented: $showingAddTrack) {
                SearchView()
            }
            .sheet(isPresented: $showingCreatePlaylist) {
                createPlaylistView
            }
            .confirmationDialog("Track Actions", isPresented: $showingActionSheet) {
                Button("Play Now") { playNow() }
                Button("Play Next") { playNext() }
                Button("Add to Playlist") { showingCreatePlaylist = true }
                Button("Delete from Library") { deleteFromLibrary() }
                Button("Cancel", role: .cancel) { }
            }
        }
        .onAppear {
            loadData()
        }
    }
    
    var tracksView: some View {
        VStack {
            Button("Shuffle Play All") {
                audioPlayer.shuffleEnabled = true
                audioPlayer.repeatEnabled = true
                audioPlayer.playTracks(tracks)
            }
            .padding()
            
            List(tracks, selection: $selectedTracks) { track in
                TrackRow(track: track, isInLibrary: true)
                    .contentShape(Rectangle())
                    .onTapGesture {
                        if selectedTracks.isEmpty {
                            audioPlayer.playTracks(tracks, startingAt: tracks.firstIndex(of: track) ?? 0)
                        } else {
                            toggleSelection(track.id)
                        }
                    }
            }
            .environment(\.editMode, selectedTracks.isEmpty ? .constant(.inactive) : .constant(.active))
        }
    }
    
    var authorsView: some View {
        VStack {
            List(authors) { author in
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
    
    var playlistsView: some View {
        VStack {
            Button("Create Playlist") {
                showingCreatePlaylist = true
            }
            .padding()
            
            List(playlists) { playlist in
                NavigationLink(destination: PlaylistDetailView(playlist: playlist)) {
                    VStack(alignment: .leading) {
                        Text(playlist.name)
                            .font(.headline)
                        Text("\(playlist.tracks.count) tracks")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                }
            }
        }
    }
    
    var createPlaylistView: some View {
        NavigationView {
            VStack {
                TextField("Playlist Name", text: $newPlaylistName)
                    .textFieldStyle(.roundedBorder)
                    .padding()
                
                Button("Create") {
                    let playlist = Playlist(name: newPlaylistName)
                    PersistenceController.shared.addPlaylist(playlist)
                    loadData()
                    newPlaylistName = ""
                    showingCreatePlaylist = false
                }
                .disabled(newPlaylistName.isEmpty)
                .padding()
                
                Spacer()
            }
            .navigationTitle("New Playlist")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        showingCreatePlaylist = false
                        newPlaylistName = ""
                    }
                }
            }
        }
    }
    
    func loadData() {
        tracks = PersistenceController.shared.fetchTracks()
        playlists = PersistenceController.shared.fetchPlaylists()
        
        let authorNames = Set(tracks.map { $0.authorName })
        authors = authorNames.map { name in
            let count = tracks.filter { $0.authorName == name }.count
            return Author(name: name, trackCount: count)
        }.sorted { $0.name < $1.name }
    }
    
    func toggleSelection(_ id: UUID) {
        if selectedTracks.contains(id) {
            selectedTracks.remove(id)
        } else {
            selectedTracks.insert(id)
        }
    }
    
    func playNow() {
        let selected = tracks.filter { selectedTracks.contains($0.id) }
        audioPlayer.playNow(selected)
        selectedTracks.removeAll()
    }
    
    func playNext() {
        let selected = tracks.filter { selectedTracks.contains($0.id) }
        audioPlayer.playNext(selected)
        selectedTracks.removeAll()
    }
    
    func deleteFromLibrary() {
        let selected = tracks.filter { selectedTracks.contains($0.id) }
        selected.forEach { PersistenceController.shared.deleteTrack($0) }
        selectedTracks.removeAll()
        loadData()
    }
}

struct TrackRow: View {
    let track: Track
    let isInLibrary: Bool
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(track.name)
                    .font(.headline)
                    .foregroundColor(isInLibrary ? .primary : .blue)
                Text(track.authorName)
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            Spacer()
            Text(formatDuration(track.duration))
                .font(.caption)
                .foregroundColor(.gray)
        }
    }
    
    func formatDuration(_ duration: TimeInterval) -> String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

struct AuthorDetailView: View {
    let author: Author
    @State private var tracks: [Track] = []
    @State private var sortBy = 0
    @State private var searchText = ""
    @EnvironmentObject var audioPlayer: AudioPlayerService
    
    var filteredTracks: [Track] {
        let authorTracks = PersistenceController.shared.fetchTracks()
            .filter { $0.authorName == author.name }
        
        let searched = searchText.isEmpty ? authorTracks : authorTracks.filter {
            $0.name.localizedCaseInsensitiveContains(searchText)
        }
        
        return sortBy == 0 ? searched.sorted { $0.dateAdded > $1.dateAdded } : searched.sorted { $0.name < $1.name }
    }
    
    var body: some View {
        VStack {
            Picker("Sort By", selection: $sortBy) {
                Text("Date").tag(0)
                Text("Name").tag(1)
            }
            .pickerStyle(.segmented)
            .padding()
            
            SearchBar(text: $searchText, placeholder: "Search tracks...")
            
            List(filteredTracks) { track in
                TrackRow(track: track, isInLibrary: true)
                    .onTapGesture {
                        audioPlayer.playTracks(filteredTracks, startingAt: filteredTracks.firstIndex(of: track) ?? 0)
                    }
            }
        }
        .navigationTitle(author.name)
    }
}

struct PlaylistDetailView: View {
    let playlist: Playlist
    @EnvironmentObject var audioPlayer: AudioPlayerService
    
    var body: some View {
        List(playlist.tracks) { track in
            TrackRow(track: track, isInLibrary: true)
                .onTapGesture {
                    audioPlayer.playTracks(playlist.tracks, startingAt: playlist.tracks.firstIndex(of: track) ?? 0)
                }
        }
        .navigationTitle(playlist.name)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Shuffle Play") {
                    audioPlayer.shuffleEnabled = true
                    audioPlayer.repeatEnabled = true
                    audioPlayer.playTracks(playlist.tracks)
                }
            }
        }
    }
}

struct SearchBar: View {
    @Binding var text: String
    var placeholder: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            TextField(placeholder, text: $text)
                .textFieldStyle(.plain)
            if !text.isEmpty {
                Button(action: { text = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                }
            }
        }
        .padding(8)
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .padding(.horizontal)
    }
}
