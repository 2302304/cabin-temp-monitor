import { prisma } from '../config/prisma';
import { config } from '../config';

export class ReadingService {
  // Hae viimeisimmät mittaukset kaikilta laitteilta
  async getLatestReadings() {
    const devices = await prisma.device.findMany({
      where: { isActive: true },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });
    
    return devices.map(device => ({
      deviceId: device.id,
      deviceName: device.name,
      location: device.location,
      isActive: device.isActive,
      lastSeen: device.lastSeen,
      latestReading: device.readings[0] || null
    }));
  }
  
  // Hae historia tietylle laitteelle
  async getDeviceHistory(deviceId: string, timeRange: string = 'day') {
    const now = new Date();
    let startDate = new Date();
    let interval = '15 minutes'; // default
    
    switch (timeRange) {
      case 'hour':
        startDate.setHours(now.getHours() - 1);
        interval = '1 minute';
        break;
      case 'day':
        startDate.setDate(now.getDate() - 1);
        interval = '15 minutes';
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        interval = '1 hour';
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        interval = '6 hours';
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        interval = '1 day';
        break;
    }
    
    // Hae data ja ryhmittele
    const readings = await prisma.reading.findMany({
      where: {
        deviceId,
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    
    // Aggregoi data sopiviin väleihin (yksinkertaistettu)
    return this.aggregateReadings(readings, timeRange);
  }
  
  // Aggregoi mittaukset
  private aggregateReadings(readings: any[], timeRange: string) {
    if (readings.length === 0) return [];
    
    const maxPoints = config.dataPoints[timeRange as keyof typeof config.dataPoints] || 100;
    
    if (readings.length <= maxPoints) {
      return readings;
    }
    
    // Ota tasaisin välein pisteitä
    const step = Math.floor(readings.length / maxPoints);
    return readings.filter((_, index) => index % step === 0);
  }
  
  // Tallenna uusi mittaus (IoT-laitteelle)
  async createReading(deviceId: string, temperature: number, humidity?: number) {
    // Tarkista onko laite olemassa
    const device = await prisma.device.findUnique({
      where: { id: deviceId }
    });
    
    if (!device) {
      throw new Error('Device not found');
    }
    
    // Määritä laatu
    let quality = 'GOOD';
    if (temperature < config.alerts.tempLow || temperature > config.alerts.tempHigh) {
      quality = 'WARNING';
    }
    
    // Tallenna mittaus
    const reading = await prisma.reading.create({
      data: {
        deviceId,
        temperature,
        humidity,
        quality,
        timestamp: new Date()
      }
    });
    
    // Päivitä laitteen lastSeen
    await prisma.device.update({
      where: { id: deviceId },
      data: { lastSeen: new Date() }
    });
    
    // Tarkista hälytykset
    await this.checkAlerts(deviceId, temperature);
    
    return reading;
  }
  
  // Tarkista pitääkö luoda hälytys
  private async checkAlerts(deviceId: string, temperature: number) {
    const { tempHigh, tempLow } = config.alerts;
    
    // Tarkista onko jo aktiivinen hälytys
    const existingAlert = await prisma.alert.findFirst({
      where: {
        deviceId,
        isResolved: false,
        alertType: {
          in: ['TEMP_HIGH', 'TEMP_LOW']
        }
      }
    });
    
    // Jos lämpötila normaali, ratkaise olemassaolevat hälytykset
    if (temperature >= tempLow && temperature <= tempHigh) {
      if (existingAlert) {
        await prisma.alert.update({
          where: { id: existingAlert.id },
          data: {
            isResolved: true,
            resolvedAt: new Date()
          }
        });
      }
      return;
    }
    
    // Luo uusi hälytys jos ei ole aktiivista
    if (!existingAlert) {
      const alertType = temperature > tempHigh ? 'TEMP_HIGH' : 'TEMP_LOW';
      const threshold = temperature > tempHigh ? tempHigh : tempLow;
      
      await prisma.alert.create({
        data: {
          deviceId,
          alertType,
          severity: Math.abs(temperature - threshold) > 3 ? 'CRITICAL' : 'WARNING',
          message: `Lämpötila ${temperature}°C ${temperature > tempHigh ? 'ylittää' : 'alittaa'} raja-arvon ${threshold}°C`,
          value: temperature,
          threshold
        }
      });
    }
  }
  
  // Hae tilastoja
  async getStatistics(deviceId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const readings = await prisma.reading.findMany({
      where: {
        deviceId,
        timestamp: {
          gte: startDate
        }
      },
      select: {
        temperature: true,
        timestamp: true
      }
    });
    
    if (readings.length === 0) {
      return null;
    }
    
    const temperatures = readings.map(r => r.temperature);
    
    return {
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      avg: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      count: readings.length
    };
  }
}
