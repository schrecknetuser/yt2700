import { StorageService } from '../../services/StorageService';
import { Track, Playlist } from '../../models/Track';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('StorageService', () => {
  beforeEach(async () => {
    // Clear all mocks and storage before each test
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  describe('Tracks', () => {
    it('should save and retrieve tracks', async () => {
      const track: Track = {
        id: 'track1',
        title: 'Test Track',
        authorId: 'author1',
        authorName: 'Test Author',
        duration: 180,
        youtubeUrl: 'https://youtube.com/watch?v=test',
        isDownloaded: false,
        addedAt: new Date(),
      };

      await StorageService.addTrack(track);
      const tracks = await StorageService.getTracks();
      
      expect(tracks).toHaveLength(1);
      expect(tracks[0].id).toBe('track1');
      expect(tracks[0].title).toBe('Test Track');
    });

    it('should delete a track', async () => {
      const track: Track = {
        id: 'track1',
        title: 'Test Track',
        authorId: 'author1',
        authorName: 'Test Author',
        duration: 180,
        youtubeUrl: 'https://youtube.com/watch?v=test',
        isDownloaded: false,
        addedAt: new Date(),
      };

      await StorageService.addTrack(track);
      await StorageService.deleteTrack('track1');
      const tracks = await StorageService.getTracks();
      
      expect(tracks).toHaveLength(0);
    });
  });

  describe('Playlists', () => {
    it('should save and retrieve playlists', async () => {
      const playlist: Playlist = {
        id: 'playlist1',
        name: 'Test Playlist',
        trackIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.addPlaylist(playlist);
      const playlists = await StorageService.getPlaylists();
      
      expect(playlists).toHaveLength(1);
      expect(playlists[0].id).toBe('playlist1');
      expect(playlists[0].name).toBe('Test Playlist');
    });

    it('should update a playlist', async () => {
      const playlist: Playlist = {
        id: 'playlist1',
        name: 'Test Playlist',
        trackIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.addPlaylist(playlist);
      
      const updatedPlaylist = {
        ...playlist,
        trackIds: ['track1', 'track2'],
      };
      
      await StorageService.updatePlaylist(updatedPlaylist);
      const playlists = await StorageService.getPlaylists();
      
      expect(playlists[0].trackIds).toHaveLength(2);
    });

    it('should delete a playlist', async () => {
      const playlist: Playlist = {
        id: 'playlist1',
        name: 'Test Playlist',
        trackIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.addPlaylist(playlist);
      await StorageService.deletePlaylist('playlist1');
      const playlists = await StorageService.getPlaylists();
      
      expect(playlists).toHaveLength(0);
    });
  });

  describe('Search History', () => {
    it('should save and retrieve search history', async () => {
      await StorageService.addToSearchHistory('test query 1');
      await StorageService.addToSearchHistory('test query 2');
      
      const history = await StorageService.getSearchHistory();
      
      expect(history).toHaveLength(2);
      expect(history[0]).toBe('test query 2'); // Most recent first
      expect(history[1]).toBe('test query 1');
    });

    it('should limit search history to 10 items', async () => {
      for (let i = 0; i < 15; i++) {
        await StorageService.addToSearchHistory(`query ${i}`);
      }
      
      const history = await StorageService.getSearchHistory();
      
      expect(history).toHaveLength(10);
    });

    it('should not duplicate search queries', async () => {
      await StorageService.addToSearchHistory('test query');
      await StorageService.addToSearchHistory('test query');
      
      const history = await StorageService.getSearchHistory();
      
      expect(history).toHaveLength(1);
    });
  });

  describe('Last Played Track', () => {
    it('should save and retrieve last played track', async () => {
      await StorageService.saveLastPlayedTrack('track1');
      const lastPlayed = await StorageService.getLastPlayedTrack();
      
      expect(lastPlayed).toBe('track1');
    });
  });
});
