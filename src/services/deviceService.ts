import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Device, DeviceCommand } from '../types/device';

export const deviceService = {
  async getServerAddress(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('serverIp');
    } catch (error) {
      console.error('Error getting server address:', error);
      return null;
    }
  },
  
  async setServerAddress(ip: string): Promise<void> {
    try {
      await AsyncStorage.setItem('serverIp', ip);
    } catch (error) {
      console.error('Error setting server address:', error);
      throw error;
    }
  },
  
  async getDevices(): Promise<Device[]> {
    try {
      const devices = await AsyncStorage.getItem('devices');
      return devices ? JSON.parse(devices) : [];
    } catch (error) {
      console.error('Error getting devices:', error);
      return [];
    }
  },
  
  async saveDevices(devices: Device[]): Promise<void> {
    try {
      await AsyncStorage.setItem('devices', JSON.stringify(devices));
    } catch (error) {
      console.error('Error saving devices:', error);
      throw error;
    }
  },
  
  async checkDeviceStatus(deviceIp: string): Promise<boolean> {
    try {
      const response = await axios.get(`http://${deviceIp}:7777/status`, {
        timeout: 3000,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      return response.data && 
        (response.data.status === "online" || response.data.status === "success");
    } catch (error) {
      console.log(`Error checking device status:`, error);
      return false;
    }
  },
  
  async sendCommand(command: string, params: Record<string, any> = {}): Promise<any> {
    const serverIp = await this.getServerAddress();
    
    if (!serverIp) {
      throw new Error('Server IP not set');
    }
    
    try {
      const response = await axios.post(`http://${serverIp}:7777`, {
        command,
        params
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  },
  
  // Mouse-specific commands
  async sendMouseMove(deviceId: string, deviceIp: string, dx: number, dy: number): Promise<any> {
    return this.sendCommand('mouse_move', {
      deviceId,
      targetIp: deviceIp,
      dx, 
      dy
    });
  },
  
  async sendMouseClick(deviceId: string, deviceIp: string, button: 'left' | 'right'): Promise<any> {
    return this.sendCommand('mouse_click', {
      deviceId,
      targetIp: deviceIp,
      button
    });
  },
  
  async sendScroll(deviceId: string, deviceIp: string, amount: number): Promise<any> {
    return this.sendCommand('mouse_scroll', {
      deviceId,
      targetIp: deviceIp,
      amount
    });
  },
  
  // Keyboard commands
  async sendKeyboardInput(deviceId: string, deviceIp: string, text: string): Promise<any> {
    return this.sendCommand('keyboard_input', {
      deviceId,
      targetIp: deviceIp,
      text
    });
  },
  
  async sendSpecialKey(deviceId: string, deviceIp: string, key: string): Promise<any> {
    return this.sendCommand('keyboard_special', {
      deviceId,
      targetIp: deviceIp,
      key
    });
  },
  
  // Media commands
  async sendMediaPlayPause(deviceId: string, deviceIp: string): Promise<any> {
    return this.sendCommand('media_play_pause', {
      deviceId,
      targetIp: deviceIp
    });
  },
  
  async sendMediaNext(deviceId: string, deviceIp: string): Promise<any> {
    return this.sendCommand('media_next', {
      deviceId,
      targetIp: deviceIp
    });
  },
  
  async sendMediaPrevious(deviceId: string, deviceIp: string): Promise<any> {
    return this.sendCommand('media_prev', {
      deviceId,
      targetIp: deviceIp
    });
  },
  
  // Volume commands
  async sendVolumeUp(deviceId: string, deviceIp: string): Promise<any> {
    return this.sendCommand('volume_up', {
      deviceId,
      targetIp: deviceIp
    });
  },
  
  async sendVolumeDown(deviceId: string, deviceIp: string): Promise<any> {
    return this.sendCommand('volume_down', {
      deviceId,
      targetIp: deviceIp
    });
  },
  
  async sendVolumeMute(deviceId: string, deviceIp: string): Promise<any> {
    return this.sendCommand('volume_mute', {
      deviceId,
      targetIp: deviceIp
    });
  },
  
  // Power commands
  async sendShutdown(deviceId: string, deviceIp: string): Promise<any> {
    return this.sendCommand('shutdown', {
      deviceId,
      targetIp: deviceIp
    });
  },
  
  async sendRestart(deviceId: string, deviceIp: string): Promise<any> {
    return this.sendCommand('restart', {
      deviceId,
      targetIp: deviceIp
    });
  },
  
  async sendSleep(deviceId: string, deviceIp: string): Promise<any> {
    return this.sendCommand('sleep', {
      deviceId,
      targetIp: deviceIp
    });
  },
  
  async wakeMachine(deviceId: string, mac: string): Promise<any> {
    if (!mac) {
      throw new Error('MAC address is required for wake operation');
    }
    
    return this.sendCommand('wake', {
      deviceId,
      mac
    });
  }
};

export default deviceService;