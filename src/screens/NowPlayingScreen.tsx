import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { useMusic } from '../contexts/MusicContext';

const NowPlayingScreen = () => {
  const {
    playbackState,
    pausePlayback,
    resumePlayback,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    reorderQueue,
  } = useMusic();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPosition = (position: number) => {
    return formatDuration(Math.floor(position));
  };

  const renderCurrentTrack = () => {
    if (!playbackState.currentTrack) {
      return (
        <View style={styles.noTrackContainer}>
          <Text style={styles.noTrackText}>No track playing</Text>
        </View>
      );
    }

    const { currentTrack } = playbackState;

    return (
      <View style={styles.currentTrackContainer}>
        <Text style={styles.trackTitle}>{currentTrack.title}</Text>
        <Text style={styles.trackAuthor}>{currentTrack.authorName}</Text>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {formatPosition(playbackState.position)}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    (playbackState.position / currentTrack.duration) * 100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formatDuration(currentTrack.duration)}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              playbackState.isShuffled && styles.activeControl,
            ]}
            onPress={toggleShuffle}
          >
            <Text style={styles.controlText}>🔀</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={previousTrack}>
            <Text style={styles.controlText}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.playButton]}
            onPress={
              playbackState.isPlaying ? pausePlayback : resumePlayback
            }
          >
            <Text style={styles.playButtonText}>
              {playbackState.isPlaying ? '⏸' : '▶️'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={nextTrack}>
            <Text style={styles.controlText}>⏭</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              playbackState.isRepeating && styles.activeControl,
            ]}
            onPress={toggleRepeat}
          >
            <Text style={styles.controlText}>🔁</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderQueue = () => {
    const queueWithoutCurrent = playbackState.queue.filter(
      (track) => track.id !== playbackState.currentTrack?.id
    );

    return (
      <View style={styles.queueContainer}>
        <Text style={styles.queueTitle}>Queue ({queueWithoutCurrent.length})</Text>
        <FlatList
          data={queueWithoutCurrent}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item, index }) => (
            <View style={styles.queueItem}>
              <View style={styles.queueItemContent}>
                <Text style={styles.queueItemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.queueItemAuthor} numberOfLines={1}>
                  {item.authorName}
                </Text>
              </View>
              <Text style={styles.queueItemDuration}>
                {formatDuration(item.duration)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Queue is empty</Text>
          }
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderCurrentTrack()}
      {renderQueue()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  noTrackContainer: {
    padding: 48,
    alignItems: 'center',
  },
  noTrackText: {
    fontSize: 18,
    color: '#999',
  },
  currentTrackContainer: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  trackAuthor: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  activeControl: {
    backgroundColor: '#e3f2fd',
    borderRadius: 24,
  },
  controlText: {
    fontSize: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    backgroundColor: '#2196F3',
    borderRadius: 32,
  },
  playButtonText: {
    fontSize: 32,
    color: '#fff',
  },
  queueContainer: {
    flex: 1,
    padding: 16,
  },
  queueTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  queueItemContent: {
    flex: 1,
    marginRight: 12,
  },
  queueItemTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  queueItemAuthor: {
    fontSize: 14,
    color: '#666',
  },
  queueItemDuration: {
    fontSize: 14,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    color: '#999',
    fontSize: 16,
  },
});

export default NowPlayingScreen;
