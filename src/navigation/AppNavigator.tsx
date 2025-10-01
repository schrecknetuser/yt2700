import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens (we'll create these next)
import LibraryScreen from '../screens/LibraryScreen';
import AddTracksScreen from '../screens/AddTracksScreen';
import NowPlayingScreen from '../screens/NowPlayingScreen';
import AuthorDetailScreen from '../screens/AuthorDetailScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Main: undefined;
  AuthorDetail: { authorId: string; authorName: string };
  PlaylistDetail: { playlistId: string };
  AddTracks: undefined;
};

export type MainTabParamList = {
  Library: undefined;
  NowPlaying: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{ title: 'Library' }}
      />
      <Tab.Screen 
        name="NowPlaying" 
        component={NowPlayingScreen}
        options={{ title: 'Now Playing' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AuthorDetail" 
          component={AuthorDetailScreen}
          options={({ route }) => ({ title: route.params.authorName })}
        />
        <Stack.Screen 
          name="PlaylistDetail" 
          component={PlaylistDetailScreen}
          options={{ title: 'Playlist' }}
        />
        <Stack.Screen 
          name="AddTracks" 
          component={AddTracksScreen}
          options={{ title: 'Add Tracks' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
