import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import deviceService from '../services/deviceService';

const DeviceDetailScreen = ({ route, navigation }) => {
  const { device } = route.params;
  const [status, setStatus] = useState(device.status);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    checkStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const checkStatus = async () => {
    try {
      const isOnline = await deviceService.checkDeviceStatus(device.ip);
      setStatus(isOnline ? 'online' : 'offline');
    } catch (error) {
      console.error('Error checking device status:', error);
    }
  };
  
  const handleControl = () => {
    if (status === 'offline') {
      Alert.alert(
        'Device Offline',
        'This device appears to be offline. Would you like to try to wake it up?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Wake Device', onPress: handleWakeDevice }
        ]
      );
    } else {
      // Navigate to control screen
      navigation.navigate('DeviceControl', { device });
    }
  };
  
  const handleWakeDevice = async () => {
    try {
      setIsLoading(true);
      const serverIp = await deviceService.getServerAddress();
      
      if (!serverIp) {
        Alert.alert('Error', 'Server IP not configured');
        setIsLoading(false);
        return;
      }
      
      await deviceService.sendCommand({
        command: 'wake',
        deviceId: device.id,
        mac: device.mac
      });
      
      Alert.alert('Wake Command Sent', 'Attempting to wake up the device...');
      
      // Check status after a delay
      setTimeout(async () => {
        await checkStatus();
        setIsLoading(false);
      }, 5000);
    } catch (error) {
      console.error('Error waking device:', error);
      Alert.alert('Error', 'Failed to wake device');
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.deviceCard}>
        <View style={styles.iconContainer}>
          <Feather name="monitor" size={48} color="#7c3aed" />
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
          onPress={handleControl}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather 
                name={status === 'online' ? 'sliders' : 'power'} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.buttonText}>
                {status === 'online' ? 'Control Device' : 'Wake Device'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('EditDevice', { device });
          }}
        >
          <Feather name="edit" size={20} color="#fff" />
          <Text style={styles.actionText}>Edit Device</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
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
                    const updated = devices.filter(d => d.id !== device.id);
                    await deviceService.saveDevices(updated);
                    navigation.goBack();
                  }
                }
              ]
            );
          }}
        >
          <Feather name="trash-2" size={20} color="#fff" />
          <Text style={styles.actionText}>Delete Device</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
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
    color: '#fff',
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
    borderBottomColor: '#333',
  },
  detailLabel: {
    color: '#a0a0a0',
    fontSize: 16,
  },
  detailValue: {
    color: '#fff',
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
  buttonText: {
    color: '#fff',
    marginLeft: 8,
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
  deleteButton: {
    backgroundColor: '#7f1d1d',
  },
  actionText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default DeviceDetailScreen;