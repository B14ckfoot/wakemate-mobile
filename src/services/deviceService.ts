let serverIp: string | null = null;

export const deviceService = {
  setServerAddress(ip: string) {
    serverIp = ip;
  },

  getServerAddress(): string | null {
    return serverIp;
  },

  async sendCommand(command: any, params: any = {}) {
    if (!serverIp) {
      throw new Error('Server IP not set!');
    }

    const url = `http://${serverIp}:7777`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ command, params }),
      });

      if (!response.ok) {
        throw new Error(`Command failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  },

  async sendMouseCommand(deviceId: string, deviceIp: string, action: string, params: any = {}) {
    return this.sendCommand({
      deviceId,
      targetIp: deviceIp,
      type: 'mouse',
      action,
      ...params
    });
  },

  async sendKeyboardCommand(deviceId: string, deviceIp: string, key: string) {
    return this.sendCommand({
      deviceId,
      targetIp: deviceIp,
      type: 'keyboard',
      key
    });
  },

  async sendMediaCommand(deviceId: string, deviceIp: string, action: string) {
    return this.sendCommand({
      deviceId,
      targetIp: deviceIp,
      type: 'media',
      action
    });
  },

  async sendVolumeCommand(deviceId: string, deviceIp: string, action: string) {
    return this.sendCommand({
      deviceId,
      targetIp: deviceIp,
      type: 'volume',
      action
    });
  },

  async checkStatus() {
    if (!serverIp) {
      return false;
    }

    try {
      const response = await fetch(`http://${serverIp}:7777/status`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.status === 'online' || data.status === 'success';
    } catch {
      return false;
    }
  }
};

export default deviceService;