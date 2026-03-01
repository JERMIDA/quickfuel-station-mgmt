// Push notification service for QuickFuel (Expo)
import fetch from 'node-fetch';
import { Notification, NotificationEvent } from '../types/notification';

export class PushService {
  static async sendPush(token: string, message: string, event: NotificationEvent): Promise<Notification> {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          sound: 'default',
          body: message,
          data: { event },
        }),
      });
      const result = await response.json();
      if (result.data && result.data.status === 'ok') {
        return {
          type: 'push',
          event,
          recipient: token,
          message,
          sent_at: new Date().toISOString(),
          status: 'sent',
        };
      }
      return {
        type: 'push',
        event,
        recipient: token,
        message,
        sent_at: new Date().toISOString(),
        status: 'failed',
      };
    } catch (error) {
      return {
        type: 'push',
        event,
        recipient: token,
        message,
        sent_at: new Date().toISOString(),
        status: 'failed',
      };
    }
  }
}
