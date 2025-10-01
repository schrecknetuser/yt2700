import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useMusic } from '../contexts/MusicContext';
import TrackItem from '../components/TrackItem';
import ActionBar from '../components/ActionBar';

type LibraryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const LibraryScreen = () => {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const {
    tracks,
    authors,
    playlists,
    selectedTracks,
    toggleTrackSelection,
    clearSelection,
    playTracks,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'tracks' | 'authors' | 'playlists'>('tracks');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = useMemo(() => {
    if (!searchQuery) return tracks;
    const query = searchQuery.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.authorName.toLowerCase().includes(query)
    );
  }, [tracks, searchQuery]);

  const sortedTracks = useMemo(() => {
    return [...filteredTracks].sort((a, b) => a.title.localeCompare(b.title));
  }, [filteredTracks]);

  const sortedAuthors = useMemo(() => {
    return [...authors].sort((a, b) => a.name.localeCompare(b.name));
  }, [authors]);

  const handleTrackPress = (trackId: string) => {
    if (selectedTracks.size > 0) {
      toggleTrackSelection(trackId);
    }
  };

  const handleTrackLongPress = (trackId: string) => {
    toggleTrackSelection(trackId);
  };

  const handleShufflePlayAll = () => {
    if (sortedTracks.length === 0) {
      Alert.alert('No Tracks', 'No tracks available to play');
      return;
    }
    playTracks(sortedTracks, true);
  };

  const handleAuthorPress = (authorId: string, authorName: string) => {
    navigation.navigate('AuthorDetail', { authorId, authorName });
  };

  const handlePlaylistPress = (playlistId: string) => {
    navigation.navigate('PlaylistDetail', { playlistId });
  };

  const handleAddTracks = () => {
    navigation.navigate('AddTracks');
  };

  const renderTrackTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tracks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.shuffleButton} onPress={handleShufflePlayAll}>
          <Text style={styles.shuffleButtonText}>Shuffle Play All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedTracks}
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
          <Text style={styles.emptyText}>No tracks in library</Text>
        }
      />
    </View>
  );

  const renderAuthorsTab = () => (
    <FlatList
      data={sortedAuthors}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => handleAuthorPress(item.id, item.name)}
        >
          <Text style={styles.listItemText}>{item.name}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No authors in library</Text>
      }
    />
  );

  const renderPlaylistsTab = () => (
    <FlatList
      data={playlists}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => handlePlaylistPress(item.id)}
        >
          <Text style={styles.listItemText}>{item.name}</Text>
          <Text style={styles.listItemSubtext}>
            {item.trackIds.length} tracks
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No playlists created</Text>
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tracks' && styles.activeTab]}
          onPress={() => setActiveTab('tracks')}
        >
          <Text
            style={[styles.tabText, activeTab === 'tracks' && styles.activeTabText]}
          >
            Tracks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'authors' && styles.activeTab]}
          onPress={() => setActiveTab('authors')}
        >
          <Text
            style={[styles.tabText, activeTab === 'authors' && styles.activeTabText]}
          >
            Authors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'playlists' && styles.activeTab]}
          onPress={() => setActiveTab('playlists')}
        >
          <Text
            style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]}
          >
            Playlists
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'tracks' && renderTrackTab()}
      {activeTab === 'authors' && renderAuthorsTab()}
      {activeTab === 'playlists' && renderPlaylistsTab()}

      {selectedTracks.size > 0 && (
        <ActionBar selectedCount={selectedTracks.size} onClose={clearSelection} />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddTracks}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  header: {
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  shuffleButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shuffleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    color: '#999',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
  },
});

export default LibraryScreen;
