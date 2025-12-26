import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cabin_temp',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Hälytysten raja-arvot
  alerts: {
    tempHigh: parseFloat(process.env.ALERT_TEMP_HIGH || '26'),
    tempLow: parseFloat(process.env.ALERT_TEMP_LOW || '15'),
    offlineThresholdMinutes: parseInt(process.env.ALERT_OFFLINE_MINUTES || '30', 10)
  },
  
  // Datapisteiden määrä eri aikavälille
  dataPoints: {
    day: 96,      // 15 min välein
    week: 168,    // tunti välein
    month: 120,   // 6h välein
    year: 365     // päivä välein
  }
};
