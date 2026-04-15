// Push notification routes for QuickFuel
import { Router } from 'express';
import { PushController } from '../controllers/push.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/test', authenticate, PushController.sendTestPush);

export default router;
