import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireOperator } from '../middleware/role.middleware';
import * as fuelController from '../controllers/fuel.controller';

const router = Router();

// Get all fuel types
router.get('/types', fuelController.getFuelTypes);

// Get station fuel
router.get('/station/:stationId', fuelController.getStationFuel);

export default router;
