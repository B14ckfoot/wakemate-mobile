import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StatusBar } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import DeviceSelectScreen from './src/screens/DeviceSelectScreen';
import DeviceDetailScreen from './src/screens/DeviceDetailScreen';
import ControlsScreen from './src/screens/ControlsScreen';
import AddDeviceScreen from './src/screens/AddDeviceScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { useEnhancedAutoDiscoverServer } from './src/hooks/useEnhancedAutoDiscoverServer';
import deviceService from './src/services/deviceService';
import { checkDeviceStatus } from './src/utils/checkDeviceStatus';
import NetworkScanner from './src/components/NetworkScanner';
import QuickTestServer from './src/components/QuickTestServer';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const { serverIp, searching, error, retry } = useEnhancedAutoDiscoverServer();

  // Load devices on start
  useEffect(() => {
    const loadDevices = async () => {
      try {
        // For React Native, use AsyncStorage instead of localStorage
        const storedDevices = await AsyncStorage.getItem('devices');
        if (storedDevices) {
          setDevices(JSON.parse(storedDevices));
        }
      } catch (error) {
        console.error('Error loading devices:', error);
      }
    };

    loadDevices();
  }, []);

  // Save devices on change
  useEffect(() => {
    const saveDevices = async () => {
      try {
        // For React Native, use AsyncStorage instead of localStorage
        await AsyncStorage.setItem('devices', JSON.stringify(devices));
      } catch (error) {
        console.error('Error saving devices:', error);
      }
    };

    saveDevices();
  }, [devices]);

  // Set deviceService server address if found
  useEffect(() => {
    if (serverIp) {
      deviceService.setServerAddress(serverIp);
    }
  }, [serverIp]);

  // Check status of devices periodically
  useEffect(() => {
    if (devices.length === 0) return;

    const checkStatus = async () => {
      const updatedDevices = [...devices];
      let changed = false;

      for (let i = 0; i < updatedDevices.length; i++) {
        try {
          const isOnline = await checkDeviceStatus(updatedDevices[i].ip);
          if (updatedDevices[i].status !== (isOnline ? 'online' : 'offline')) {
            updatedDevices[i].status = isOnline ? 'online' : 'offline';
            changed = true;
          }
        } catch (error) {
          console.error(`Error checking status for device ${updatedDevices[i].name}:`, error);
        }
      }

      if (changed) {
        setDevices(updatedDevices);
      }
    };

    // Check status immediately and then every 60 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 60000);

    return () => clearInterval(interval);
  }, [devices]);

  const serverOnline = serverIp != null && !error;

  const handleDeviceAdded = (newDevice) => {
    setDevices(prev => [...prev, newDevice]);
  };

  const handleDeleteDevice = (deviceId) => {
    setDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  const handleUpdateDevice = (updatedDevice) => {
    setDevices(prev => prev.map(device =>
      device.id === updatedDevice.id ? updatedDevice : device
    ));
  };

  const handleClearDevices = () => {
    setDevices([]);
    setCurrentScreen('home');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onNavigate={() => setCurrentScreen(devices.length > 0 ? 'deviceSelect' : 'addDevice')}
            onOpenSettings={() => setCurrentScreen('settings')}
          />
        );
      case 'deviceSelect':
        return (
          <DeviceSelectScreen
            devices={devices}
            onSelectDevice={(device) => {
              setSelectedDevice(device);
              // Skip device detail screen and go directly to controls
              setCurrentScreen('controls'); 
            }}
            onAddDevice={() => setCurrentScreen('addDevice')}
            onOpenSettings={() => setCurrentScreen('settings')}
          />
        );
      case 'deviceDetail': // We'll keep this case for backward compatibility
        return (
          <DeviceDetailScreen
            device={selectedDevice}
            onBack={() => setCurrentScreen('deviceSelect')}
            onControl={() => setCurrentScreen('controls')}
            onOpenSettings={() => setCurrentScreen('settings')}
          />
        );
      case 'controls':
        return (
          <ControlsScreen
            device={selectedDevice}
            onBack={() => setCurrentScreen('deviceSelect')}
            onOpenSettings={() => setCurrentScreen('settings')}
          />
        );
      case 'addDevice':
        return (
          <AddDeviceScreen
            onBack={() => setCurrentScreen('deviceSelect')}
            onDeviceAdded={(device) => {
              handleDeviceAdded(device);
              setCurrentScreen('deviceSelect');
            }}
            onOpenSettings={() => setCurrentScreen('settings')}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            devices={devices}
            onBack={() => setCurrentScreen('home')}
            onClearDevices={handleClearDevices}
            onDeleteDevice={handleDeleteDevice}
            onUpdateDevice={handleUpdateDevice}
            serverOnline={serverOnline}
            searching={searching}
            retry={retry}
          >
            <NetworkScanner onServerFound={(ip) => {
              deviceService.setServerAddress(ip);
            }} />
          </SettingsScreen>
        );
      default:
        return <View><Text>Unknown Screen</Text></View>;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={{ flex: 1 }}>
        {renderCurrentScreen()}
        <QuickTestServer />
      </View>
    </SafeAreaView>
  );
};

export default App;