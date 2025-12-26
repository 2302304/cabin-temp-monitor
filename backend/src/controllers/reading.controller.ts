import { Request, Response } from 'express';
import { ReadingService } from '../services/reading.service';

const readingService = new ReadingService();

export class ReadingController {
  // GET /api/readings/latest - Viimeisimmät mittaukset kaikilta laitteilta
  async getLatest(req: Request, res: Response) {
    try {
      const readings = await readingService.getLatestReadings();
      res.json(readings);
    } catch (error) {
      console.error('Error fetching latest readings:', error);
      res.status(500).json({ error: 'Failed to fetch readings' });
    }
  }
  
  // GET /api/readings/device/:deviceId - Laitteen historia
  async getDeviceHistory(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const { timeRange = 'day' } = req.query;
      
      const readings = await readingService.getDeviceHistory(
        deviceId,
        timeRange as string
      );
      
      res.json(readings);
    } catch (error) {
      console.error('Error fetching device history:', error);
      res.status(500).json({ error: 'Failed to fetch device history' });
    }
  }
  
  // POST /api/readings - Luo uusi mittaus (IoT-laitteelle)
  async createReading(req: Request, res: Response) {
    try {
      const { deviceId, temperature, humidity } = req.body;
      
      if (!deviceId || temperature === undefined) {
        return res.status(400).json({ 
          error: 'deviceId and temperature are required' 
        });
      }
      
      const reading = await readingService.createReading(
        deviceId,
        parseFloat(temperature),
        humidity ? parseFloat(humidity) : undefined
      );
      
      res.status(201).json(reading);
    } catch (error: any) {
      console.error('Error creating reading:', error);
      res.status(500).json({ error: error.message || 'Failed to create reading' });
    }
  }
  
  // GET /api/readings/device/:deviceId/stats - Tilastot
  async getStatistics(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const { days = '7' } = req.query;
      
      const stats = await readingService.getStatistics(
        deviceId,
        parseInt(days as string, 10)
      );
      
      if (!stats) {
        return res.status(404).json({ error: 'No data found' });
      }
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
}
