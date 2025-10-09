import CarPlay
import UIKit

class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
    
    var interfaceController: CPInterfaceController?
    private let audioPlayer = AudioPlayerService.shared
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene,
                                 didConnect interfaceController: CPInterfaceController) {
        self.interfaceController = interfaceController
        
        audioPlayer.restoreLastPlayback()
        
        let rootTemplate = createRootTemplate()
        interfaceController.setRootTemplate(rootTemplate, animated: true)
    }
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene,
                                 didDisconnect interfaceController: CPInterfaceController) {
        self.interfaceController = nil
        audioPlayer.savePlaybackState()
    }
    
    private func createRootTemplate() -> CPTabBarTemplate {
        let libraryTab = CPListTemplate(title: "Library", sections: createLibrarySections())
        libraryTab.tabImage = UIImage(systemName: "music.note.list")
        
        let playlistsTab = CPListTemplate(title: "Playlists", sections: createPlaylistsSections())
        playlistsTab.tabImage = UIImage(systemName: "music.note.list")
        
        let nowPlayingTab = createNowPlayingTemplate()
        
        return CPTabBarTemplate(templates: [libraryTab, playlistsTab, nowPlayingTab])
    }
    
    private func createLibrarySections() -> [CPListSection] {
        let tracks = PersistenceController.shared.fetchTracks()
        
        let items = tracks.map { track -> CPListItem in
            let item = CPListItem(text: track.name, detailText: track.authorName)
            item.handler = { [weak self] _, completion in
                self?.playTrack(track, from: tracks)
                completion()
            }
            return item
        }
        
        return [CPListSection(items: items)]
    }
    
    private func createPlaylistsSections() -> [CPListSection] {
        let playlists = PersistenceController.shared.fetchPlaylists()
        
        let items = playlists.map { playlist -> CPListItem in
            let item = CPListItem(text: playlist.name, detailText: "\(playlist.tracks.count) tracks")
            item.handler = { [weak self] _, completion in
                self?.showPlaylist(playlist)
                completion()
            }
            return item
        }
        
        return [CPListSection(items: items)]
    }
    
    private func createNowPlayingTemplate() -> CPNowPlayingTemplate {
        let template = CPNowPlayingTemplate.shared
        template.tabImage = UIImage(systemName: "play.circle.fill")
        
        template.updateNowPlayingButtons([
            createShuffleButton(),
            createPreviousButton(),
            createPlayPauseButton(),
            createNextButton(),
            createRepeatButton()
        ])
        
        return template
    }
    
    private func createShuffleButton() -> CPNowPlayingButton {
        let button = CPNowPlayingShuffleButton { [weak self] button in
            self?.audioPlayer.toggleShuffle()
            button.isSelected = self?.audioPlayer.shuffleEnabled ?? false
        }
        button.isSelected = audioPlayer.shuffleEnabled
        return button
    }
    
    private func createPreviousButton() -> CPNowPlayingButton {
        return CPNowPlayingPreviousButton { [weak self] _ in
            self?.audioPlayer.playPrevious()
        }
    }
    
    private func createPlayPauseButton() -> CPNowPlayingButton {
        return CPNowPlayingPlayPauseButton { [weak self] button in
            self?.audioPlayer.togglePlayPause()
            button.isSelected = self?.audioPlayer.isPlaying ?? false
        }
    }
    
    private func createNextButton() -> CPNowPlayingButton {
        return CPNowPlayingNextButton { [weak self] _ in
            self?.audioPlayer.playNext()
        }
    }
    
    private func createRepeatButton() -> CPNowPlayingButton {
        let button = CPNowPlayingRepeatButton { [weak self] button in
            self?.audioPlayer.toggleRepeat()
            button.isSelected = self?.audioPlayer.repeatEnabled ?? false
        }
        button.isSelected = audioPlayer.repeatEnabled
        return button
    }
    
    private func playTrack(_ track: Track, from tracks: [Track]) {
        if let index = tracks.firstIndex(of: track) {
            audioPlayer.playTracks(tracks, startingAt: index)
        }
    }
    
    private func showPlaylist(_ playlist: Playlist) {
        let items = playlist.tracks.map { track -> CPListItem in
            let item = CPListItem(text: track.name, detailText: track.authorName)
            item.handler = { [weak self] _, completion in
                self?.playTrack(track, from: playlist.tracks)
                completion()
            }
            return item
        }
        
        let template = CPListTemplate(title: playlist.name, sections: [CPListSection(items: items)])
        interfaceController?.pushTemplate(template, animated: true)
    }
}
