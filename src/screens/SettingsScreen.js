import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EditDeviceModal from '../components/EditDeviceModal';

const SettingsScreen = ({
  onBack,
  onClearDevices,
  devices,
  onDeleteDevice,
  onUpdateDevice,
  serverOnline,
  searching,
  retry,
  children // Add support for children components
}) => {
  const [editingDevice, setEditingDevice] = useState(null);

  const handleSaveEditedDevice = (updatedDevice) => {
    onUpdateDevice(updatedDevice);
    setEditingDevice(null);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Edit Modal */}
      {editingDevice && (
        <EditDeviceModal
          device={editingDevice}
          onSave={handleSaveEditedDevice}
          onCancel={() => setEditingDevice(null)}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#34D399" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Server Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Ionicons 
            name="wifi" 
            size={24} 
            color="#34D399" 
            style={styles.statusIcon} 
          />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Server Connection</Text>
            {searching ? (
              <Text style={styles.searching}>🔍 Searching...</Text>
            ) : serverOnline ? (
              <Text style={styles.online}>🟢 Connected</Text>
            ) : (
              <Text style={styles.offline}>🔴 Offline</Text>
            )}
          </View>
        </View>
        {!serverOnline && !searching && (
          <TouchableOpacity
            onPress={retry}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Insert children components (like NetworkScanner) here */}
      {children}

      {/* Devices Management */}
      <View style={styles.sectionContainer}>
        {devices.length > 0 ? (
          devices.map((device) => (
            <View
              key={device.id}
              style={styles.deviceCard}
            >
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceIp}>{device.ip}</Text>
              </View>
              <View style={styles.deviceActions}>
                <TouchableOpacity
                  onPress={() => setEditingDevice(device)}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDeleteDevice(device.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={24} color="#F87171" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDevicesText}>No devices found.</Text>
        )}
      </View>

      {/* Clear All Devices */}
      <TouchableOpacity
        onPress={onClearDevices}
        style={styles.clearAllButton}
      >
        <Ionicons name="trash-outline" size={24} color="white" style={styles.clearAllIcon} />
        <Text style={styles.clearAllText}>Clear All Devices</Text>
      </TouchableOpacity>

      {/* About Info */}
      <View style={styles.aboutCard}>
        <Ionicons name="information-circle-outline" size={24} color="#34D399" style={styles.aboutIcon} />
        <View style={styles.aboutTextContainer}>
          <Text style={styles.aboutTitle}>WakeMATE v1.0</Text>
          <Text style={styles.aboutSubtitle}>Built with ❤️ by Marco</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 12,
  },
  statusTextContainer: {
    flexDirection: 'column',
  },
  statusTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searching: {
    color: '#FBBF24',
    fontSize: 14,
  },
  online: {
    color: '#34D399',
    fontSize: 14,
  },
  offline: {
    color: '#F87171',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#34D399',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  retryButtonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  deviceCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flexDirection: 'column',
  },
  deviceName: {
    color: 'white',
    fontSize: 16,
  },
  deviceIp: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  deviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 16,
  },
  editButtonText: {
    fontSize: 20,
  },
  deleteButton: {},
  noDevicesText: {
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 16,
  },
  clearAllButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllIcon: {
    marginRight: 8,
  },
  clearAllText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  aboutCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutIcon: {
    marginRight: 12,
  },
  aboutTextContainer: {
    flexDirection: 'column',
  },
  aboutTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  aboutSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default SettingsScreen;