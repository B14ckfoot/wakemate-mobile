import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft, MousePointer, Keyboard as KeyboardIcon, Music, Power } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Device } from '../../types/device';
import deviceService from '../../services/deviceService';
import MouseKeyboardScreen from '../../../src/components/MouseKeyboardScreen';

export default function DeviceControlScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const router = useRouter();
  const [device, setDevice] = React.useState<Device | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'mouse' | 'keyboard' | 'media' | 'power'>('mouse');

  React.useEffect(() => {
    const fetchDevice = async () => {
      try {
        const devices = await deviceService.getDevices();
        const foundDevice = devices.find(d => d.id === id);
        if (foundDevice) {
          setDevice(foundDevice);
        } else {
          alert('Device not found');
          router.back();
        }
      } catch (error) {
        console.error('Error loading device:', error);
        alert('Failed to load device');
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading device...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.errorContainer}>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#7c3aed" />
        </TouchableOpacity>
        <Text style={styles.title}>{device.name}</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'mouse' && styles.activeTab]}
          onPress={() => setActiveTab('mouse')}
        >
          <MousePointer 
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
          <KeyboardIcon 
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
          <Music 
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
          <Power 
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

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'mouse' || activeTab === 'keyboard' || activeTab === 'media' ? (
          <MouseKeyboardScreen />
        ) : (
          <View style={styles.powerControls}>
            <Text style={styles.sectionTitle}>Power Controls</Text>
            <Text style={styles.infoText}>Power controls will be implemented in the next version.</Text>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#7c3aed',
    fontSize: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
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
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
  },
  powerControls: {
    padding: 16,
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
});