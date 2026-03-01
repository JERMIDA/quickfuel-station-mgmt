import { supabase } from '../config/supabase';
import type { Station, StationFuel, FuelType } from '../types/index';
import { createError } from '../middleware/error.middleware';

interface CreateStationData {
  name: string;
  latitude: number;
  longitude: number;
  operator_id: string;
}

export const createStation = async (data: CreateStationData): Promise<Station> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data: station, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['stations']['Insert']>('stations')
    .insert({
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      operator_id: data.operator_id,
      verified: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating station:', error);
    throw createError('Failed to create station', 500);
  }

  // Create initial queue for the station
  await supabase.from<import('../types/database').Database['public']['Tables']['queues']['Insert']>('queues').insert({
    station_id: station.id,
    queue_length: 0,
  });

  return station as Station;
};

export const getVerifiedStations = async (): Promise<Station[]> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['stations']['Row']>('stations')
    .select('*')
    .eq('verified', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting stations:', error);
    throw createError('Failed to get stations', 500);
  }

  return data as Station[];
};

export const getStationById = async (id: string): Promise<Station | null> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['stations']['Row']>('stations')
    .select('*')
    .eq('id', id)
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

export const getStationWithDetails = async (id: string): Promise<(Station & { fuel_types: StationFuel[] }) | null> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const station = await getStationById(id);
  if (!station) return null;

  // Get fuel types for the station
  const { data: fuelData } = await supabase
    .from<import('../types/database').Database['public']['Tables']['station_fuel']['Row']>('station_fuel')
    .select(`
      *,
      fuel_type:fuel_types(*)
    `)
    .eq('station_id', id);

  // Get queue info
  const { data: queueData } = await supabase
    .from<import('../types/database').Database['public']['Tables']['queues']['Row']>('queues')
    .select('*')
    .eq('station_id', id)
    .single();

  return {
    ...station,
    fuel_types: fuelData || [],
    queue: queueData,
  } as Station & { fuel_types: StationFuel[] };
};

export const verifyStation = async (id: string): Promise<Station | null> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['stations']['Update']>('stations')
    .update({ verified: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error verifying station:', error);
    throw createError('Failed to verify station', 500);
  }

  return data as Station;
};
