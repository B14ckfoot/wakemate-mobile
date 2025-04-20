import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import deviceService from '../services/deviceService';

const DeviceControlScreen = ({ route, navigation }) => {
  const { device } = route.params;
  const [activeTab, setActiveTab] = useState('mouse');
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePowerAction = async (action) => {
    try {
      setIsLoading(true);
      
      await deviceService.sendCommand({
        command: action,
        deviceId: device.id,
        targetIp: device.ip
      });
      
      setIsLoading(false);
      
      const actionMessages = {
        'shutdown': 'Shutdown command sent.',
        'restart': 'Restart command sent.',
        'sleep': 'Sleep command sent.',
        'logout': 'Logout command sent.'
      };
      
      Alert.alert('Success', actionMessages[action] || 'Command sent successfully.');
      
      if (action === 'shutdown' || action === 'restart') {
        navigation.goBack();
      }
    } catch (error) {
      console.error(`Error sending ${action} command:`, error);
      setIsLoading(false);
      Alert.alert('Error', `Failed to send ${action} command.`);
    }
  };
  
  const renderMouseControls = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Mouse Controls</Text>
      <Text style={styles.infoText}>Mouse controls will be implemented in the next version.</Text>
    </View>
  );
  
  const renderKeyboardControls = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Keyboard Controls</Text>
      <Text style={styles.infoText}>Keyboard controls will be implemented in the next version.</Text>
    </View>
  );
  
  const renderMediaControls = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Media Controls</Text>
      <Text style={styles.infoText}>Media controls will be implemented in the next version.</Text>
    </View>
  );
  
  const renderPowerControls = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Power Controls</Text>
      
      <View style={styles.powerButtons}>
        <TouchableOpacity 
          style={[styles.powerButton, styles.shutdownButton]}
          onPress={() => {
            Alert.alert(
              'Shutdown Device',
              `Are you sure you want to shutdown ${device.name}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Shutdown', onPress: () => handlePowerAction('shutdown') }
              ]
            );
          }}
          disabled={isLoading}
        >
          <Feather name="power" size={28} color="#fff" />
          <Text style={styles.powerButtonText}>Shutdown</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.powerButton, styles.restartButton]}
          onPress={() => {
            Alert.alert(
              'Restart Device',
              `Are you sure you want to restart ${device.name}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Restart', onPress: () => handlePowerAction('restart') }
              ]
            );
          }}
          disabled={isLoading}
        >
          <Feather name="refresh-cw" size={28} color="#fff" />
          <Text style={styles.powerButtonText}>Restart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.powerButton, styles.sleepButton]}
          onPress={() => handlePowerAction('sleep')}
          disabled={isLoading}
        >
          <Feather name="moon" size={28} color="#fff" />
          <Text style={styles.powerButtonText}>Sleep</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.powerButton, styles.logoutButton]}
          onPress={() => handlePowerAction('logout')}
          disabled={isLoading}
        >
          <Feather name="log-out" size={28} color="#fff" />
          <Text style={styles.powerButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Sending command...</Text>
        </View>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'mouse' && styles.activeTab]}
            onPress={() => setActiveTab('mouse')}
          >
            <Feather 
              name="mouse-pointer" 
              size={20} 
              color={activeTab === 'mouse' ? '#7c3aed' : '#a0a0a0'} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'mouse' && styles.activeTabText
            ]}>
              Mouse
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'keyboard' && styles.activeTab]}
            onPress={() => setActiveTab('keyboard')}
          >
            <Feather 
              name="type" 
              size={20} 
              color={activeTab === 'keyboard' ? '#7c3aed' : '#a0a0a0'} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'keyboard' && styles.activeTabText
            ]}>
              Keyboard
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'media' && styles.activeTab]}
            onPress={() => setActiveTab('media')}
          >
            <Feather 
              name="music" 
              size={20} 
              color={activeTab === 'media' ? '#7c3aed' : '#a0a0a0'} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'media' && styles.activeTabText
            ]}>
              Media
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'power' && styles.activeTab]}
            onPress={() => setActiveTab('power')}
          >
            <Feather 
              name="power" 
              size={20} 
              color={activeTab === 'power' ? '#7c3aed' : '#a0a0a0'} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'power' && styles.activeTabText
            ]}>
              Power
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'mouse' && renderMouseControls()}
        {activeTab === 'keyboard' && renderKeyboardControls()}
        {activeTab === 'media' && renderMediaControls()}
        {activeTab === 'power' && renderPowerControls()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    marginBottom: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#2d2d2d',
  },
  tabText: {
    color: '#a0a0a0',
    marginLeft: 4,
    fontSize: 14,
  },
  activeTabText: {
    color: '#7c3aed',
  },
  tabContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    minHeight: 300,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoText: {
    color: '#a0a0a0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  powerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  powerButton: {
    width: '48%',
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  shutdownButton: {
    backgroundColor: '#881337',
  },
  restartButton: {
    backgroundColor: '#854d0e',
  },
  sleepButton: {
    backgroundColor: '#1e40af',
  },
  logoutButton: {
    backgroundColor: '#4f46e5',
  },
  powerButtonText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
  },
});

export default DeviceControlScreen;