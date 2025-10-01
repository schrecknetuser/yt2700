import * as FileSystem from 'expo-file-system';
import { Track } from '../models/Track';
import { StorageService } from './StorageService';

/**
 * DownloadService
 * 
 * This service handles downloading YouTube audio tracks for offline playback.
 * 
 * IMPORTANT: This is a mock implementation. For production use, you'll need:
 * 1. A backend service to handle YouTube downloads (youtube-dl, yt-dlp)
 * 2. Proper legal compliance with YouTube's Terms of Service
 * 3. Audio conversion and quality selection
 * 4. Progress tracking and cancellation support
 */

export interface DownloadProgress {
  trackId: string;
  progress: number; // 0-100
  bytesDownloaded: number;
  totalBytes: number;
}

export class DownloadService {
  private static downloads = new Map<string, FileSystem.DownloadResumable>();
  private static progressCallbacks = new Map<string, (progress: DownloadProgress) => void>();

  /**
   * Download a track for offline playback
   * 
   * Production implementation would:
   * 1. Call a backend API that uses youtube-dl/yt-dlp to extract audio URL
   * 2. Download the audio file to local storage
   * 3. Update track record with local file path
   * 4. Provide progress updates
   */
  static async downloadTrack(
    track: Track,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    console.log(`[DownloadService] Starting download for: ${track.title}`);

    // In production, you would:
    // 1. Call your backend API to get the actual download URL
    // const response = await fetch(`YOUR_API/download?videoId=${track.id}`);
    // const { downloadUrl } = await response.json();

    // For now, we'll use a mock URL
    const mockDownloadUrl = track.youtubeUrl;
    
    // Create local file path
    const fileName = `${track.id}.m4a`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    try {
      // Check if already downloaded
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        console.log(`[DownloadService] Track already downloaded: ${fileUri}`);
        return fileUri;
      }

      // Create download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        mockDownloadUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress: DownloadProgress = {
            trackId: track.id,
            progress: (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100,
            bytesDownloaded: downloadProgress.totalBytesWritten,
            totalBytes: downloadProgress.totalBytesExpectedToWrite,
          };
          
          if (onProgress) {
            onProgress(progress);
          }
          
          const callback = this.progressCallbacks.get(track.id);
          if (callback) {
            callback(progress);
          }
        }
      );

      this.downloads.set(track.id, downloadResumable);

      // Start download
      // Note: In mock mode, this will fail since we don't have a real download URL
      // In production, this would actually download the file
      try {
        const result = await downloadResumable.downloadAsync();
        
        if (result && result.uri) {
          console.log(`[DownloadService] Download complete: ${result.uri}`);
          
          // Update track with local path
          const updatedTrack = {
            ...track,
            localPath: result.uri,
            isDownloaded: true,
          };
          await StorageService.addTrack(updatedTrack);
          
          this.downloads.delete(track.id);
          return result.uri;
        }
      } catch (error) {
        // In mock mode, we'll simulate a successful download
        console.log(`[DownloadService] Mock mode - simulating successful download`);
        
        const updatedTrack = {
          ...track,
          localPath: fileUri,
          isDownloaded: true,
        };
        await StorageService.addTrack(updatedTrack);
        
        return fileUri;
      }

      throw new Error('Download failed');
    } catch (error) {
      console.error(`[DownloadService] Error downloading track:`, error);
      this.downloads.delete(track.id);
      throw error;
    }
  }

  /**
   * Cancel an ongoing download
   */
  static async cancelDownload(trackId: string): Promise<void> {
    const download = this.downloads.get(trackId);
    if (download) {
      try {
        await download.pauseAsync();
        this.downloads.delete(trackId);
        this.progressCallbacks.delete(trackId);
        console.log(`[DownloadService] Download cancelled: ${trackId}`);
      } catch (error) {
        console.error(`[DownloadService] Error cancelling download:`, error);
      }
    }
  }

  /**
   * Register a progress callback for a specific track
   */
  static registerProgressCallback(
    trackId: string,
    callback: (progress: DownloadProgress) => void
  ): void {
    this.progressCallbacks.set(trackId, callback);
  }

  /**
   * Unregister a progress callback
   */
  static unregisterProgressCallback(trackId: string): void {
    this.progressCallbacks.delete(trackId);
  }

  /**
   * Delete a downloaded track
   */
  static async deleteDownload(track: Track): Promise<void> {
    if (!track.localPath) {
      return;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(track.localPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(track.localPath);
        console.log(`[DownloadService] Deleted: ${track.localPath}`);
      }

      // Update track to mark as not downloaded
      const updatedTrack = {
        ...track,
        localPath: undefined,
        isDownloaded: false,
      };
      await StorageService.addTrack(updatedTrack);
    } catch (error) {
      console.error(`[DownloadService] Error deleting download:`, error);
      throw error;
    }
  }

  /**
   * Get total size of all downloads
   */
  static async getTotalDownloadSize(): Promise<number> {
    const tracks = await StorageService.getTracks();
    const downloadedTracks = tracks.filter(t => t.isDownloaded && t.localPath);

    let totalSize = 0;
    for (const track of downloadedTracks) {
      if (track.localPath) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(track.localPath);
          if (fileInfo.exists && 'size' in fileInfo) {
            totalSize += fileInfo.size;
          }
        } catch (error) {
          console.error(`[DownloadService] Error getting file size:`, error);
        }
      }
    }

    return totalSize;
  }

  /**
   * Check if enough storage is available for download
   */
  static async hasEnoughStorage(estimatedSize: number): Promise<boolean> {
    try {
      const freeDiskStorage = await FileSystem.getFreeDiskStorageAsync();
      
      // Require at least 100MB free space after download
      const requiredSpace = estimatedSize + (100 * 1024 * 1024);
      
      return freeDiskStorage > requiredSpace;
    } catch (error) {
      console.error(`[DownloadService] Error checking storage:`, error);
      return false;
    }
  }
}

/**
 * Backend API Example
 * 
 * For production use, you would need a backend service like:
 * 
 * ```python
 * # Python/Flask backend example
 * from flask import Flask, jsonify, request
 * import yt_dlp
 * 
 * app = Flask(__name__)
 * 
 * @app.route('/api/download', methods=['GET'])
 * def get_download_url():
 *     video_id = request.args.get('videoId')
 *     
 *     ydl_opts = {
 *         'format': 'bestaudio/best',
 *         'quiet': True,
 *     }
 *     
 *     with yt_dlp.YoutubeDL(ydl_opts) as ydl:
 *         info = ydl.extract_info(f'https://youtube.com/watch?v={video_id}', download=False)
 *         return jsonify({
 *             'downloadUrl': info['url'],
 *             'title': info['title'],
 *             'duration': info['duration'],
 *         })
 * ```
 * 
 * IMPORTANT LEGAL NOTICE:
 * - Downloading YouTube content may violate YouTube's Terms of Service
 * - Always ensure you have proper rights and permissions
 * - Consider YouTube Premium API for legitimate offline playback
 * - This implementation is for educational purposes only
 */
