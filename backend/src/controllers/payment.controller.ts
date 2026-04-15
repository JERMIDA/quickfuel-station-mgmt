// Payment controller for QuickFuel
import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { ApiResponse } from '../types';
import type { PaymentStatus } from '../types/payment';

export class PaymentController {
  static async initiatePayment(req: Request, res: Response) {
    // Validate input (reservation_id, amount, provider)
    const { reservation_id, amount, provider } = req.body;
    if (!reservation_id || !amount || !provider) {
      return res.status(400).json({ success: false, message: 'Missing required fields' } as ApiResponse);
    }
    // Create payment record (pending)
    const payment = await PaymentService.createPayment({ reservation_id, amount, provider, transaction_id: '', status: 'pending' });
    if (!payment) {
      return res.status(500).json({ success: false, message: 'Failed to create payment' } as ApiResponse);
    }
    // TODO: Integrate with Telebirr/Chapa API here
    // Return payment info (client should redirect to payment gateway)
    return res.json({ success: true, data: payment } as ApiResponse);
  }

  static async paymentWebhook(req: Request, res: Response) {
    // Handle webhook from payment provider
    // Parse provider, transaction_id, status, reservation_id from req.body
    const { provider, transaction_id, status, reservation_id } = req.body;
    if (!provider || !transaction_id || !status || !reservation_id) {
      return res.status(400).json({ success: false, message: 'Missing webhook fields' } as ApiResponse);
    }
    // Update payment status
    const updated = await PaymentService.updatePaymentStatusByReservation(
      reservation_id,
      status as PaymentStatus,
      transaction_id
    );
    if (!updated) {
      return res.status(500).json({ success: false, message: 'Failed to update payment status' } as ApiResponse);
    }
    return res.json({ success: true, message: 'Payment status updated' } as ApiResponse);
  }
}
