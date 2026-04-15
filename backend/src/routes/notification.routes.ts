// Notification routes for QuickFuel
import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/sms/test', authenticate, NotificationController.sendTestSMS);

export default router;
