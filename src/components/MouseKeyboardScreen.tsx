import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  MousePointer,
  Keyboard as KeyboardIcon,
  Music,
  Volume2,
  Volume,
  VolumeX,
  SkipBack,
  SkipForward,
  Play,
  Pause
} from 'lucide-react-native';
import deviceService from '../services/deviceService';
import { Device } from '../app/types/device';

export default function MouseKeyboardScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<'mouse' | 'keyboard' | 'media'>('mouse');
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Animated values for gesture tracking
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  // Animation for keyboard panel
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const mediaHeight = useRef(new Animated.Value(0)).current;
  
  // Load device details
  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const devices = await deviceService.getDevices();
        const foundDevice = devices.find(d => d.id === id);
        if (foundDevice) {
          setDevice(foundDevice);
        } else {
          Alert.alert('Error', 'Device not found');
          router.back();
        }
      } catch (error) {
        console.error('Error loading device:', error);
        Alert.alert('Error', 'Failed to load device');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevice();
  }, [id]);
  
  // Configure pan responder for touchpad
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, gestureState) => {
        // If two fingers are used, handle as scroll
        if (e.nativeEvent.touches.length > 1) {
          setIsScrolling(true);
          // We don't animate the pan in scroll mode
        } else {
          // Single finger is mouse movement
          setIsScrolling(false);
          Animated.event(
            [null, { dx: pan.x, dy: pan.y }],
            { useNativeDriver: false }
          )(e, gestureState);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();
        
        if (device) {
          if (isScrolling) {
            // Send scroll command
            sendScroll(gestureState.dy);
          } else if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
            // It's a tap (minimal movement) - send left click
            sendMouseClick('left');
          } else {
            // It's a drag - send mouse movement
            sendMouseMove(gestureState.dx, gestureState.dy);
          }
        }
        
        // Reset pan position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false
        }).start();
        
        setIsScrolling(false);
      }
    })
  ).current;
  
  // Toggle panels
  const toggleKeyboard = () => {
    if (activePanel !== 'keyboard') {
      setActivePanel('keyboard');
      Animated.timing(keyboardHeight, {
        toValue: 250,
        duration: 300,
        useNativeDriver: false
      }).start();
      
      // Hide media panel if open
      Animated.timing(mediaHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    } else {
      setActivePanel('mouse');
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };
  
  const toggleMedia = () => {
    if (activePanel !== 'media') {
      setActivePanel('media');
      Animated.timing(mediaHeight, {
        toValue: 150,
        duration: 300,
        useNativeDriver: false
      }).start();
      
      // Hide keyboard panel if open
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    } else {
      setActivePanel('mouse');
      Animated.timing(mediaHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };
  
  // Send commands
  const sendMouseMove = async (dx: number, dy: number) => {
    if (!device) return;
    
    try {
      await deviceService.sendMouseMove(device.id, device.ip, dx, dy);
    } catch (error) {
      console.error('Error sending mouse movement:', error);
    }
  };
  
  const sendMouseClick = async (button: 'left' | 'right') => {
    if (!device) return;
    
    try {
      await deviceService.sendMouseClick(device.id, device.ip, button);
    } catch (error) {
      console.error(`Error sending ${button} click:`, error);
    }
  };
  
  const sendScroll = async (amount: number) => {
    if (!device) return;
    
    try {
      await deviceService.sendScroll(device.id, device.ip, amount);
    } catch (error) {
      console.error('Error sending scroll:', error);
    }
  };
  
  const sendKeyboardInput = async () => {
    if (!device || !text) return;
    
    try {
      await deviceService.sendKeyboardInput(device.id, device.ip, text);
      setText('');
    } catch (error) {
      console.error('Error sending keyboard input:', error);
    }
  };
  
  const sendSpecialKey = async (key: string) => {
    if (!device) return;
    
    try {
      await deviceService.sendSpecialKey(device.id, device.ip, key);
    } catch (error) {
      console.error(`Error sending special key ${key}:`, error);
    }
  };
  
  const sendMediaCommand = async (command: string) => {
    if (!device) return;
    
    try {
      switch (command) {
        case 'play_pause':
          await deviceService.sendMediaPlayPause(device.id, device.ip);
          setIsPlaying(!isPlaying);
          break;
        case 'next':
          await deviceService.sendMediaNext(device.id, device.ip);
          break;
        case 'previous':
          await deviceService.sendMediaPrevious(device.id, device.ip);
          break;
        case 'volume_up':
          await deviceService.sendVolumeUp(device.id, device.ip);
          break;
        case 'volume_down':
          await deviceService.sendVolumeDown(device.id, device.ip);
          break;
        case 'mute':
          await deviceService.sendVolumeMute(device.id, device.ip);
          break;
      }
    } catch (error) {
      console.error(`Error sending media command ${command}:`, error);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading device...</Text>
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
        <Text style={styles.title}>
          {device?.name || 'Device Control'}
        </Text>
      </View>
      
      {/* Touch Pad */}
      <View 
        style={styles.touchPadContainer}
        {...panResponder.panHandlers}
      >
        <View style={styles.touchPad}>
          {isScrolling ? (
            <Text style={styles.scrollingText}>Scrolling...</Text>
          ) : (
            <>
              <MousePointer size={32} color="#7c3aed" style={styles.pointerIcon} />
              <Text style={styles.touchPadText}>
                • Tap for left click
                {'\n'}• Slide to move cursor
                {'\n'}• Two fingers to scroll
              </Text>
            </>
          )}
        </View>
      </View>
      
      {/* Mouse Buttons */}
      <View style={styles.mouseButtonsContainer}>
        <TouchableOpacity
          style={styles.mouseButton}
          onPress={() => sendMouseClick('left')}
          activeOpacity={0.6}
        >
          <Text style={styles.mouseButtonText}>Left Click</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.mouseButton}
          onPress={() => sendMouseClick('right')}
          activeOpacity={0.6}
        >
          <Text style={styles.mouseButtonText}>Right Click</Text>
        </TouchableOpacity>
      </View>
      
      {/* Panel Toggle Buttons */}
      <View style={styles.panelToggles}>
        <TouchableOpacity
          style={[
            styles.panelToggle,
            activePanel === 'keyboard' && styles.activeToggle
          ]}
          onPress={toggleKeyboard}
        >
          <KeyboardIcon 
            size={24} 
            color={activePanel === 'keyboard' ? '#7c3aed' : '#a0a0a0'} 
          />
          <Text style={[
            styles.panelToggleText,
            activePanel === 'keyboard' && styles.activeToggleText
          ]}>Keyboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.panelToggle,
            activePanel === 'media' && styles.activeToggle
          ]}
          onPress={toggleMedia}
        >
          <Music 
            size={24} 
            color={activePanel === 'media' ? '#7c3aed' : '#a0a0a0'} 
          />
          <Text style={[
            styles.panelToggleText,
            activePanel === 'media' && styles.activeToggleText
          ]}>Media</Text>
        </TouchableOpacity>
      </View>
      
      {/* Keyboard Panel */}
      <Animated.View 
        style={[
          styles.keyboardPanel,
          { height: keyboardHeight }
        ]}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Type here..."
            placeholderTextColor="#6b7280"
            onSubmitEditing={sendKeyboardInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendKeyboardInput}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialKeysContainer}
        >
          {['Escape', 'Tab', 'Enter', 'Backspace', 'Delete', 'Home', 'End', 'PageUp', 'PageDown'].map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.specialKey}
              onPress={() => sendSpecialKey(key)}
            >
              <Text style={styles.specialKeyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
      
      {/* Media Panel */}
      <Animated.View 
        style={[
          styles.mediaPanel,
          { height: mediaHeight }
        ]}
      >
        <View style={styles.mediaControls}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={() => sendMediaCommand('previous')}
          >
            <SkipBack size={32} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.mediaButton, styles.playButton]}
            onPress={() => sendMediaCommand('play_pause')}
          >
            {isPlaying ? (
              <Pause size={32} color="#ffffff" />
            ) : (
              <Play size={32} color="#ffffff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={() => sendMediaCommand('next')}
          >
            <SkipForward size={32} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.volumeControls}>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => sendMediaCommand('mute')}
          >
            <VolumeX size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => sendMediaCommand('volume_down')}
          >
            <Volume size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => sendMediaCommand('volume_up')}
          >
            <Volume2 size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
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
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  touchPadContainer: {
    flex: 1,
    marginBottom: 16,
  },
  touchPad: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  touchPadText: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollingText: {
    color: '#7c3aed',
    fontSize: 18,
    fontWeight: '600',
  },
  mouseButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mouseButton: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    paddingVertical: 12,
    width: '48%',
    alignItems: 'center',
  },
  mouseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  panelToggles: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  panelToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
  },
  activeToggle: {
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
  },
  panelToggleText: {
    color: '#a0a0a0',
    marginLeft: 8,
    fontSize: 16,
  },
  activeToggleText: {
    color: '#7c3aed',
  },
  keyboardPanel: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  specialKeysContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  specialKey: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  specialKeyText: {
    color: '#ffffff',
  },
  mediaPanel: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  mediaButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7c3aed',
  },
  volumeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  volumeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
});