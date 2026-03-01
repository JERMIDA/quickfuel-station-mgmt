import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireOperator, requireDriver } from '../middleware/role.middleware';
import * as queueController from '../controllers/queue.controller';

const router = Router();

// Operator: Update queue length
router.patch('/:stationId', authenticate, requireOperator, queueController.updateQueue);

// Driver: Get queue info
router.get('/:stationId', queueController.getQueueByStation);

export default router;
