import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useEnhancedAutoDiscoverServer() {
  const [serverIp, setServerIp] = useState(null);
  const [searching, setSearching] = useState(true);
  const [error, setError] = useState(false);
  const [currentSubnet, setCurrentSubnet] = useState(null);
  const [progress, setProgress] = useState(0);

  // Common subnets to scan
  const subnets = [
    '10.0.0.',    // Common home/office networks
    '192.168.0.', // Common home routers
    '192.168.1.', // Common home routers
    '192.168.',   // Scan 192.168.2.x through 192.168.5.x
    '10.0.1.'     // Alternative 10.x networks
  ];

  const scanNetwork = async () => {
    setSearching(true);
    setError(false);
    
    console.log('Starting enhanced network scan...');

    // First, check AsyncStorage for a previously saved IP
    try {
      const storedIp = await AsyncStorage.getItem('serverIp');
      if (storedIp) {
        console.log(`Found stored IP: ${storedIp}, testing connection...`);
        try {
          const isValid = await testServerConnection(storedIp);
          if (isValid) {
            console.log(`Stored IP ${storedIp} is valid, using it`);
            setServerIp(storedIp);
            setSearching(false);
            return;
          } else {
            console.log(`Stored IP ${storedIp} is no longer valid, scanning networks...`);
            await AsyncStorage.removeItem('serverIp'); // Clear invalid IP
          }
        } catch (e) {
          console.log(`Error testing stored IP: ${e}`);
        }
      }

      // Scan each subnet
      for (const subnet of subnets) {
        setCurrentSubnet(subnet);
        console.log(`Scanning subnet: ${subnet}x`);
        
        if (subnet === '192.168.') {
          // Special case to scan 192.168.2.x through 192.168.5.x
          for (let subnetNum = 2; subnetNum <= 5; subnetNum++) {
            const result = await scanSubnet(`192.168.${subnetNum}.`);
            if (result) return;
          }
        } else {
          const result = await scanSubnet(subnet);
          if (result) return;
        }
      }

      console.log('Network scan complete, no server found');
      setError(true);
      setSearching(false);
    } catch (e) {
      console.error('Error during network scan:', e);
      setError(true);
      setSearching(false);
    }
  };

  const scanSubnet = async (subnet) => {
    const timeout = 1000; // 1 second timeout per IP
    const startRange = 1;
    const endRange = 254;
    
    // Only scan key IPs first for speed
    const priorityIPs = [1, 100, 101, 102, 103, 104, 105, 150, 200];
    
    // First try the priority IPs
    for (const i of priorityIPs) {
      setProgress(Math.floor((i / endRange) * 100));
      const ip = subnet + i;
      const found = await checkIP(ip, timeout);
      if (found) return true;
    }
    
    // Then scan the rest
    for (let i = startRange; i <= endRange; i++) {
      // Skip priority IPs we already checked
      if (priorityIPs.includes(i)) continue;
      
      setProgress(Math.floor((i / endRange) * 100));
      const ip = subnet + i;
      const found = await checkIP(ip, timeout);
      if (found) return true;
    }
    
    return false;
  };

  const checkIP = async (ip, timeout) => {
    try {
      console.log(`Checking IP: ${ip}`);
      const found = await testServerConnection(ip, timeout);
      if (found) {
        console.log(`Server found at ${ip}`);
        setServerIp(ip);
        await AsyncStorage.setItem('serverIp', ip);
        setSearching(false);
        return true;
      }
    } catch (e) {
      // Ignore timeout or fetch errors
    }
    return false;
  };

  const testServerConnection = async (ip, timeout = 2000) => {
    try {
      // In React Native, we need a different approach for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`http://${ip}:7777/status`, { 
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.status === "online" || data.status === "success";
      }
    } catch (e) {
      // Expected for most IPs, just return false
    }
    
    return false;
  };

  useEffect(() => {
    scanNetwork();
  }, []);

  const retry = () => {
    scanNetwork();
  };

  return { 
    serverIp, 
    searching, 
    error, 
    retry, 
    currentSubnet,
    progress 
  };
}