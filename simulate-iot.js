#!/usr/bin/env node

/**
 * IoT Device Simulator
 * 
 * Simuloi oikean IoT-laitteen lähettämiä mittauksia.
 * Käyttö: node simulate-iot.js <device-id>
 */

const API_URL = process.env.API_URL || 'http://localhost:3001/api';
const DEVICE_ID = process.argv[2];
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || '60000', 10); // 1 min

if (!DEVICE_ID) {
  console.error('❌ Anna device ID parametrina: node simulate-iot.js <device-id>');
  process.exit(1);
}

let baseTemp = 21;
let baseHumidity = 50;

async function sendReading() {
  try {
    // Simuloi lämpötila-heilahtelua
    const tempVariation = (Math.random() - 0.5) * 2;
    const humidityVariation = (Math.random() - 0.5) * 5;
    
    const temperature = parseFloat((baseTemp + tempVariation).toFixed(2));
    const humidity = parseFloat((baseHumidity + humidityVariation).toFixed(1));
    
    const response = await fetch(`${API_URL}/readings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceId: DEVICE_ID,
        temperature,
        humidity
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ [${new Date().toISOString()}] Sent: ${temperature}°C, ${humidity}% - Quality: ${data.quality}`);
    } else {
      const error = await response.text();
      console.error(`❌ Error: ${error}`);
    }
  } catch (error) {
    console.error(`❌ Connection error:`, error.message);
  }
}

console.log(`🚀 Starting IoT device simulator`);
console.log(`📡 Device ID: ${DEVICE_ID}`);
console.log(`🔄 Interval: ${INTERVAL_MS}ms`);
console.log(`🎯 Target: ${API_URL}`);
console.log('');

// Lähetä heti ensimmäinen
sendReading();

// Jatka intervallilla
setInterval(sendReading, INTERVAL_MS);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping simulator...');
  process.exit(0);
});
