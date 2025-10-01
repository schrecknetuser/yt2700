import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Track, Author, Playlist, PlaybackState } from '../models/Track';
import { StorageService } from '../services/StorageService';
import { AudioService } from '../services/AudioService';

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
    initializeAudio();
    loadData();
  }, []);

  const initializeAudio = async () => {
    await AudioService.initialize();
  };

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

  const playTrack = async (track: Track) => {
    try {
      await AudioService.playTrack(track, (status) => {
        if (status.isLoaded) {
          setPlaybackState(prev => ({
            ...prev,
            position: status.positionMillis / 1000,
            isPlaying: status.isPlaying,
          }));

          // Auto-play next track when current finishes
          if (status.didJustFinish) {
            nextTrack();
          }
        }
      });

      setPlaybackState(prev => ({
        ...prev,
        currentTrack: track,
        queue: [track],
        position: 0,
        isPlaying: true,
      }));
      StorageService.saveLastPlayedTrack(track.id);
    } catch (error) {
      console.error('Error playing track:', error);
    }
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

  const playTracks = async (tracksToPlay: Track[], shuffle = false) => {
    const queue = shuffle ? shuffleArray(tracksToPlay) : tracksToPlay;
    if (queue[0]) {
      await playTrack(queue[0]);
      setPlaybackState(prev => ({
        ...prev,
        queue,
        isShuffled: shuffle,
      }));
    }
  };

  const pausePlayback = async () => {
    await AudioService.pause();
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
  };

  const resumePlayback = async () => {
    await AudioService.resume();
    setPlaybackState(prev => ({ ...prev, isPlaying: true }));
  };

  const nextTrack = async () => {
    const currentIndex = playbackState.queue.findIndex(t => t.id === playbackState.currentTrack?.id);
    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= playbackState.queue.length) {
      if (playbackState.isRepeating) {
        const newQueue = playbackState.isShuffled ? shuffleArray(playbackState.queue) : playbackState.queue;
        const nextTrack = newQueue[0];
        if (nextTrack) {
          await playTrack(nextTrack);
          setPlaybackState(prev => ({
            ...prev,
            queue: newQueue,
          }));
        }
      } else {
        await AudioService.stop();
        setPlaybackState(prev => ({ ...prev, isPlaying: false }));
      }
      return;
    }
    
    const nextTrackItem = playbackState.queue[nextIndex];
    if (nextTrackItem) {
      await playTrack(nextTrackItem);
    }
  };

  const previousTrack = async () => {
    const currentIndex = playbackState.queue.findIndex(t => t.id === playbackState.currentTrack?.id);
    const prevIndex = Math.max(0, currentIndex - 1);
    const prevTrackItem = playbackState.queue[prevIndex];
    if (prevTrackItem) {
      await playTrack(prevTrackItem);
    }
  };

  const seekTo = async (position: number) => {
    await AudioService.seekTo(position * 1000); // Convert to milliseconds
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
