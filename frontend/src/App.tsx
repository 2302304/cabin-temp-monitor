import { useState, useEffect } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { api } from './services/api';
import { DeviceCard } from './components/DeviceCard';
import { DeviceDetail } from './components/DeviceDetail';
import { AlertBadge } from './components/AlertBadge';
import type { LatestReading, Alert } from './types';

function App() {
  const [readings, setReadings] = useState<LatestReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    // Päivitä data automaattisesti 30s välein
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [readingsData, alertsData] = await Promise.all([
        api.getLatestReadings(),
        api.getActiveAlerts()
      ]);
      
      setReadings(readingsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      await loadData();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const selectedDevice = readings.find(r => r.deviceId === selectedDeviceId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Ladataan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🏡 Kesämökin Lämpötilaseuranta</h1>
              <p className="text-sm text-gray-600 mt-1">Reaaliaikainen lämpötilamonitorointi</p>
            </div>
            <button
              onClick={loadData}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                refreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              Päivitä
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hälytykset */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Aktiiviset hälytykset ({alerts.length})
              </h2>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 5).map(alert => (
                <AlertBadge
                  key={alert.id}
                  alert={alert}
                  onResolve={handleResolveAlert}
                />
              ))}
              {alerts.length > 5 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ... ja {alerts.length - 5} muuta hälytystä
                </div>
              )}
            </div>
          </div>
        )}

        {/* Laitteet */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lämpötilat</h2>
          {readings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-400">
              Ei laitteita
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {readings.map(reading => (
                <DeviceCard
                  key={reading.deviceId}
                  reading={reading}
                  onClick={() => setSelectedDeviceId(reading.deviceId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info-laatikko */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tietoa järjestelmästä</h3>
          <p className="text-sm text-blue-800">
            Tämä sovellus käyttää tällä hetkellä simuloitua seed-dataa. 
            Järjestelmä on suunniteltu niin, että voit myöhemmin korvata seed-datan 
            oikeilla IoT-sensoreilla ilman muutoksia käyttöliittymään. 
            Mittaukset päivittyvät automaattisesti 30 sekunnin välein.
          </p>
        </div>
      </main>

      {/* Device Detail Modal */}
      {selectedDeviceId && selectedDevice && (
        <DeviceDetail
          deviceId={selectedDeviceId}
          deviceName={selectedDevice.deviceName}
          onClose={() => setSelectedDeviceId(null)}
        />
      )}
    </div>
  );
}

export default App;
