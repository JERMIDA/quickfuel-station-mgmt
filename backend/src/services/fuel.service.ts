import { supabase } from '../config/supabase';
import type { StationFuel, FuelType } from '../types/index';
import { createError } from '../middleware/error.middleware';

export const getFuelTypes = async (): Promise<FuelType[]> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<'fuel_types', import('../types/database').Database['public']['Tables']['fuel_types']['Row']>('fuel_types')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error getting fuel types:', error);
    throw createError('Failed to get fuel types', 500);
  }

  return data as FuelType[];
};

export const getStationFuel = async (stationId: string): Promise<StationFuel[]> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['station_fuel']['Row']>('station_fuel')
    .select(`
      *,
      fuel_type:fuel_types(*)
    `)
    .eq('station_id', stationId);

  if (error) {
    console.error('Error getting station fuel:', error);
    throw createError('Failed to get station fuel', 500);
  }

  return data as StationFuel[];
};

export const isFuelAvailable = async (stationId: string, fuelTypeId: number): Promise<boolean> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['station_fuel']['Row']>('station_fuel')
    .select('available')
    .eq('station_id', stationId)
    .eq('fuel_type_id', fuelTypeId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.available;
};

export const updateFuelAvailability = async (
  id: string,
  available: boolean
): Promise<StationFuel> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['station_fuel']['Update']>('station_fuel')
    .update({ 
      available,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating fuel:', error);
    throw createError('Failed to update fuel', 500);
  }

  return data as StationFuel;
};

export const updateFuelPrice = async (
  id: string,
  pricePerLiter: number
): Promise<StationFuel> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['station_fuel']['Update']>('station_fuel')
    .update({
      price_per_liter: pricePerLiter,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating fuel price:', error);
    throw createError('Failed to update fuel price', 500);
  }

  return data as StationFuel;
};
