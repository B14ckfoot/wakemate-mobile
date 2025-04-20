import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import deviceService from '../services/deviceService';

interface ServerContextType {
  serverIp: string;
  setServerIp: (ip: string) => void;
  isConnected: boolean;
  connectionError: string | null;
  testConnection: () => Promise<boolean>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

interface ServerProviderProps {
  children: ReactNode;
}

export const ServerProvider: React.FC<ServerProviderProps> = ({ children }) => {
  const [serverIp, setServerIp] = useState<string>(() => {
    // Try to load from localStorage if available
    const savedIp = localStorage.getItem('serverIp');
    return savedIp || '';
  });
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Update the device service and localStorage when IP changes
  useEffect(() => {
    if (serverIp) {
      deviceService.setServerAddress(serverIp);
      localStorage.setItem('serverIp', serverIp);
      
      // Test the connection when IP changes
      testConnection();
    } else {
      setIsConnected(false);
      setConnectionError('Server IP not set');
    }
  }, [serverIp]);
  
  // Function to test the connection to the server
  const testConnection = async (): Promise<boolean> => {
    if (!serverIp) {
      setConnectionError('Server IP not set');
      setIsConnected(false);
      return false;
    }
    
    try {
      setConnectionError(null);
      console.log('Testing connection to server...');
      
      // Try to get server status as a connection test
      const response = await deviceService.sendCommand({
        command: "get_status",
        params: {}
      });
      
      console.log('Connection test response:', response);
      
      if (response.status === "success") {
        setIsConnected(true);
        setConnectionError(null);
        return true;
      } else {
        setIsConnected(false);
        setConnectionError('Server returned an error: ' + (response.message || 'Unknown error'));
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
      
      // Provide a more specific error message based on the error
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          setConnectionError('Network error: Unable to reach the server. Make sure the server is running.');
        } else if (error.message.includes('404')) {
          setConnectionError('Server found but API endpoint not available');
        } else if (error.message.includes('ECONNREFUSED')) {
          setConnectionError('Connection refused: Check if server is running');
        } else {
          setConnectionError(`Failed to connect: ${error.message}`);
        }
      } else {
        setConnectionError('Failed to connect to server');
      }
      
      return false;
    }
  };
  
  return (
    <ServerContext.Provider 
      value={{ 
        serverIp, 
        setServerIp, 
        isConnected, 
        connectionError, 
        testConnection 
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};

// Custom hook to use the server context
export const useServer = (): ServerContextType => {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error('useServer must be used within a ServerProvider');
  }
  return context;
};