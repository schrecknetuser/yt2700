import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Author, Playlist, PlaybackState } from '../models/Track';

const KEYS = {
  TRACKS: '@yt2700_tracks',
  AUTHORS: '@yt2700_authors',
  PLAYLISTS: '@yt2700_playlists',
  LAST_PLAYED: '@yt2700_last_played',
  SEARCH_HISTORY: '@yt2700_search_history',
};

export class StorageService {
  // Tracks
  static async getTracks(): Promise<Track[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TRACKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting tracks:', error);
      return [];
    }
  }

  static async saveTracks(tracks: Track[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.TRACKS, JSON.stringify(tracks));
    } catch (error) {
      console.error('Error saving tracks:', error);
    }
  }

  static async addTrack(track: Track): Promise<void> {
    const tracks = await this.getTracks();
    const existingIndex = tracks.findIndex(t => t.id === track.id);
    if (existingIndex >= 0) {
      tracks[existingIndex] = track;
    } else {
      tracks.push(track);
    }
    await this.saveTracks(tracks);
  }

  static async deleteTrack(trackId: string): Promise<void> {
    const tracks = await this.getTracks();
    const filtered = tracks.filter(t => t.id !== trackId);
    await this.saveTracks(filtered);
  }

  // Authors
  static async getAuthors(): Promise<Author[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.AUTHORS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting authors:', error);
      return [];
    }
  }

  static async saveAuthors(authors: Author[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.AUTHORS, JSON.stringify(authors));
    } catch (error) {
      console.error('Error saving authors:', error);
    }
  }

  static async addAuthor(author: Author): Promise<void> {
    const authors = await this.getAuthors();
    const existingIndex = authors.findIndex(a => a.id === author.id);
    if (existingIndex >= 0) {
      authors[existingIndex] = author;
    } else {
      authors.push(author);
    }
    await this.saveAuthors(authors);
  }

  // Playlists
  static async getPlaylists(): Promise<Playlist[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting playlists:', error);
      return [];
    }
  }

  static async savePlaylists(playlists: Playlist[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  }

  static async addPlaylist(playlist: Playlist): Promise<void> {
    const playlists = await this.getPlaylists();
    playlists.push(playlist);
    await this.savePlaylists(playlists);
  }

  static async updatePlaylist(playlist: Playlist): Promise<void> {
    const playlists = await this.getPlaylists();
    const index = playlists.findIndex(p => p.id === playlist.id);
    if (index >= 0) {
      playlists[index] = playlist;
      await this.savePlaylists(playlists);
    }
  }

  static async deletePlaylist(playlistId: string): Promise<void> {
    const playlists = await this.getPlaylists();
    const filtered = playlists.filter(p => p.id !== playlistId);
    await this.savePlaylists(filtered);
  }

  // Last played track
  static async saveLastPlayedTrack(trackId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LAST_PLAYED, trackId);
    } catch (error) {
      console.error('Error saving last played track:', error);
    }
  }

  static async getLastPlayedTrack(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.LAST_PLAYED);
    } catch (error) {
      console.error('Error getting last played track:', error);
      return null;
    }
  }

  // Search history
  static async getSearchHistory(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SEARCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  static async addToSearchHistory(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const filtered = history.filter(h => h !== query);
      filtered.unshift(query);
      const limited = filtered.slice(0, 10);
      await AsyncStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(limited));
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }
}
