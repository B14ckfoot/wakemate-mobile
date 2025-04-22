import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Plus, Settings } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { Device } from '../types/device';
import deviceService from '../services/deviceService';
import SwipeableDeviceItem from '../src/components/SwipeableDeviceItem';

export default function DevicesScreen() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setIsLoading(true);
      const loadedDevices = await deviceService.getDevices();
      setDevices(loadedDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDevice = (id: string) => {
    Alert.alert(
      'Delete Device',
      'Are you sure you want to delete this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedDevices = devices.filter(device => device.id !== id);
              await deviceService.saveDevices(updatedDevices);
              setDevices(updatedDevices);
            } catch (error) {
              console.error('Error deleting device:', error);
              Alert.alert('Error', 'Failed to delete device');
            }
          }
        }
      ]
    );
  };

  const handleLongPress = (device: Device) => {
    // Show options menu on long press
    Alert.alert(
      device.name,
      'Choose an option',
      [
        {
          text: 'Edit Device',
          onPress: () => router.push(`/devices/edit/${device.id}`)
        },
        {
          text: 'Settings',
          onPress: () => router.push('/settings')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <SwipeableDeviceItem
      device={item}
      onDelete={handleDeleteDevice}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Devices</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Settings size={24} color="#7c3aed" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={styles.loader} />
      ) : devices.length > 0 ? (
        <FlatList
          data={devices}
          renderItem={renderDevice}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.deviceList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No devices found</Text>
          <Text style={styles.emptySubtext}>Add a device to get started</Text>
        </View>
      )}
      
      <Link href="/devices/add" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
  },
  deviceList: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#a0a0a0',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#7c3aed',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});