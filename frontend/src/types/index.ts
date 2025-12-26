export interface Device {
  id: string;
  name: string;
  location: string;
  deviceType: string;
  isActive: boolean;
  lastSeen: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Reading {
  id: string;
  deviceId: string;
  temperature: number;
  humidity: number | null;
  timestamp: Date | string;
  quality: 'GOOD' | 'WARNING' | 'ERROR';
}

export interface Alert {
  id: string;
  deviceId: string;
  alertType: 'TEMP_HIGH' | 'TEMP_LOW' | 'OFFLINE' | 'ANOMALY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  value: number | null;
  threshold: number | null;
  isResolved: boolean;
  createdAt: Date | string;
  resolvedAt: Date | string | null;
  device?: {
    id: string;
    name: string;
    location: string;
  };
}

export interface DeviceStatus {
  deviceId: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  isOnline: boolean;
  lastSeen: Date | string;
  latestReading: Reading | null;
  activeAlerts: Alert[];
}

export interface LatestReading {
  deviceId: string;
  deviceName: string;
  location: string;
  isActive: boolean;
  lastSeen: Date | string;
  latestReading: Reading | null;
}

export interface Statistics {
  min: number;
  max: number;
  avg: number;
  count: number;
}

export type TimeRange = 'hour' | 'day' | 'week' | 'month' | 'year';
