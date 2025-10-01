export interface Track {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  duration: number;
  thumbnailUrl?: string;
  youtubeUrl: string;
  localPath?: string;
  isDownloaded: boolean;
  addedAt: Date;
}

export interface Author {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaybackState {
  currentTrack?: Track;
  queue: Track[];
  position: number;
  isPlaying: boolean;
  isShuffled: boolean;
  isRepeating: boolean;
}
