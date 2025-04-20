/**
 * Utility for checking server status and doing diagnostic tests
 */

export async function pingServer(ip: string, port: number = 7777): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    try {
      const startTime = performance.now();
      
      // Attempt to connect to the server with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`http://${ip}:${port}/status`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (response.ok) {
        try {
          const data = await response.json();
          return {
            success: true,
            message: `Connected successfully (${responseTime}ms)`,
            responseTime,
          };
        } catch (e) {
          return {
            success: false,
            message: 'Server responded but sent invalid JSON',
            responseTime,
          };
        }
      } else {
        return {
          success: false,
          message: `Server responded with status ${response.status}`,
          responseTime,
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        // Check if the error was an abort error (timeout)
        if (error.name === 'AbortError') {
          return {
            success: false,
            message: 'Connection timed out after 3 seconds',
          };
        }
        
        // Provide friendly messages for common errors
        if (error.message.includes('Failed to fetch')) {
          return {
            success: false,
            message: 'Failed to connect to server. Make sure the server is running and the network is configured correctly.',
          };
        }
        
        return {
          success: false,
          message: `Connection error: ${error.message}`,
        };
      }
      
      return {
        success: false,
        message: 'Unknown connection error',
      };
    }
  }
  
  export async function testCommandEndpoint(ip: string, port: number = 7777): Promise<{
    success: boolean;
    message: string;
    responseData?: any;
  }> {
    try {
      // Attempt to send a simple test command
      const response = await fetch(`http://${ip}:${port}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'get_status',
          params: {},
        }),
        // Add a timeout
        signal: AbortSignal.timeout(3000),
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          return {
            success: true,
            message: 'Command endpoint working correctly',
            responseData: data,
          };
        } catch (e) {
          return {
            success: false,
            message: 'Command endpoint responded but sent invalid JSON',
          };
        }
      } else {
        return {
          success: false,
          message: `Command endpoint responded with status ${response.status}`,
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        // Provide friendly messages for common errors
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
          return {
            success: false,
            message: 'Command request timed out after 3 seconds',
          };
        }
        
        return {
          success: false,
          message: `Command request error: ${error.message}`,
        };
      }
      
      return {
        success: false,
        message: 'Unknown command request error',
      };
    }
  }
  
  export async function runDiagnostics(ip: string, port: number = 7777): Promise<{
    overall: boolean;
    steps: Array<{
      name: string;
      success: boolean;
      message: string;
      data?: any;
    }>;
  }> {
    const results = {
      overall: false,
      steps: [] as Array<{
        name: string;
        success: boolean;
        message: string;
        data?: any;
      }>,
    };
    
    // Step 1: Ping server
    const pingResult = await pingServer(ip, port);
    results.steps.push({
      name: 'Server Ping',
      success: pingResult.success,
      message: pingResult.message,
      data: pingResult,
    });
    
    // Step 2: Test command endpoint
    const commandResult = await testCommandEndpoint(ip, port);
    results.steps.push({
      name: 'Command Endpoint',
      success: commandResult.success,
      message: commandResult.message,
      data: commandResult,
    });
    
    // Determine overall success
    results.overall = results.steps.every(step => step.success);
    
    return results;
  }