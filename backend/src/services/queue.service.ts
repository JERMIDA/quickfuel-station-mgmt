import { supabase } from '../config/supabase';
import type { Queue } from '../types/index';
import { createError } from '../middleware/error.middleware';

export const getQueueByStationId = async (stationId: string): Promise<Queue | null> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['queues']['Row']>('queues')
    .select('*')
    .eq('station_id', stationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error getting queue:', error);
    throw createError('Failed to get queue', 500);
  }

  return data as Queue;
};

export const updateQueueLength = async (
  stationId: string,
  queueLength: number
): Promise<Queue | null> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['queues']['Update']>('queues')
    .update({
      queue_length: queueLength,
      updated_at: new Date().toISOString(),
    })
    .eq('station_id', stationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating queue:', error);
    throw createError('Failed to update queue', 500);
  }

  return data as Queue;
};
