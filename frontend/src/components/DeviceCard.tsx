import { Thermometer, Droplets, Clock } from 'lucide-react';
import type { LatestReading } from '../types';
import { 
  formatTemperature, 
  formatTimestamp, 
  getTemperatureColor,
  getTemperatureBackgroundColor 
} from '../utils/formatters';

interface Props {
  reading: LatestReading;
  onClick: () => void;
}

export const DeviceCard = ({ reading, onClick }: Props) => {
  const { deviceName, location, latestReading } = reading;
  const temp = latestReading?.temperature;
  const humidity = latestReading?.humidity;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{deviceName}</h3>
          <p className="text-sm text-gray-500">{location}</p>
        </div>
        {latestReading && (
          <div className={`p-2 rounded-full ${getTemperatureBackgroundColor(temp || 0)}`}>
            <Thermometer className={`w-6 h-6 ${getTemperatureColor(temp || 0)}`} />
          </div>
        )}
      </div>

      {latestReading ? (
        <div className="space-y-3">
          <div>
            <div className={`text-4xl font-bold ${getTemperatureColor(temp || 0)}`}>
              {formatTemperature(temp || 0)}
            </div>
            {humidity !== null && humidity !== undefined && (
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <Droplets className="w-4 h-4" />
                <span className="text-sm">{humidity.toFixed(0)}% kosteus</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(latestReading.timestamp)}</span>
          </div>

          {latestReading.quality !== 'GOOD' && (
            <div className="text-xs text-orange-600">
              ⚠️ {latestReading.quality === 'WARNING' ? 'Epäilyttävä arvo' : 'Virhe mittauksessa'}
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-4">
          Ei mittauksia
        </div>
      )}
    </div>
  );
};
