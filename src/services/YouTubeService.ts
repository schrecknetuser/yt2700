import { Track, Author } from '../models/Track';
import { AuthService } from './AuthService';
import { AppConfig } from '../config/AppConfig';

export interface SearchResult {
  tracks: Track[];
  authors: Author[];
}

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelId: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  contentDetails?: {
    duration: string;
  };
}

interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      default: { url: string };
    };
  };
}

export class YouTubeService {
  private static readonly BASE_URL = AppConfig.youtube.apiBaseUrl;
  private static readonly MAX_RESULTS = AppConfig.youtube.maxSearchResults;

  /**
   * Parse ISO 8601 duration to seconds
   */
  private static parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Search for videos on YouTube
   */
  static async search(query: string): Promise<SearchResult> {
    try {
      const accessToken = await AuthService.getAccessToken();
      
      if (!accessToken) {
        console.warn('No access token available, returning mock data');
        return this.getMockSearchResults(query);
      }

      // Search for videos
      const searchUrl = new URL(`${this.BASE_URL}/search`);
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('q', query);
      searchUrl.searchParams.append('type', 'video');
      searchUrl.searchParams.append('videoCategoryId', '10'); // Music category
      searchUrl.searchParams.append('maxResults', this.MAX_RESULTS.toString());
      searchUrl.searchParams.append('key', AppConfig.youtube.apiKey);

      const searchResponse = await fetch(searchUrl.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!searchResponse.ok) {
        console.error('YouTube search error:', searchResponse.status);
        return this.getMockSearchResults(query);
      }

      const searchData = await searchResponse.json();
      const videos: YouTubeVideo[] = searchData.items || [];

      if (videos.length === 0) {
        return { tracks: [], authors: [] };
      }

      // Get video details for duration
      const videoIds = videos.map((v: YouTubeVideo) => v.id.videoId).join(',');
      const detailsUrl = new URL(`${this.BASE_URL}/videos`);
      detailsUrl.searchParams.append('part', 'contentDetails');
      detailsUrl.searchParams.append('id', videoIds);
      detailsUrl.searchParams.append('key', AppConfig.youtube.apiKey);

      const detailsResponse = await fetch(detailsUrl.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const detailsData = await detailsResponse.json();
      const videoDetails = detailsData.items || [];

      // Create duration map
      const durationMap = new Map<string, number>();
      videoDetails.forEach((video: any) => {
        durationMap.set(
          video.id,
          this.parseDuration(video.contentDetails.duration)
        );
      });

      // Convert to tracks
      const tracks: Track[] = videos.map((video: YouTubeVideo) => ({
        id: video.id.videoId,
        title: video.snippet.title,
        authorId: video.snippet.channelId,
        authorName: video.snippet.channelTitle,
        duration: durationMap.get(video.id.videoId) || 0,
        thumbnailUrl: video.snippet.thumbnails.high.url,
        youtubeUrl: `https://youtube.com/watch?v=${video.id.videoId}`,
        isDownloaded: false,
        addedAt: new Date(),
      }));

      // Extract unique authors
      const authorsMap = new Map<string, Author>();
      videos.forEach((video: YouTubeVideo) => {
        if (!authorsMap.has(video.snippet.channelId)) {
          authorsMap.set(video.snippet.channelId, {
            id: video.snippet.channelId,
            name: video.snippet.channelTitle,
            thumbnailUrl: video.snippet.thumbnails.default.url,
          });
        }
      });

      const authors = Array.from(authorsMap.values());

      return { tracks, authors };
    } catch (error) {
      console.error('YouTube search error:', error);
      return this.getMockSearchResults(query);
    }
  }

  /**
   * Get tracks by channel/author
   */
  static async getAuthorTracks(authorId: string): Promise<Track[]> {
    try {
      const accessToken = await AuthService.getAccessToken();
      
      if (!accessToken) {
        console.warn('No access token available, returning mock data');
        return this.getMockAuthorTracks(authorId);
      }

      // Search for videos by channel
      const searchUrl = new URL(`${this.BASE_URL}/search`);
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('channelId', authorId);
      searchUrl.searchParams.append('type', 'video');
      searchUrl.searchParams.append('order', 'date');
      searchUrl.searchParams.append('maxResults', '50');
      searchUrl.searchParams.append('key', AppConfig.youtube.apiKey);

      const searchResponse = await fetch(searchUrl.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!searchResponse.ok) {
        return this.getMockAuthorTracks(authorId);
      }

      const searchData = await searchResponse.json();
      const videos: YouTubeVideo[] = searchData.items || [];

      if (videos.length === 0) {
        return [];
      }

      // Get video details for duration
      const videoIds = videos.map((v: YouTubeVideo) => v.id.videoId).join(',');
      const detailsUrl = new URL(`${this.BASE_URL}/videos`);
      detailsUrl.searchParams.append('part', 'contentDetails');
      detailsUrl.searchParams.append('id', videoIds);
      detailsUrl.searchParams.append('key', AppConfig.youtube.apiKey);

      const detailsResponse = await fetch(detailsUrl.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const detailsData = await detailsResponse.json();
      const videoDetails = detailsData.items || [];

      const durationMap = new Map<string, number>();
      videoDetails.forEach((video: any) => {
        durationMap.set(
          video.id,
          this.parseDuration(video.contentDetails.duration)
        );
      });

      return videos.map((video: YouTubeVideo) => ({
        id: video.id.videoId,
        title: video.snippet.title,
        authorId: video.snippet.channelId,
        authorName: video.snippet.channelTitle,
        duration: durationMap.get(video.id.videoId) || 0,
        thumbnailUrl: video.snippet.thumbnails.high.url,
        youtubeUrl: `https://youtube.com/watch?v=${video.id.videoId}`,
        isDownloaded: false,
        addedAt: new Date(),
      }));
    } catch (error) {
      console.error('Get author tracks error:', error);
      return this.getMockAuthorTracks(authorId);
    }
  }

  /**
   * Get mock search results (fallback when not authenticated)
   */
  private static getMockSearchResults(query: string): SearchResult {
    return {
      tracks: [
        {
          id: `track_${Date.now()}_1`,
          title: `${query} - Song 1`,
          authorId: 'author_1',
          authorName: 'Artist 1',
          duration: 180,
          youtubeUrl: 'https://youtube.com/watch?v=mock1',
          isDownloaded: false,
          addedAt: new Date(),
        },
        {
          id: `track_${Date.now()}_2`,
          title: `${query} - Song 2`,
          authorId: 'author_2',
          authorName: 'Artist 2',
          duration: 240,
          youtubeUrl: 'https://youtube.com/watch?v=mock2',
          isDownloaded: false,
          addedAt: new Date(),
        },
      ],
      authors: [
        {
          id: 'author_1',
          name: 'Artist 1',
        },
        {
          id: 'author_2',
          name: 'Artist 2',
        },
      ],
    };
  }

  /**
   * Get mock author tracks (fallback when not authenticated)
   */
  private static getMockAuthorTracks(authorId: string): Track[] {
    return [
      {
        id: `track_${authorId}_1`,
        title: 'Song by Author',
        authorId,
        authorName: 'Artist Name',
        duration: 200,
        youtubeUrl: 'https://youtube.com/watch?v=mock',
        isDownloaded: false,
        addedAt: new Date(),
      },
    ];
  }
}
