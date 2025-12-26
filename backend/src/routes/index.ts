import { Router } from 'express';
import { ReadingController } from '../controllers/reading.controller';
import { DeviceController } from '../controllers/device.controller';
import { AlertController } from '../controllers/alert.controller';

const router = Router();

// Controllers
const readingController = new ReadingController();
const deviceController = new DeviceController();
const alertController = new AlertController();

// Reading routes
router.get('/readings/latest', (req, res) => readingController.getLatest(req, res));
router.get('/readings/device/:deviceId', (req, res) => readingController.getDeviceHistory(req, res));
router.get('/readings/device/:deviceId/stats', (req, res) => readingController.getStatistics(req, res));
router.post('/readings', (req, res) => readingController.createReading(req, res));

// Device routes
router.get('/devices', (req, res) => deviceController.getAll(req, res));
router.get('/devices/check-offline', (req, res) => deviceController.checkOffline(req, res));
router.get('/devices/:id', (req, res) => deviceController.getById(req, res));
router.get('/devices/:id/status', (req, res) => deviceController.getStatus(req, res));
router.post('/devices', (req, res) => deviceController.create(req, res));
router.put('/devices/:id', (req, res) => deviceController.update(req, res));
router.delete('/devices/:id', (req, res) => deviceController.delete(req, res));

// Alert routes
router.get('/alerts', (req, res) => alertController.getActive(req, res));
router.get('/alerts/device/:deviceId', (req, res) => alertController.getDeviceAlerts(req, res));
router.get('/alerts/statistics', (req, res) => alertController.getStatistics(req, res));
router.put('/alerts/:id/resolve', (req, res) => alertController.resolve(req, res));
router.put('/alerts/device/:deviceId/resolve-all', (req, res) => alertController.resolveAll(req, res));

export default router;
