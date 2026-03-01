import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireDriver, requireAdmin } from '../middleware/role.middleware';
import * as feedbackController from '../controllers/feedback.controller';

const router = Router();

// Driver: Create feedback
router.post('/', authenticate, requireDriver, feedbackController.createFeedback);

// Public: Get approved feedback for station
router.get('/station/:stationId', feedbackController.getFeedbackByStation);

export default router;
