export const formatTemperature = (temp: number): string => {
  return `${temp.toFixed(1)}°C`;
};

export const getTemperatureColor = (temp: number): string => {
  if (temp < 10) return 'text-temp-cold';
  if (temp < 18) return 'text-blue-500';
  if (temp < 22) return 'text-temp-normal';
  if (temp < 26) return 'text-temp-warm';
  return 'text-temp-hot';
};

export const getTemperatureBackgroundColor = (temp: number): string => {
  if (temp < 10) return 'bg-temp-cold/10';
  if (temp < 18) return 'bg-blue-500/10';
  if (temp < 22) return 'bg-temp-normal/10';
  if (temp < 26) return 'bg-temp-warm/10';
  return 'bg-temp-hot/10';
};

export const formatTimestamp = (timestamp: Date | string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'juuri nyt';
  if (diffMins < 60) return `${diffMins} min sitten`;
  if (diffHours < 24) return `${diffHours} h sitten`;
  if (diffDays < 7) return `${diffDays} pv sitten`;
  
  return date.toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
};

export const formatDateTime = (timestamp: Date | string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'CRITICAL':
      return 'text-red-600';
    case 'WARNING':
      return 'text-orange-600';
    case 'INFO':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export const getSeverityBadgeColor = (severity: string): string => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800';
    case 'WARNING':
      return 'bg-orange-100 text-orange-800';
    case 'INFO':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: 'online' | 'offline' | 'warning'): string => {
  switch (status) {
    case 'online':
      return 'text-green-600';
    case 'offline':
      return 'text-gray-400';
    case 'warning':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

export const getStatusBadgeColor = (status: 'online' | 'offline' | 'warning'): string => {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800';
    case 'offline':
      return 'bg-gray-100 text-gray-800';
    case 'warning':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
