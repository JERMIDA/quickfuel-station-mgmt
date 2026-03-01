import { Router } from 'express';
import authRoutes from './auth.routes';
import stationRoutes from './station.routes';
import reservationRoutes from './reservation.routes';
import queueRoutes from './queue.routes';
import fuelRoutes from './fuel.routes';
import feedbackRoutes from './feedback.routes';


import paymentRoutes from './payment.routes';
import notificationRoutes from './notification.routes';
import pushRoutes from './push.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/stations', stationRoutes);
router.use('/reservations', reservationRoutes);
router.use('/queue', queueRoutes);
router.use('/fuel', fuelRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/admin', adminRoutes);

// Payment endpoints
router.use('/payments', paymentRoutes);

// Notification endpoints
router.use('/notifications', notificationRoutes);

// Push notification endpoints
router.use('/push', pushRoutes);

export default router;
