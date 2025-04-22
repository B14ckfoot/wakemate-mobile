import React from "react";
import { Stack } from "expo-router";
import { ServerProvider } from "../src/context/ServerContext";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ServerProvider>
        <Stack 
          screenOptions={{
            headerShown: false, // We'll handle our own headers in each screen
            contentStyle: {
              backgroundColor: '#121212',
            }
          }}
        />
      </ServerProvider>
    </SafeAreaProvider>
  );
}