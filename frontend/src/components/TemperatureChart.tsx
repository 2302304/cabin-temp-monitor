import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Reading } from '../types';
import { formatDateTime } from '../utils/formatters';

interface Props {
  readings: Reading[];
  deviceName: string;
}

export const TemperatureChart = ({ readings, deviceName }: Props) => {
  if (readings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-400">
        Ei mittaushistoriaa
      </div>
    );
  }

  // Muunna data chartille sopivaan muotoon
  const chartData = readings.map(reading => ({
    timestamp: new Date(reading.timestamp).getTime(),
    temperature: reading.temperature,
    humidity: reading.humidity,
    formattedTime: formatDateTime(reading.timestamp),
    quality: reading.quality
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-600 mb-2">{data.formattedTime}</p>
        <p className="text-sm font-semibold text-gray-900">
          Lämpötila: {data.temperature.toFixed(1)}°C
        </p>
        {data.humidity !== null && (
          <p className="text-sm text-gray-600">
            Kosteus: {data.humidity.toFixed(0)}%
          </p>
        )}
        {data.quality !== 'GOOD' && (
          <p className="text-xs text-orange-600 mt-1">
            ⚠️ {data.quality}
          </p>
        )}
      </div>
    );
  };

  // Määritä Y-akselin skaalaus automaattisesti
  const temps = chartData.map(d => d.temperature);
  const minTemp = Math.floor(Math.min(...temps)) - 2;
  const maxTemp = Math.ceil(Math.max(...temps)) + 2;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Lämpötilahistoria - {deviceName}
      </h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return date.toLocaleString('fi-FI', {
                day: 'numeric',
                month: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            }}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            domain={[minTemp, maxTemp]}
            tickFormatter={(value) => `${value}°C`}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Lämpötila (°C)"
            activeDot={{ r: 6 }}
          />
          {chartData.some(d => d.humidity !== null) && (
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Kosteus (%)"
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
