import type { 
  Device, 
  Reading, 
  Alert, 
  DeviceStatus, 
  LatestReading,
  Statistics,
  TimeRange 
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    return this.fetch<Device[]>('/devices');
  }

  async getDeviceById(id: string): Promise<Device> {
    return this.fetch<Device>(`/devices/${id}`);
  }

  async getDeviceStatus(id: string): Promise<DeviceStatus> {
    return this.fetch<DeviceStatus>(`/devices/${id}/status`);
  }

  async createDevice(name: string, location: string): Promise<Device> {
    return this.fetch<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify({ name, location, deviceType: 'IOT' }),
    });
  }

  // Readings
  async getLatestReadings(): Promise<LatestReading[]> {
    return this.fetch<LatestReading[]>('/readings/latest');
  }

  async getDeviceHistory(deviceId: string, timeRange: TimeRange = 'day'): Promise<Reading[]> {
    return this.fetch<Reading[]>(`/readings/device/${deviceId}?timeRange=${timeRange}`);
  }

  async getDeviceStatistics(deviceId: string, days: number = 7): Promise<Statistics> {
    return this.fetch<Statistics>(`/readings/device/${deviceId}/stats?days=${days}`);
  }

  async createReading(deviceId: string, temperature: number, humidity?: number): Promise<Reading> {
    return this.fetch<Reading>('/readings', {
      method: 'POST',
      body: JSON.stringify({ deviceId, temperature, humidity }),
    });
  }

  // Alerts
  async getActiveAlerts(): Promise<Alert[]> {
    return this.fetch<Alert[]>('/alerts');
  }

  async getDeviceAlerts(deviceId: string, includeResolved: boolean = false): Promise<Alert[]> {
    return this.fetch<Alert[]>(`/alerts/device/${deviceId}?includeResolved=${includeResolved}`);
  }

  async resolveAlert(alertId: string): Promise<Alert> {
    return this.fetch<Alert>(`/alerts/${alertId}/resolve`, {
      method: 'PUT',
    });
  }

  async resolveAllDeviceAlerts(deviceId: string): Promise<void> {
    await this.fetch(`/alerts/device/${deviceId}/resolve-all`, {
      method: 'PUT',
    });
  }
}

export const api = new ApiService();
