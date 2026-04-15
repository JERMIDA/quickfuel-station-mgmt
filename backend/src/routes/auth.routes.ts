import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Profile routes
router.post('/profiles', authenticate, authController.createProfile);
router.get('/profiles/me', authenticate, authController.getMyProfile);
router.put('/profiles/me', authenticate, authController.updateMyProfile);
router.get('/profiles/:id', authenticate, authController.getProfileById);

export default router;
