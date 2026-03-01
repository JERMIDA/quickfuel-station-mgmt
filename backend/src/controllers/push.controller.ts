// Push notification controller for QuickFuel
import { Request, Response } from 'express';
import { PushService } from '../services/push.service';
import { ApiResponse } from '../types';

export class PushController {
  static async sendTestPush(req: Request, res: Response) {
    const { token, message, event } = req.body;
    if (!token || !message || !event) {
      return res.status(400).json({ success: false, message: 'Missing required fields' } as ApiResponse);
    }
    const result = await PushService.sendPush(token, message, event);
    if (result.status === 'sent') {
      return res.json({ success: true, data: result } as ApiResponse);
    }
    return res.status(500).json({ success: false, data: result, message: 'Failed to send push notification' } as ApiResponse);
  }
}
