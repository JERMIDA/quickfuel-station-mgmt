// Database types for Supabase
// These types mirror the database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          role: 'driver' | 'operator' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone: string;
          role: 'driver' | 'operator' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          role?: 'driver' | 'operator' | 'admin';
          created_at?: string;
        };
      };
      stations: {
        Row: {
          id: string;
          name: string;
          latitude: number;
          longitude: number;
          operator_id: string;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          latitude: number;
          longitude: number;
          operator_id: string;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          latitude?: number;
          longitude?: number;
          operator_id?: string;
          verified?: boolean;
          created_at?: string;
        };
      };
      fuel_types: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
      };
      station_fuel: {
        Row: {
          id: string;
          station_id: string;
          fuel_type_id: number;
          available: boolean;
          price_per_liter: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          station_id: string;
          fuel_type_id: number;
          available?: boolean;
          price_per_liter: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          station_id?: string;
          fuel_type_id?: number;
          available?: boolean;
          price_per_liter?: number;
          updated_at?: string;
        };
      };
      queues: {
        Row: {
          id: string;
          station_id: string;
          queue_length: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          station_id: string;
          queue_length?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          station_id?: string;
          queue_length?: number;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          user_id: string;
          station_id: string;
          fuel_type_id: number;
          amount: number;
          time_slot: string;
          status: 'pending' | 'approved' | 'rejected' | 'expired';
          pickup_code: string;
          payment_status: 'paid' | 'unpaid';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          station_id: string;
          fuel_type_id: number;
          amount: number;
          time_slot: string;
          status?: 'pending' | 'approved' | 'rejected' | 'expired';
          pickup_code: string;
          payment_status?: 'paid' | 'unpaid';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          station_id?: string;
          fuel_type_id?: number;
          amount?: number;
          time_slot?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'expired';
          pickup_code?: string;
          payment_status?: 'paid' | 'unpaid';
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          reservation_id: string;
          amount: number;
          provider: 'telebirr' | 'chapa';
          transaction_id: string;
          status: 'pending' | 'success' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          amount: number;
          provider: 'telebirr' | 'chapa';
          transaction_id: string;
          status?: 'pending' | 'success' | 'failed';
          created_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          amount?: number;
          provider?: 'telebirr' | 'chapa';
          transaction_id?: string;
          status?: 'pending' | 'success' | 'failed';
          created_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          station_id: string;
          rating: number;
          comment: string;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          station_id: string;
          rating: number;
          comment: string;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          station_id?: string;
          rating?: number;
          comment?: string;
          approved?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
