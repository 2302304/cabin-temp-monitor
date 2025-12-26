import { prisma } from '../config/prisma';
import { config } from '../config';

export class DeviceService {
  // Hae kaikki laitteet
  async getAllDevices() {
    return prisma.device.findMany({
      orderBy: { name: 'asc' }
    });
  }
  
  // Hae laite ID:llä
  async getDeviceById(id: string) {
    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        alerts: {
          where: { isResolved: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!device) {
      throw new Error('Device not found');
    }
    
    return device;
  }
  
  // Luo uusi laite (IoT-laitteelle)
  async createDevice(name: string, location: string, deviceType: string = 'IOT') {
    return prisma.device.create({
      data: {
        name,
        location,
        deviceType,
        isActive: true
      }
    });
  }
  
  // Päivitä laite
  async updateDevice(id: string, data: { name?: string; location?: string; isActive?: boolean }) {
    return prisma.device.update({
      where: { id },
      data
    });
  }
  
  // Poista laite
  async deleteDevice(id: string) {
    return prisma.device.delete({
      where: { id }
    });
  }
  
  // Tarkista offline-laitteet
  async checkOfflineDevices() {
    const thresholdDate = new Date();
    thresholdDate.setMinutes(thresholdDate.getMinutes() - config.alerts.offlineThresholdMinutes);
    
    const offlineDevices = await prisma.device.findMany({
      where: {
        isActive: true,
        lastSeen: {
          lt: thresholdDate
        }
      }
    });
    
    // Luo hälytykset offline-laitteille
    for (const device of offlineDevices) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          deviceId: device.id,
          alertType: 'OFFLINE',
          isResolved: false
        }
      });
      
      if (!existingAlert) {
        await prisma.alert.create({
          data: {
            deviceId: device.id,
            alertType: 'OFFLINE',
            severity: 'WARNING',
            message: `Laite ${device.name} ei ole lähettänyt dataa ${config.alerts.offlineThresholdMinutes} minuuttiin`
          }
        });
      }
    }
    
    return offlineDevices;
  }
  
  // Hae laitteen tila
  async getDeviceStatus(id: string) {
    const device = await this.getDeviceById(id);
    const thresholdDate = new Date();
    thresholdDate.setMinutes(thresholdDate.getMinutes() - config.alerts.offlineThresholdMinutes);
    
    const isOnline = device.lastSeen > thresholdDate;
    const hasActiveAlerts = device.alerts.length > 0;
    
    let status: 'online' | 'offline' | 'warning' = 'online';
    if (!isOnline) {
      status = 'offline';
    } else if (hasActiveAlerts) {
      status = 'warning';
    }
    
    return {
      deviceId: device.id,
      name: device.name,
      location: device.location,
      status,
      isOnline,
      lastSeen: device.lastSeen,
      latestReading: device.readings[0] || null,
      activeAlerts: device.alerts
    };
  }
}
