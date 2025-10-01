import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Track, Author, Playlist, PlaybackState } from '../models/Track';
import { StorageService } from '../services/StorageService';

interface MusicContextType {
  tracks: Track[];
  authors: Author[];
  playlists: Playlist[];
  playbackState: PlaybackState;
  selectedTracks: Set<string>;
  
  // Track operations
  addTrack: (track: Track) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
  
  // Playlist operations
  createPlaylist: (name: string) => Promise<void>;
  addTracksToPlaylist: (playlistId: string, trackIds: string[]) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  
  // Playback operations
  playTrack: (track: Track) => void;
  playNext: (track: Track) => void;
  playTracks: (tracks: Track[], shuffle?: boolean) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (position: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  
  // Selection operations
  toggleTrackSelection: (trackId: string) => void;
  clearSelection: () => void;
  selectAll: (trackIds: string[]) => void;
  
  // Data operations
  refreshData: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    queue: [],
    position: 0,
    isPlaying: false,
    isShuffled: false,
    isRepeating: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [loadedTracks, loadedAuthors, loadedPlaylists, lastPlayedId] = await Promise.all([
      StorageService.getTracks(),
      StorageService.getAuthors(),
      StorageService.getPlaylists(),
      StorageService.getLastPlayedTrack(),
    ]);
    setTracks(loadedTracks);
    setAuthors(loadedAuthors);
    setPlaylists(loadedPlaylists);
    
    // Auto-resume last played track (useful for CarPlay reconnection)
    if (lastPlayedId && loadedTracks.length > 0) {
      const lastTrack = loadedTracks.find(t => t.id === lastPlayedId);
      if (lastTrack) {
        // Set up the track but don't auto-play on initial app load
        // This will be used when CarPlay connects
        setPlaybackState(prev => ({
          ...prev,
          currentTrack: lastTrack,
          queue: [lastTrack],
        }));
      }
    }
  };

  const addTrack = async (track: Track) => {
    await StorageService.addTrack(track);
    await StorageService.addAuthor({ id: track.authorId, name: track.authorName });
    await loadData();
  };

  const deleteTrack = async (trackId: string) => {
    await StorageService.deleteTrack(trackId);
    await loadData();
  };

  const createPlaylist = async (name: string) => {
    const playlist: Playlist = {
      id: `playlist_${Date.now()}`,
      name,
      trackIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await StorageService.addPlaylist(playlist);
    await loadData();
  };

  const addTracksToPlaylist = async (playlistId: string, trackIds: string[]) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      const updatedPlaylist = {
        ...playlist,
        trackIds: [...new Set([...playlist.trackIds, ...trackIds])],
        updatedAt: new Date(),
      };
      await StorageService.updatePlaylist(updatedPlaylist);
      await loadData();
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    await StorageService.deletePlaylist(playlistId);
    await loadData();
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const playTrack = (track: Track) => {
    setPlaybackState(prev => ({
      ...prev,
      currentTrack: track,
      queue: [track],
      position: 0,
      isPlaying: true,
    }));
    StorageService.saveLastPlayedTrack(track.id);
  };

  const playNext = (track: Track) => {
    setPlaybackState(prev => {
      const newQueue = [...prev.queue];
      newQueue.splice(1, 0, track);
      return {
        ...prev,
        queue: newQueue,
      };
    });
  };

  const playTracks = (tracksToPlay: Track[], shuffle = false) => {
    const queue = shuffle ? shuffleArray(tracksToPlay) : tracksToPlay;
    setPlaybackState(prev => ({
      ...prev,
      currentTrack: queue[0],
      queue,
      position: 0,
      isPlaying: true,
      isShuffled: shuffle,
    }));
    if (queue[0]) {
      StorageService.saveLastPlayedTrack(queue[0].id);
    }
  };

  const pausePlayback = () => {
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
  };

  const resumePlayback = () => {
    setPlaybackState(prev => ({ ...prev, isPlaying: true }));
  };

  const nextTrack = () => {
    setPlaybackState(prev => {
      const currentIndex = prev.queue.findIndex(t => t.id === prev.currentTrack?.id);
      let nextIndex = currentIndex + 1;
      
      if (nextIndex >= prev.queue.length) {
        if (prev.isRepeating) {
          const newQueue = prev.isShuffled ? shuffleArray(prev.queue) : prev.queue;
          nextIndex = 0;
          const nextTrack = newQueue[nextIndex];
          if (nextTrack) {
            StorageService.saveLastPlayedTrack(nextTrack.id);
          }
          return {
            ...prev,
            queue: newQueue,
            currentTrack: newQueue[nextIndex],
            position: 0,
          };
        } else {
          return { ...prev, isPlaying: false };
        }
      }
      
      const nextTrack = prev.queue[nextIndex];
      if (nextTrack) {
        StorageService.saveLastPlayedTrack(nextTrack.id);
      }
      return {
        ...prev,
        currentTrack: nextTrack,
        position: 0,
      };
    });
  };

  const previousTrack = () => {
    setPlaybackState(prev => {
      const currentIndex = prev.queue.findIndex(t => t.id === prev.currentTrack?.id);
      const prevIndex = Math.max(0, currentIndex - 1);
      const prevTrack = prev.queue[prevIndex];
      if (prevTrack) {
        StorageService.saveLastPlayedTrack(prevTrack.id);
      }
      return {
        ...prev,
        currentTrack: prevTrack,
        position: 0,
      };
    });
  };

  const seekTo = (position: number) => {
    setPlaybackState(prev => ({ ...prev, position }));
  };

  const toggleShuffle = () => {
    setPlaybackState(prev => ({ ...prev, isShuffled: !prev.isShuffled }));
  };

  const toggleRepeat = () => {
    setPlaybackState(prev => ({ ...prev, isRepeating: !prev.isRepeating }));
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    setPlaybackState(prev => {
      const newQueue = [...prev.queue];
      const [removed] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, removed);
      return { ...prev, queue: newQueue };
    });
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedTracks(new Set());
  };

  const selectAll = (trackIds: string[]) => {
    setSelectedTracks(new Set(trackIds));
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <MusicContext.Provider
      value={{
        tracks,
        authors,
        playlists,
        playbackState,
        selectedTracks,
        addTrack,
        deleteTrack,
        createPlaylist,
        addTracksToPlaylist,
        deletePlaylist,
        playTrack,
        playNext,
        playTracks,
        pausePlayback,
        resumePlayback,
        nextTrack,
        previousTrack,
        seekTo,
        toggleShuffle,
        toggleRepeat,
        reorderQueue,
        toggleTrackSelection,
        clearSelection,
        selectAll,
        refreshData,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};
