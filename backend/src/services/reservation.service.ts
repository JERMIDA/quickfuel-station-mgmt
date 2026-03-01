import { supabase } from '../config/supabase';
import type { Reservation, ReservationStatus, PaymentStatus } from '../types/index';
import { createError } from '../middleware/error.middleware';
import { generatePickupCode } from '../utils/generatePickupCode';
import { getStationById } from './station.service';
import { isFuelAvailable } from './fuel.service';

interface CreateReservationData {
  user_id: string;
  station_id: string;
  fuel_type_id: number;
  amount: number;
  time_slot: string;
}

export const createReservation = async (data: CreateReservationData): Promise<Reservation> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  // Check if station exists and is verified
  const station = await getStationById(data.station_id);
  if (!station) {
    throw createError('Station not found', 404);
  }
  if (!station.verified) {
    throw createError('Station is not verified', 400);
  }

  // Check if fuel is available
  const fuelAvailable = await isFuelAvailable(data.station_id, data.fuel_type_id);
  if (!fuelAvailable) {
    throw createError('Fuel not available', 400);
  }

  // Check for duplicate active reservation
  const { data: existing } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', data.user_id)
    .eq('station_id', data.station_id)
    .in('status', ['pending', 'approved'])
    .single();

  if (existing) {
    throw createError('You already have an active reservation at this station', 400);
  }

  // Generate unique pickup code
  const pickup_code = generatePickupCode();

  const { data: reservation, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['reservations']['Insert']>('reservations')
    .insert({
      user_id: data.user_id,
      station_id: data.station_id,
      fuel_type_id: data.fuel_type_id,
      amount: data.amount,
      time_slot: data.time_slot,
      status: 'pending',
      pickup_code,
      payment_status: 'unpaid',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating reservation:', error);
    throw createError('Failed to create reservation', 500);
  }

  return reservation as Reservation;
};

export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      station:stations(*),
      fuel_type:fuel_types(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting reservations:', error);
    throw createError('Failed to get reservations', 500);
  }

  return data as Reservation[];
};

export const getStationReservations = async (stationId: string): Promise<Reservation[]> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      station:stations(*),
      fuel_type:fuel_types(*)
    `)
    .eq('station_id', stationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting reservations:', error);
    throw createError('Failed to get reservations', 500);
  }

  return data as Reservation[];
};

export const updateReservationStatus = async (
  id: string,
  status: ReservationStatus
): Promise<Reservation | null> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['reservations']['Update']>('reservations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating reservation:', error);
    throw createError('Failed to update reservation', 500);
  }

  return data as Reservation;
};

export const getReservationById = async (id: string): Promise<Reservation | null> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      station:stations(*),
      fuel_type:fuel_types(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error getting reservation:', error);
    throw createError('Failed to get reservation', 500);
  }

  return data as Reservation;
};
