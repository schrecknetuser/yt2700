import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Track } from '../models/Track';

interface TrackItemProps {
  track: Track;
  isSelected?: boolean;
  isInLibrary?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  isSelected = false,
  isInLibrary = false,
  onPress,
  onLongPress,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selected,
        isInLibrary && styles.inLibrary,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {track.authorName}
        </Text>
      </View>
      <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selected: {
    backgroundColor: '#e3f2fd',
  },
  inLibrary: {
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#666',
  },
  duration: {
    fontSize: 14,
    color: '#999',
  },
});

export default TrackItem;
