import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Monitor, Power, Settings, Edit, Trash2 } from 'lucide-react-native';
import { Device } from '../types/device';
import deviceService from '../services/deviceService';

export default function DeviceDetailScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDevice();
  }, [id]);

  const loadDevice = async () => {
    try {
      setIsLoading(true);
      const devices = await deviceService.getDevices();
      
      const foundDevice = devices.find((d: Device) => d.id === id);
      if (foundDevice) {
        setDevice(foundDevice);
        setStatus(foundDevice.status);
      } else {
        Alert.alert('Error', 'Device not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading device:', error);
      Alert.alert('Error', 'Failed to load device details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      Alert.alert(
        'Delete Device',
        'Are you sure you want to delete this device?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              const devices = await deviceService.getDevices();
              
              const updatedDevices = devices.filter((d: Device) => d.id !== id);
              await deviceService.saveDevices(updatedDevices);
              
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting device:', error);
      Alert.alert('Error', 'Failed to delete device');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Device not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#7c3aed" />
      </TouchableOpacity>
      
      <View style={styles.deviceCard}>
        <View style={styles.iconContainer}>
          <Monitor size={48} color="#7c3aed" />
        </View>
        
        <Text style={styles.deviceName}>{device.name}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>IP Address:</Text>
            <Text style={styles.detailValue}>{device.ip}</Text>
          </View>
          
          {device.mac && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>MAC Address:</Text>
              <Text style={styles.detailValue}>{device.mac}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: status === 'online' ? '#4ade80' : '#6b7280' }
              ]} />
              <Text style={[
                styles.statusText,
                { color: status === 'online' ? '#4ade80' : '#6b7280' }
              ]}>
                {status === 'online' ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.controlButton,
            status === 'offline' && styles.wakeButton
          ]}
          onPress={() => router.push(`/devices/control/${device.id}`)}
        >
          {status === 'online' ? (
            <>
              <Settings size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Control Device</Text>
            </>
          ) : (
            <>
              <Power size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Wake Device</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push(`/devices/edit/${device.id}`)}
        >
          <Edit size={20} color="#ffffff" style={styles.actionIcon} />
          <Text style={styles.actionText}>Edit Device</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Trash2 size={20} color="#ffffff" style={styles.actionIcon} />
          <Text style={styles.actionText}>Delete Device</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  deviceCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  detailLabel: {
    color: '#a0a0a0',
    fontSize: 16,
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 16,
  },
  controlButton: {
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  wakeButton: {
    backgroundColor: '#059669',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#2d2d2d',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionIcon: {
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#7f1d1d',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});