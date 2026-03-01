// Payment routes for QuickFuel
import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/initiate', authenticate, PaymentController.initiatePayment);
router.post('/webhook', PaymentController.paymentWebhook);

export default router;
