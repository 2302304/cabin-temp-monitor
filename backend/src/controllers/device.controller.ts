import { Request, Response } from 'express';
import { DeviceService } from '../services/device.service';

const deviceService = new DeviceService();

export class DeviceController {
  // GET /api/devices - Hae kaikki laitteet
  async getAll(req: Request, res: Response) {
    try {
      const devices = await deviceService.getAllDevices();
      res.json(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  }
  
  // GET /api/devices/:id - Hae laite
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const device = await deviceService.getDeviceById(id);
      res.json(device);
    } catch (error: any) {
      console.error('Error fetching device:', error);
      if (error.message === 'Device not found') {
        return res.status(404).json({ error: 'Device not found' });
      }
      res.status(500).json({ error: 'Failed to fetch device' });
    }
  }
  
  // GET /api/devices/:id/status - Hae laitteen tila
  async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const status = await deviceService.getDeviceStatus(id);
      res.json(status);
    } catch (error: any) {
      console.error('Error fetching device status:', error);
      if (error.message === 'Device not found') {
        return res.status(404).json({ error: 'Device not found' });
      }
      res.status(500).json({ error: 'Failed to fetch device status' });
    }
  }
  
  // POST /api/devices - Luo uusi laite
  async create(req: Request, res: Response) {
    try {
      const { name, location, deviceType } = req.body;
      
      if (!name || !location) {
        return res.status(400).json({ 
          error: 'name and location are required' 
        });
      }
      
      const device = await deviceService.createDevice(name, location, deviceType);
      res.status(201).json(device);
    } catch (error) {
      console.error('Error creating device:', error);
      res.status(500).json({ error: 'Failed to create device' });
    }
  }
  
  // PUT /api/devices/:id - Päivitä laite
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const device = await deviceService.updateDevice(id, updates);
      res.json(device);
    } catch (error) {
      console.error('Error updating device:', error);
      res.status(500).json({ error: 'Failed to update device' });
    }
  }
  
  // DELETE /api/devices/:id - Poista laite
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await deviceService.deleteDevice(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting device:', error);
      res.status(500).json({ error: 'Failed to delete device' });
    }
  }
  
  // GET /api/devices/check-offline - Tarkista offline-laitteet
  async checkOffline(req: Request, res: Response) {
    try {
      const offlineDevices = await deviceService.checkOfflineDevices();
      res.json(offlineDevices);
    } catch (error) {
      console.error('Error checking offline devices:', error);
      res.status(500).json({ error: 'Failed to check offline devices' });
    }
  }
}
