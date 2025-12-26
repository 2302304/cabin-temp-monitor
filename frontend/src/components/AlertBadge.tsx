import { X } from 'lucide-react';
import type { Alert } from '../types';
import { formatDateTime, getSeverityBadgeColor } from '../utils/formatters';

interface Props {
  alert: Alert;
  onResolve?: (alertId: string) => void;
}

export const AlertBadge = ({ alert, onResolve }: Props) => {
  const getAlertIcon = () => {
    switch (alert.alertType) {
      case 'OFFLINE':
        return '📡';
      case 'TEMP_HIGH':
        return '🔥';
      case 'TEMP_LOW':
        return '❄️';
      case 'ANOMALY':
        return '⚠️';
      default:
        return '⚠️';
    }
  };

  return (
    <div className={`rounded-lg p-4 ${alert.isResolved ? 'bg-gray-50' : 'bg-white shadow-sm'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{getAlertIcon()}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityBadgeColor(alert.severity)}`}>
                {alert.severity}
              </span>
              {alert.device && (
                <span className="text-sm text-gray-600">{alert.device.name}</span>
              )}
            </div>
            <p className={`text-sm ${alert.isResolved ? 'text-gray-500' : 'text-gray-900'}`}>
              {alert.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDateTime(alert.createdAt)}
              {alert.isResolved && alert.resolvedAt && (
                <span className="ml-2">• Ratkaistu {formatDateTime(alert.resolvedAt)}</span>
              )}
            </p>
          </div>
        </div>
        
        {!alert.isResolved && onResolve && (
          <button
            onClick={() => onResolve(alert.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Merkitse ratkaistuksi"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
