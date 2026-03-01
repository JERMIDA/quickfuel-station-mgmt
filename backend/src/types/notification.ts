// Notification types for QuickFuel

export type NotificationType = 'sms' | 'push';
export type NotificationEvent =
  | 'reservation_created'
  | 'payment_success'
  | 'reminder'
  | 'queue_update';

export interface Notification {
  id?: string;
  type: NotificationType;
  event: NotificationEvent;
  recipient: string; // phone or push token
  message: string;
  sent_at?: string;
  status?: 'pending' | 'sent' | 'failed';
}
