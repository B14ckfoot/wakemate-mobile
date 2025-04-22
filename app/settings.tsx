import React from 'react';
import { Stack } from 'expo-router';
import SettingsScreen from '../src/components/SettingsScreen';

export default function SettingsRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <SettingsScreen />
    </>
  );
}