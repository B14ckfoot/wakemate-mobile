export interface Device {
    id: string;
    name: string;
    mac: string;
    ip: string;
    status: 'online' | 'offline';
    type: 'wifi' | 'bluetooth';
  }
  
  export interface DeviceCommand {
    command: string;
    params?: Record<string, any>;
  }