import { Audio } from 'expo-av';
import { Track } from '../models/Track';

export class AudioService {
  private static sound: Audio.Sound | null = null;
  private static currentTrack: Track | null = null;
  private static onPlaybackStatusUpdate: ((status: any) => void) | null = null;

  /**
   * Initialize audio mode
   */
  static async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Audio initialization error:', error);
    }
  }

  /**
   * Load and play a track
   */
  static async playTrack(track: Track, onStatusUpdate?: (status: any) => void): Promise<void> {
    try {
      // Unload previous track
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      this.currentTrack = track;
      this.onPlaybackStatusUpdate = onStatusUpdate || null;

      // For now, we'll use a placeholder URL since we don't have actual audio files
      // In production, you would:
      // 1. Use the track's localPath if downloaded
      // 2. Or stream from a backend that extracts audio from YouTube
      
      let audioUrl: string;
      
      if (track.isDownloaded && track.localPath) {
        // Use local file
        audioUrl = track.localPath;
      } else {
        // In production, this would be your backend API that streams audio
        // For now, use a sample audio URL for demonstration
        console.log(`Would stream audio for: ${track.title}`);
        // Using a public domain sample for demonstration
        audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        this.handlePlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Play track error:', error);
      throw error;
    }
  }

  /**
   * Handle playback status updates
   */
  private static handlePlaybackStatusUpdate(status: any): void {
    if (this.onPlaybackStatusUpdate) {
      this.onPlaybackStatusUpdate(status);
    }

    // Handle track completion
    if (status.didJustFinish && !status.isLooping) {
      console.log('Track finished playing');
    }
  }

  /**
   * Pause playback
   */
  static async pause(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (error) {
      console.error('Pause error:', error);
    }
  }

  /**
   * Resume playback
   */
  static async resume(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (error) {
      console.error('Resume error:', error);
    }
  }

  /**
   * Stop playback
   */
  static async stop(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentTrack = null;
      }
    } catch (error) {
      console.error('Stop error:', error);
    }
  }

  /**
   * Seek to position (in milliseconds)
   */
  static async seekTo(positionMillis: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionMillis);
      }
    } catch (error) {
      console.error('Seek error:', error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  static async setVolume(volume: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (error) {
      console.error('Set volume error:', error);
    }
  }

  /**
   * Get current playback status
   */
  static async getStatus(): Promise<any> {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error('Get status error:', error);
      return null;
    }
  }

  /**
   * Get current track
   */
  static getCurrentTrack(): Track | null {
    return this.currentTrack;
  }
}
