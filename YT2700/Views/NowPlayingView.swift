import SwiftUI

struct NowPlayingView: View {
    @EnvironmentObject var audioPlayer: AudioPlayerService
    @State private var isDraggingSlider = false
    @State private var sliderValue: Double = 0
    
    var body: some View {
        NavigationView {
            VStack {
                if let track = audioPlayer.currentTrack {
                    currentTrackView(track: track)
                } else {
                    emptyStateView
                }
                
                Spacer()
                
                if !audioPlayer.queue.isEmpty {
                    queueView
                }
            }
            .navigationTitle("Now Playing")
        }
    }
    
    func currentTrackView(track: Track) -> some View {
        VStack(spacing: 20) {
            Image(systemName: "music.note")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 200, height: 200)
                .foregroundColor(.blue)
                .padding()
            
            VStack(spacing: 8) {
                Text(track.name)
                    .font(.title2)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                
                Text(track.authorName)
                    .font(.title3)
                    .foregroundColor(.gray)
            }
            .padding(.horizontal)
            
            VStack(spacing: 8) {
                Slider(
                    value: $sliderValue,
                    in: 0...max(audioPlayer.duration, 1),
                    onEditingChanged: { editing in
                        isDraggingSlider = editing
                        if !editing {
                            audioPlayer.seek(to: sliderValue)
                        }
                    }
                )
                .padding(.horizontal)
                .onChange(of: audioPlayer.currentTime) { newValue in
                    if !isDraggingSlider {
                        sliderValue = newValue
                    }
                }
                
                HStack {
                    Text(formatTime(isDraggingSlider ? sliderValue : audioPlayer.currentTime))
                        .font(.caption)
                        .foregroundColor(.gray)
                    Spacer()
                    Text(formatTime(audioPlayer.duration))
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                .padding(.horizontal)
            }
            
            HStack(spacing: 40) {
                Button(action: {
                    audioPlayer.toggleShuffle()
                }) {
                    Image(systemName: audioPlayer.shuffleEnabled ? "shuffle.circle.fill" : "shuffle.circle")
                        .resizable()
                        .frame(width: 32, height: 32)
                        .foregroundColor(audioPlayer.shuffleEnabled ? .blue : .gray)
                }
                
                Button(action: {
                    audioPlayer.playPrevious()
                }) {
                    Image(systemName: "backward.fill")
                        .resizable()
                        .frame(width: 32, height: 32)
                }
                
                Button(action: {
                    audioPlayer.togglePlayPause()
                }) {
                    Image(systemName: audioPlayer.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                        .resizable()
                        .frame(width: 64, height: 64)
                }
                
                Button(action: {
                    audioPlayer.playNext()
                }) {
                    Image(systemName: "forward.fill")
                        .resizable()
                        .frame(width: 32, height: 32)
                }
                
                Button(action: {
                    audioPlayer.toggleRepeat()
                }) {
                    Image(systemName: audioPlayer.repeatEnabled ? "repeat.circle.fill" : "repeat.circle")
                        .resizable()
                        .frame(width: 32, height: 32)
                        .foregroundColor(audioPlayer.repeatEnabled ? .blue : .gray)
                }
            }
            .padding()
        }
    }
    
    var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "music.note.list")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 100, height: 100)
                .foregroundColor(.gray)
            
            Text("No track playing")
                .font(.title2)
                .foregroundColor(.gray)
            
            Text("Select a track from your library to start playing")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
    }
    
    var queueView: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Up Next")
                .font(.headline)
                .padding(.horizontal)
            
            List {
                ForEach(Array(audioPlayer.queue.enumerated()), id: \.element.id) { index, track in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(track.name)
                                .font(.subheadline)
                            Text(track.authorName)
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Image(systemName: "line.3.horizontal")
                            .foregroundColor(.gray)
                    }
                }
                .onMove { source, destination in
                    audioPlayer.reorderQueue(from: source, to: destination)
                }
            }
            .frame(maxHeight: 300)
        }
    }
    
    func formatTime(_ time: TimeInterval) -> String {
        let minutes = Int(time) / 60
        let seconds = Int(time) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

struct NowPlayingView_Previews: PreviewProvider {
    static var previews: some View {
        NowPlayingView()
            .environmentObject(AudioPlayerService.shared)
    }
}
