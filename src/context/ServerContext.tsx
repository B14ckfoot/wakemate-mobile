import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import deviceService from '../services/deviceService';
import { pingServer, testCommandEndpoint, runDiagnostics } from '../utils/serverStatusChecker';

interface ServerContextType {
  serverIp: string;
  setServerIp: (ip: string) => void;
  isConnected: boolean;
  connectionError: string | null;
  testConnection: () => Promise<boolean>;
  runServerDiagnostics: () => Promise<any>;
  lastStatus: 'success' | 'error' | 'pending' | null;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

interface ServerProviderProps {
  children: ReactNode;
}

export const ServerProvider: React.FC<ServerProviderProps> = ({ children }) => {
  const [serverIp, setServerIp] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<'success' | 'error' | 'pending' | null>(null);
  
  // Load server IP from storage on mount
  useEffect(() => {
    const loadServerIp = async () => {
      try {
        const savedIp = await AsyncStorage.getItem('serverIp');
        if (savedIp) {
          setServerIp(savedIp);
          deviceService.setServerAddress(savedIp);
        }
      } catch (error) {
        console.error('Error loading server IP:', error);
      }
    };
    
    loadServerIp();
  }, []);
  
  // Update the device service and localStorage when IP changes
  useEffect(() => {
    const updateServerIp = async () => {
      if (serverIp) {
        // Update in deviceService
        deviceService.setServerAddress(serverIp);
        
        // Save to AsyncStorage
        try {
          await AsyncStorage.setItem('serverIp', serverIp);
        } catch (error) {
          console.error('Error saving server IP:', error);
        }
        
        // Test the connection when IP changes
        testConnection();
      } else {
        setIsConnected(false);
        setConnectionError('Server IP not set');
      }
    };
    
    updateServerIp();
  }, [serverIp]);
  
  // Function to test the connection to the server
  const testConnection = async (): Promise<boolean> => {
    if (!serverIp) {
      setConnectionError('Server IP not set');
      setIsConnected(false);
      setLastStatus('error');
      return false;
    }
    
    setLastStatus('pending');
    
    try {
      setConnectionError(null);
      console.log('Testing connection to server...');
      
      // Try to ping the server first
      const pingResult = await pingServer(serverIp);
      
      if (!pingResult.success) {
        setIsConnected(false);
        setConnectionError(pingResult.message);
        setLastStatus('error');
        return false;
      }
      
      // If ping successful, test the command endpoint
      const commandResult = await testCommandEndpoint(serverIp);
      
      if (commandResult.success) {
        setIsConnected(true);
        setConnectionError(null);
        setLastStatus('success');
        return true;
      } else {
        setIsConnected(false);
        setConnectionError(`Server responded but command endpoint failed: ${commandResult.message}`);
        setLastStatus('error');
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
      setLastStatus('error');
      
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
  
  // Function to run comprehensive server diagnostics
  const runServerDiagnostics = async (): Promise<any> => {
    if (!serverIp) {
      return {
        overall: false,
        message: 'Server IP not set'
      };
    }
    
    try {
      const results = await runDiagnostics(serverIp);
      
      // Update connection status based on diagnostics
      setIsConnected(results.overall);
      
      if (!results.overall) {
        // Find the first failed step for error message
        const failedStep = results.steps.find(step => !step.success);
        if (failedStep) {
          setConnectionError(failedStep.message);
        } else {
          setConnectionError('Diagnostics failed but no specific error found');
        }
      } else {
        setConnectionError(null);
      }
      
      return results;
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setIsConnected(false);
      
      if (error instanceof Error) {
        setConnectionError(`Diagnostics failed: ${error.message}`);
      } else {
        setConnectionError('Diagnostics failed with unknown error');
      }
      
      return {
        overall: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        steps: []
      };
    }
  };
  
  return (
    <ServerContext.Provider 
      value={{ 
        serverIp, 
        setServerIp, 
        isConnected, 
        connectionError, 
        testConnection,
        runServerDiagnostics,
        lastStatus
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