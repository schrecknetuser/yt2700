import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { YouTubeService } from '../services/YouTubeService';
import { StorageService } from '../services/StorageService';
import { useMusic } from '../contexts/MusicContext';
import TrackItem from '../components/TrackItem';
import { Track } from '../models/Track';

const AddTracksScreen = () => {
  const navigation = useNavigation();
  const { tracks, addTrack, selectedTracks, toggleTrackSelection, clearSelection, playTracks, playNext } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  React.useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const history = await StorageService.getSearchHistory();
    setSearchHistory(history);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await YouTubeService.search(searchQuery);
      setSearchResults(results.tracks);
      setShowResults(true);
      await StorageService.addToSearchHistory(searchQuery);
      await loadSearchHistory();
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryItemPress = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const results = await YouTubeService.search(query);
      setSearchResults(results.tracks);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrackPress = (trackId: string) => {
    if (selectedTracks.size > 0) {
      toggleTrackSelection(trackId);
    }
  };

  const handleTrackLongPress = (trackId: string) => {
    toggleTrackSelection(trackId);
  };

  const handlePlayNow = () => {
    const tracksToPlay = searchResults.filter(t => selectedTracks.has(t.id));
    playTracks(tracksToPlay);
    clearSelection();
  };

  const handlePlayNext = () => {
    const tracksToPlay = searchResults.filter(t => selectedTracks.has(t.id));
    tracksToPlay.forEach(track => playNext(track));
    clearSelection();
  };

  const handleAddToLibrary = async () => {
    const tracksToAdd = searchResults.filter(t => selectedTracks.has(t.id));
    for (const track of tracksToAdd) {
      await addTrack(track);
    }
    clearSelection();
  };

  const isInLibrary = (trackId: string) => {
    return tracks.some(t => t.id === trackId);
  };

  const renderSearchInput = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for tracks..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchHistory = () => {
    if (showResults || searchHistory.length === 0) return null;

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Recent Searches</Text>
        <FlatList
          data={searchHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyItem}
              onPress={() => handleHistoryItemPress(item)}
            >
              <Text style={styles.historyItemText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderResults = () => {
    if (!showResults) return null;

    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <FlatList
          data={searchResults}
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
            <Text style={styles.emptyText}>No results found</Text>
          }
        />
      </View>
    );
  };

  const renderActionBar = () => {
    if (selectedTracks.size === 0 || !showResults) return null;

    return (
      <View style={styles.actionBar}>
        <Text style={styles.actionBarText}>{selectedTracks.size} selected</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePlayNow}>
            <Text style={styles.actionButtonText}>Play Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handlePlayNext}>
            <Text style={styles.actionButtonText}>Play Next</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddToLibrary}>
            <Text style={styles.actionButtonText}>Add to Library</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSearchInput()}
      {renderSearchHistory()}
      {renderResults()}
      {renderActionBar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
    padding: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyItemText: {
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    color: '#999',
    fontSize: 16,
  },
  actionBar: {
    backgroundColor: '#2196F3',
    padding: 12,
  },
  actionBarText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default AddTracksScreen;
