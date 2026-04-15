// Notification controller for QuickFuel
import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../types';

export class NotificationController {
  static async sendTestSMS(req: Request, res: Response) {
    const { recipient, message, event } = req.body;
    if (!recipient || !message || !event) {
      return res.status(400).json({ success: false, message: 'Missing required fields' } as ApiResponse);
    }
    const result = await NotificationService.sendSMS(recipient, message, event);
    if (result.status === 'sent') {
      return res.json({ success: true, data: result } as ApiResponse);
    }
    return res.status(500).json({ success: false, data: result, message: 'Failed to send SMS' } as ApiResponse);
  }
}
