import { supabase } from '../config/supabase';
import type { Profile, Station, Reservation } from '../types/index';
import { createError } from '../middleware/error.middleware';
import type { UserRole } from '../types/index';

export const getDashboardStats = async (): Promise<{
  totalUsers: number;
  totalStations: number;
  totalReservations: number;
}> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const [usersRes, stationsRes, reservationsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('stations').select('id', { count: 'exact', head: true }),
    supabase.from('reservations').select('id', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers: usersRes.count || 0,
    totalStations: stationsRes.count || 0,
    totalReservations: reservationsRes.count || 0,
  };
};

export const getAllUsers = async (): Promise<Profile[]> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['profiles']['Row']>('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting users:', error);
    throw createError('Failed to get users', 500);
  }

  return data as Profile[];
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<Profile> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['profiles']['Update']>('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    throw createError('Failed to update user role', 500);
  }

  return data as Profile;
};

export const getStationByOperatorId = async (operatorId: string): Promise<Station | null> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .eq('operator_id', operatorId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error getting station:', error);
    throw createError('Failed to get station', 500);
  }

  return data as Station;
};
