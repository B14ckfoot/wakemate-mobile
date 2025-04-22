import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  Edit,
  Trash,
  Info,
  Save
} from 'lucide-react-native';
import { Device } from '../../src/types/device';
import deviceService from '../services/deviceService';
import { useServer } from '../context/ServerContext';

export default function SettingsScreen() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [serverIpInput, setServerIpInput] = useState('');
  const [editName, setEditName] = useState('');
  const [editMac, setEditMac] = useState('');
  const [editIp, setEditIp] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Use server context
  const { 
    serverIp, 
    setServerIp, 
    isConnected, 
    connectionError, 
    testConnection 
  } = useServer();
  
  // Load devices and server IP
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load devices
        const loadedDevices = await deviceService.getDevices();
        setDevices(loadedDevices);
        
        // Set server IP input
        if (serverIp) {
          setServerIpInput(serverIp);
        }
      } catch (error) {
        console.error('Error loading settings data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [serverIp]);
  
  // Handle server IP update
  const handleUpdateServerIp = async () => {
    if (!serverIpInput.trim()) {
      Alert.alert('Error', 'Please enter a valid server IP');
      return;
    }
    
    // Simple validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(serverIpInput)) {
      Alert.alert('Error', 'Please enter a valid IP address (e.g., 192.168.1.100)');
      return;
    }
    
    setServerIp(serverIpInput);
    
    // Test connection after setting IP
    const connected = await testConnection();
    if (connected) {
      Alert.alert('Success', 'Connected to server successfully');
    }
  };
  
  // Handle edit device
  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setEditName(device.name);
    setEditMac(device.mac);
    setEditIp(device.ip);
    setModalVisible(true);
  };
  
  // Save edited device
  const handleSaveEdit = async () => {
    if (!editingDevice) return;
    
    // Validate fields
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter a device name');
      return;
    }
    
    if (!editIp.trim()) {
      Alert.alert('Error', 'Please enter the device IP address');
      return;
    }
    
    // Simple IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(editIp.trim())) {
      Alert.alert('Error', 'Please enter a valid IP address (e.g., 192.168.1.100)');
      return;
    }
    
    try {
      // Update device
      const updatedDevice: Device = {
        ...editingDevice,
        name: editName.trim(),
        mac: editMac.trim(),
        ip: editIp.trim()
      };
      
      // Update devices list
      const updatedDevices = devices.map(device => 
        device.id === updatedDevice.id ? updatedDevice : device
      );
      
      // Save to storage
      await deviceService.saveDevices(updatedDevices);
      
      // Update state
      setDevices(updatedDevices);
      setModalVisible(false);
      setEditingDevice(null);
      
      Alert.alert('Success', 'Device updated successfully');
    } catch (error) {
      console.error('Error updating device:', error);
      Alert.alert('Error', 'Failed to update device');
    }
  };
  
  // Delete device
  const handleDeleteDevice = (deviceId: string) => {
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
              const updatedDevices = devices.filter(device => device.id !== deviceId);
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
  
  // Clear all devices
  const handleClearAllDevices = () => {
    Alert.alert(
      'Clear All Devices',
      'Are you sure you want to remove all devices? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await deviceService.saveDevices([]);
              setDevices([]);
              Alert.alert('Success', 'All devices have been removed');
            } catch (error) {
              console.error('Error clearing devices:', error);
              Alert.alert('Error', 'Failed to clear devices');
            }
          }
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#7c3aed" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Server Connection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Server size={20} color="#7c3aed" />
            <Text style={styles.sectionTitle}>Server Connection</Text>
          </View>
          
          <View style={styles.serverStatus}>
            {isConnected ? (
              <View style={styles.statusRow}>
                <Wifi size={18} color="#4ade80" />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            ) : (
              <View style={styles.statusRow}>
                <WifiOff size={18} color="#ef4444" />
                <Text style={styles.disconnectedText}>Disconnected</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={testConnection}
            >
              <RefreshCw size={18} color="#7c3aed" />
            </TouchableOpacity>
          </View>
          
          {connectionError && (
            <Text style={styles.errorText}>{connectionError}</Text>
          )}
          
          <View style={styles.serverIpContainer}>
            <TextInput
              style={styles.serverIpInput}
              value={serverIpInput}
              onChangeText={setServerIpInput}
              placeholder="Server IP (e.g., 192.168.1.100)"
              placeholderTextColor="#6b7280"
              keyboardType="decimal-pad"
            />
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateServerIp}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Devices Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wifi size={20} color="#7c3aed" />
            <Text style={styles.sectionTitle}>Manage Devices</Text>
          </View>
          
          {devices.length > 0 ? (
            devices.map(device => (
              <View key={device.id} style={styles.deviceItem}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceIp}>{device.ip}</Text>
                  {device.mac && (
                    <Text style={styles.deviceMac}>MAC: {device.mac}</Text>
                  )}
                </View>
                
                <View style={styles.deviceActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditDevice(device)}
                  >
                    <Edit size={20} color="#7c3aed" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteDevice(device.id)}
                  >
                    <Trash size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDevicesText}>No devices added yet</Text>
          )}
          
          {devices.length > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleClearAllDevices}
            >
              <Trash size={18} color="#ffffff" />
              <Text style={styles.clearAllText}>Clear All Devices</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#7c3aed" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          
          <View style={styles.aboutInfo}>
            <Text style={styles.appName}>WakeMATE Mobile</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Remote control application for WakeMATECompanion
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Edit Device Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Device</Text>
            
            <Text style={styles.inputLabel}>Device Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="My Computer"
              placeholderTextColor="#6b7280"
            />
            
            <Text style={styles.inputLabel}>MAC Address (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={editMac}
              onChangeText={setEditMac}
              placeholder="00:11:22:33:44:55"
              placeholderTextColor="#6b7280"
            />
            
            <Text style={styles.inputLabel}>IP Address</Text>
            <TextInput
              style={styles.modalInput}
              value={editIp}
              onChangeText={setEditIp}
              placeholder="192.168.1.100"
              placeholderTextColor="#6b7280"
              keyboardType="decimal-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  serverStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    color: '#4ade80',
    marginLeft: 8,
    fontSize: 16,
  },
  disconnectedText: {
    color: '#ef4444',
    marginLeft: 8,
    fontSize: 16,
  },
  refreshButton: {
    padding: 8,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
  },
  serverIpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverIpInput: {
    flex: 1,
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  updateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2d2d2d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceIp: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  deviceMac: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  deviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  noDevicesText: {
    color: '#a0a0a0',
    textAlign: 'center',
    padding: 16,
  },
  clearAllButton: {
    backgroundColor: '#991b1b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  clearAllText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  aboutInfo: {
    alignItems: 'center',
    padding: 8,
  },
  appName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appVersion: {
    color: '#a0a0a0',
    marginTop: 4,
  },
  appDescription: {
    color: '#a0a0a0',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#ffffff',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
});