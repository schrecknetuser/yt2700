import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useMusic } from '../contexts/MusicContext';

interface ActionBarProps {
  selectedCount: number;
  onClose: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({ selectedCount, onClose }) => {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const { playlists, selectedTracks, tracks, playTracks, playNext, deleteTrack, addTracksToPlaylist, clearSelection } = useMusic();

  const getSelectedTracks = () => {
    return tracks.filter(t => selectedTracks.has(t.id));
  };

  const handlePlayNow = () => {
    const tracksToPlay = getSelectedTracks();
    playTracks(tracksToPlay);
    clearSelection();
    onClose();
  };

  const handlePlayNext = () => {
    const tracksToPlay = getSelectedTracks();
    tracksToPlay.forEach(track => playNext(track));
    clearSelection();
    onClose();
  };

  const handleAddToPlaylist = () => {
    setShowPlaylistModal(true);
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    await addTracksToPlaylist(playlistId, Array.from(selectedTracks));
    setShowPlaylistModal(false);
    clearSelection();
    onClose();
  };

  const handleDelete = async () => {
    for (const trackId of selectedTracks) {
      await deleteTrack(trackId);
    }
    clearSelection();
    onClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{selectedCount} selected</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handlePlayNow}>
          <Text style={styles.buttonText}>Play Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePlayNext}>
          <Text style={styles.buttonText}>Play Next</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleAddToPlaylist}>
          <Text style={styles.buttonText}>Add to Playlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPlaylistModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Playlist</Text>
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.playlistItem}
                  onPress={() => handleSelectPlaylist(item.id)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPlaylistModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2196F3',
    padding: 12,
  },
  count: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  playlistItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
});

export default ActionBar;
