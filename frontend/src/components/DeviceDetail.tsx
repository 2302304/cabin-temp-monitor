import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../services/api';
import type { Reading, TimeRange, Statistics } from '../types';
import { TemperatureChart } from './TemperatureChart';
import { AlertBadge } from './AlertBadge';
import { formatTemperature } from '../utils/formatters';

interface Props {
  deviceId: string;
  deviceName: string;
  onClose: () => void;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: 'hour', label: '1h' },
  { value: 'day', label: '24h' },
  { value: 'week', label: '7pv' },
  { value: 'month', label: '30pv' },
];

export const DeviceDetail = ({ deviceId, deviceName, onClose }: Props) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('day');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [deviceId, selectedRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyData, statsData, alertsData] = await Promise.all([
        api.getDeviceHistory(deviceId, selectedRange),
        api.getDeviceStatistics(deviceId, 7),
        api.getDeviceAlerts(deviceId, false)
      ]);
      
      setReadings(historyData);
      setStats(statsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading device data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      loadData(); // Päivitä data
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{deviceName}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Ladataan...</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Tilastot */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Keskiarvo (7pv)</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTemperature(stats.avg)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-blue-500" />
                    Minimi
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatTemperature(stats.min)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    Maksimi
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatTemperature(stats.max)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 mb-1">Mittauksia</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.count}
                  </div>
                </div>
              </div>
            )}

            {/* Aikavälivalitsin */}
            <div className="flex gap-2">
              {timeRanges.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedRange(value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedRange === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Käyrä */}
            <TemperatureChart readings={readings} deviceName={deviceName} />

            {/* Hälytykset */}
            {alerts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Aktiiviset hälytykset ({alerts.length})
                </h3>
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <AlertBadge
                      key={alert.id}
                      alert={alert}
                      onResolve={handleResolveAlert}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
