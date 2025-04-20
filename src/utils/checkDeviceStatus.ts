export async function checkDeviceStatus(ip: string, port: number = 7777): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Increase timeout to 3 seconds

    const response = await fetch(`http://${ip}:${port}/status`, {
      method: 'GET',
      signal: controller.signal,
      // Add headers to avoid caching issues
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
    } else {
      console.log(`Device at ${ip}:${port} returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`Error checking device status for ${ip}:${port}`, error);
    return false;
  }
}