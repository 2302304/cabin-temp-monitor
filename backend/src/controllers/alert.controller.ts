import { Request, Response } from 'express';
import { AlertService } from '../services/alert.service';

const alertService = new AlertService();

export class AlertController {
  // GET /api/alerts - Hae aktiiviset hälytykset
  async getActive(req: Request, res: Response) {
    try {
      const alerts = await alertService.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }
  
  // GET /api/alerts/device/:deviceId - Hae laitteen hälytykset
  async getDeviceAlerts(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const { includeResolved = 'false' } = req.query;
      
      const alerts = await alertService.getDeviceAlerts(
        deviceId,
        includeResolved === 'true'
      );
      
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching device alerts:', error);
      res.status(500).json({ error: 'Failed to fetch device alerts' });
    }
  }
  
  // PUT /api/alerts/:id/resolve - Ratkaise hälytys
  async resolve(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const alert = await alertService.resolveAlert(id);
      res.json(alert);
    } catch (error) {
      console.error('Error resolving alert:', error);
      res.status(500).json({ error: 'Failed to resolve alert' });
    }
  }
  
  // PUT /api/alerts/device/:deviceId/resolve-all - Ratkaise kaikki laitteen hälytykset
  async resolveAll(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      await alertService.resolveDeviceAlerts(deviceId);
      res.status(204).send();
    } catch (error) {
      console.error('Error resolving device alerts:', error);
      res.status(500).json({ error: 'Failed to resolve device alerts' });
    }
  }
  
  // GET /api/alerts/statistics - Hälytystilastot
  async getStatistics(req: Request, res: Response) {
    try {
      const { days = '7' } = req.query;
      const stats = await alertService.getAlertStatistics(
        parseInt(days as string, 10)
      );
      res.json(stats);
    } catch (error) {
      console.error('Error fetching alert statistics:', error);
      res.status(500).json({ error: 'Failed to fetch alert statistics' });
    }
  }
}
