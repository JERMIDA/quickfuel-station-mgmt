// User roles
export type UserRole = 'driver' | 'operator' | 'admin';

// Profile types
export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

// Station types
export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  operator_id: string;
  verified: boolean;
  created_at: string;
}

// Fuel types
export interface FuelType {
  id: number;
  name: string;
}

// Station fuel types
export interface StationFuel {
  id: string;
  station_id: string;
  fuel_type_id: number;
  available: boolean;
  price_per_liter: number;
  updated_at: string;
  fuel_type?: FuelType;
}

// Queue types
export interface Queue {
  id: string;
  station_id: string;
  queue_length: number;
  updated_at: string;
}

// Reservation types
export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type PaymentStatus = 'paid' | 'unpaid';

export interface Reservation {
  id: string;
  user_id: string;
  station_id: string;
  fuel_type_id: number;
  amount: number;
  time_slot: string;
  status: ReservationStatus;
  pickup_code: string;
  payment_status: PaymentStatus;
  created_at: string;
  station?: Station;
  fuel_type?: FuelType;
}

// Feedback types
export interface Feedback {
  id: string;
  user_id: string;
  station_id: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
  user?: Profile;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Request user type
export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}

// Database error type
export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
}

// Re-export database types
export type { Database } from './database.js';
