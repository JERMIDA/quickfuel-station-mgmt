// Payment types for QuickFuel

export type PaymentProvider = 'telebirr' | 'chapa';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Payment {
  id: string;
  reservation_id: string;
  amount: number;
  provider: PaymentProvider;
  transaction_id: string;
  status: PaymentStatus;
  created_at: string;
}
