import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useMusic } from '../contexts/MusicContext';
import TrackItem from '../components/TrackItem';
import ActionBar from '../components/ActionBar';

type PlaylistDetailRouteProp = RouteProp<RootStackParamList, 'PlaylistDetail'>;

const PlaylistDetailScreen = () => {
  const route = useRoute<PlaylistDetailRouteProp>();
  const { playlistId } = route.params;
  const { tracks, playlists, selectedTracks, toggleTrackSelection, clearSelection } = useMusic();

  const playlist = useMemo(() => {
    return playlists.find(p => p.id === playlistId);
  }, [playlists, playlistId]);

  const playlistTracks = useMemo(() => {
    if (!playlist) return [];
    return playlist.trackIds
      .map(id => tracks.find(t => t.id === id))
      .filter(t => t !== undefined);
  }, [playlist, tracks]);

  const handleTrackPress = (trackId: string) => {
    if (selectedTracks.size > 0) {
      toggleTrackSelection(trackId);
    }
  };

  const handleTrackLongPress = (trackId: string) => {
    toggleTrackSelection(trackId);
  };

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Playlist not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.playlistName}>{playlist.name}</Text>
        <Text style={styles.trackCount}>{playlistTracks.length} tracks</Text>
      </View>

      <FlatList
        data={playlistTracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackItem
            track={item}
            isSelected={selectedTracks.has(item.id)}
            isInLibrary={true}
            onPress={() => handleTrackPress(item.id)}
            onLongPress={() => handleTrackLongPress(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tracks in this playlist</Text>
        }
      />

      {selectedTracks.size > 0 && (
        <ActionBar selectedCount={selectedTracks.size} onClose={clearSelection} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  playlistName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackCount: {
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    color: '#999',
    fontSize: 16,
  },
});

export default PlaylistDetailScreen;
