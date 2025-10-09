import Foundation
import AVFoundation
import MediaPlayer
import Combine

class AudioPlayerService: NSObject, ObservableObject {
    static let shared = AudioPlayerService()
    
    @Published var currentTrack: Track?
    @Published var isPlaying = false
    @Published var currentTime: TimeInterval = 0
    @Published var duration: TimeInterval = 0
    @Published var queue: [Track] = []
    @Published var shuffleEnabled = false
    @Published var repeatEnabled = false
    
    private var player: AVPlayer?
    private var timeObserver: Any?
    private var originalQueue: [Track] = []
    private var currentIndex = 0
    
    override private init() {
        super.init()
        setupAudioSession()
        setupRemoteCommandCenter()
        setupNotifications()
    }
    
    private func setupAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to set up audio session: \(error)")
        }
    }
    
    private func setupRemoteCommandCenter() {
        let commandCenter = MPRemoteCommandCenter.shared()
        
        commandCenter.playCommand.addTarget { [weak self] _ in
            self?.play()
            return .success
        }
        
        commandCenter.pauseCommand.addTarget { [weak self] _ in
            self?.pause()
            return .success
        }
        
        commandCenter.nextTrackCommand.addTarget { [weak self] _ in
            self?.playNext()
            return .success
        }
        
        commandCenter.previousTrackCommand.addTarget { [weak self] _ in
            self?.playPrevious()
            return .success
        }
        
        commandCenter.changePlaybackPositionCommand.addTarget { [weak self] event in
            guard let event = event as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
            self?.seek(to: event.positionTime)
            return .success
        }
    }
    
    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(playerDidFinishPlaying),
            name: .AVPlayerItemDidPlayToEndTime,
            object: nil
        )
    }
    
    func playTracks(_ tracks: [Track], startingAt index: Int = 0) {
        originalQueue = tracks
        queue = shuffleEnabled ? tracks.shuffled() : tracks
        currentIndex = index
        
        if index < queue.count {
            playTrack(queue[index])
        }
    }
    
    func playTrack(_ track: Track) {
        currentTrack = track
        
        guard let fileURL = track.fileURL else {
            print("Track has no file URL")
            return
        }
        
        let playerItem = AVPlayerItem(url: fileURL)
        player = AVPlayer(playerItem: playerItem)
        
        setupTimeObserver()
        updateNowPlayingInfo()
        
        player?.play()
        isPlaying = true
    }
    
    func play() {
        player?.play()
        isPlaying = true
    }
    
    func pause() {
        player?.pause()
        isPlaying = false
    }
    
    func togglePlayPause() {
        if isPlaying {
            pause()
        } else {
            play()
        }
    }
    
    func playNext() {
        guard !queue.isEmpty else { return }
        
        currentIndex += 1
        
        if currentIndex >= queue.count {
            if repeatEnabled {
                if shuffleEnabled {
                    queue = originalQueue.shuffled()
                }
                currentIndex = 0
            } else {
                pause()
                return
            }
        }
        
        playTrack(queue[currentIndex])
    }
    
    func playPrevious() {
        guard !queue.isEmpty else { return }
        
        if currentTime > 3 {
            seek(to: 0)
        } else {
            currentIndex = max(0, currentIndex - 1)
            playTrack(queue[currentIndex])
        }
    }
    
    func seek(to time: TimeInterval) {
        let cmTime = CMTime(seconds: time, preferredTimescale: 600)
        player?.seek(to: cmTime)
    }
    
    func toggleShuffle() {
        shuffleEnabled.toggle()
        if shuffleEnabled {
            queue = originalQueue.shuffled()
        } else {
            queue = originalQueue
        }
    }
    
    func toggleRepeat() {
        repeatEnabled.toggle()
    }
    
    func addToQueue(_ tracks: [Track]) {
        queue.append(contentsOf: tracks)
        originalQueue.append(contentsOf: tracks)
    }
    
    func playNow(_ tracks: [Track]) {
        let remainingQueue = Array(queue.dropFirst(currentIndex + 1))
        queue = tracks + remainingQueue
        originalQueue = queue
        currentIndex = 0
        
        if let firstTrack = tracks.first {
            playTrack(firstTrack)
        }
    }
    
    func playNext(_ tracks: [Track]) {
        queue.insert(contentsOf: tracks, at: currentIndex + 1)
        originalQueue.insert(contentsOf: tracks, at: currentIndex + 1)
    }
    
    func reorderQueue(from source: IndexSet, to destination: Int) {
        queue.move(fromOffsets: source, toOffset: destination)
    }
    
    private func setupTimeObserver() {
        let interval = CMTime(seconds: 0.5, preferredTimescale: 600)
        timeObserver = player?.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
            self?.currentTime = time.seconds
            
            if let duration = self?.player?.currentItem?.duration.seconds, duration.isFinite {
                self?.duration = duration
            }
        }
    }
    
    @objc private func playerDidFinishPlaying() {
        playNext()
    }
    
    private func updateNowPlayingInfo() {
        guard let track = currentTrack else { return }
        
        var nowPlayingInfo = [String: Any]()
        nowPlayingInfo[MPMediaItemPropertyTitle] = track.name
        nowPlayingInfo[MPMediaItemPropertyArtist] = track.authorName
        nowPlayingInfo[MPMediaItemPropertyPlaybackDuration] = track.duration
        nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = currentTime
        nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = isPlaying ? 1.0 : 0.0
        
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
    }
    
    func restoreLastPlayback() {
        if let lastTrackID = UserDefaults.standard.string(forKey: "lastPlayedTrackID"),
           let lastPosition = UserDefaults.standard.value(forKey: "lastPlaybackPosition") as? TimeInterval {
            let tracks = PersistenceController.shared.fetchTracks()
            if let track = tracks.first(where: { $0.id.uuidString == lastTrackID }) {
                playTrack(track)
                seek(to: lastPosition)
                pause()
            }
        }
    }
    
    func savePlaybackState() {
        if let trackID = currentTrack?.id.uuidString {
            UserDefaults.standard.set(trackID, forKey: "lastPlayedTrackID")
            UserDefaults.standard.set(currentTime, forKey: "lastPlaybackPosition")
        }
    }
    
    deinit {
        if let observer = timeObserver {
            player?.removeTimeObserver(observer)
        }
        NotificationCenter.default.removeObserver(self)
    }
}
