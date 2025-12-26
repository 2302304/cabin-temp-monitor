import { prisma } from '../config/prisma';

export class AlertService {
  // Hae kaikki aktiiviset hälytykset
  async getActiveAlerts() {
    return prisma.alert.findMany({
      where: { isResolved: false },
      include: {
        device: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }
  
  // Hae laitteen hälytykset
  async getDeviceAlerts(deviceId: string, includeResolved: boolean = false) {
    return prisma.alert.findMany({
      where: {
        deviceId,
        ...(includeResolved ? {} : { isResolved: false })
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  // Ratkaise hälytys
  async resolveAlert(alertId: string) {
    return prisma.alert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      }
    });
  }
  
  // Ratkaise kaikki laitteen hälytykset
  async resolveDeviceAlerts(deviceId: string) {
    return prisma.alert.updateMany({
      where: {
        deviceId,
        isResolved: false
      },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      }
    });
  }
  
  // Hae hälytysten tilastot
  async getAlertStatistics(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const alerts = await prisma.alert.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });
    
    const byType = alerts.reduce((acc, alert) => {
      acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bySeverity = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: alerts.length,
      active: alerts.filter(a => !a.isResolved).length,
      resolved: alerts.filter(a => a.isResolved).length,
      byType,
      bySeverity
    };
  }
}
