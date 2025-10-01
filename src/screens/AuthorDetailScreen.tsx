import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useMusic } from '../contexts/MusicContext';
import { YouTubeService } from '../services/YouTubeService';
import TrackItem from '../components/TrackItem';
import ActionBar from '../components/ActionBar';
import { Track } from '../models/Track';

type AuthorDetailRouteProp = RouteProp<RootStackParamList, 'AuthorDetail'>;

const AuthorDetailScreen = () => {
  const route = useRoute<AuthorDetailRouteProp>();
  const { authorId, authorName } = route.params;
  const { tracks, selectedTracks, toggleTrackSelection, clearSelection } = useMusic();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [authorTracks, setAuthorTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthorTracks();
  }, [authorId]);

  const loadAuthorTracks = async () => {
    setIsLoading(true);
    try {
      // First, get tracks from library
      const libraryTracks = tracks.filter(t => t.authorId === authorId);
      
      // Then, fetch from YouTube (in real implementation)
      const youtubeTracks = await YouTubeService.getAuthorTracks(authorId);
      
      // Combine and deduplicate
      const allTracks = [...libraryTracks];
      youtubeTracks.forEach(yt => {
        if (!allTracks.find(t => t.id === yt.id)) {
          allTracks.push(yt);
        }
      });
      
      setAuthorTracks(allTracks);
    } catch (error) {
      console.error('Error loading author tracks:', error);
      setAuthorTracks(tracks.filter(t => t.authorId === authorId));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTracks = useMemo(() => {
    if (!searchQuery) return authorTracks;
    const query = searchQuery.toLowerCase();
    return authorTracks.filter(t => t.title.toLowerCase().includes(query));
  }, [authorTracks, searchQuery]);

  const sortedTracks = useMemo(() => {
    const sorted = [...filteredTracks];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    }
    return sorted;
  }, [filteredTracks, sortBy]);

  const handleTrackPress = (trackId: string) => {
    if (selectedTracks.size > 0) {
      toggleTrackSelection(trackId);
    }
  };

  const handleTrackLongPress = (trackId: string) => {
    toggleTrackSelection(trackId);
  };

  const isInLibrary = (trackId: string) => {
    return tracks.some(t => t.id === trackId);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tracks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'name' && styles.activeSortButton]}
            onPress={() => setSortBy('name')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'name' && styles.activeSortButtonText]}>
              Name
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'date' && styles.activeSortButton]}
            onPress={() => setSortBy('date')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'date' && styles.activeSortButtonText]}>
              Date
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedTracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackItem
            track={item}
            isSelected={selectedTracks.has(item.id)}
            isInLibrary={isInLibrary(item.id)}
            onPress={() => handleTrackPress(item.id)}
            onLongPress={() => handleTrackLongPress(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tracks by this author</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
  },
  sortButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeSortButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeSortButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    color: '#999',
    fontSize: 16,
  },
});

export default AuthorDetailScreen;
