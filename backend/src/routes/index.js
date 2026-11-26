import { Router } from 'express';
import * as vehicleCtrl from '../controllers/vehicleController.js';
import * as reportCtrl from '../controllers/reportController.js';
import * as settingsCtrl from '../controllers/settingsController.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, time: Date.now() }));

// State & Vehicles
router.get('/state', vehicleCtrl.getState);
router.post('/vehicles', vehicleCtrl.createVehicle);
router.delete('/vehicles/:id', vehicleCtrl.deleteVehicle);
router.post('/vehicles/reset-today', vehicleCtrl.resetToday);
router.post('/vehicles/:id/start', vehicleCtrl.start);
router.post('/vehicles/:id/extend', vehicleCtrl.extend);
router.post('/vehicles/:id/stop', vehicleCtrl.stop);
router.post('/vehicles/:id/confirm', vehicleCtrl.confirm);

// Reports & History
router.get('/reports', reportCtrl.getReport);
router.get('/history', reportCtrl.getHistory);

// Settings
router.patch('/settings', settingsCtrl.updateSettings);

export default router;
