import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireOperator, requireAdmin, requireDriver } from '../middleware/role.middleware';
import * as stationController from '../controllers/station.controller';

const router = Router();

// Driver: Get all verified stations
router.get('/', authenticate, requireDriver, stationController.getAllStations);

// Driver: Get station details
router.get('/:id', authenticate, requireDriver, stationController.getStationById);

// Operator: Create station
router.post('/', authenticate, requireOperator, stationController.createStation);

// Admin: Verify station
router.patch('/:id/verify', authenticate, requireAdmin, stationController.verifyStation);

export default router;
