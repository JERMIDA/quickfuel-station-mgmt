import { supabase } from '../config/supabase';
import type { Feedback } from '../types/index';
import { createError } from '../middleware/error.middleware';

interface CreateFeedbackData {
  user_id: string;
  station_id: string;
  rating: number;
  comment: string;
}

export const createFeedback = async (data: CreateFeedbackData): Promise<Feedback> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data: feedback, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['feedback']['Insert']>('feedback')
    .insert({
      user_id: data.user_id,
      station_id: data.station_id,
      rating: data.rating,
      comment: data.comment,
      approved: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating feedback:', error);
    throw createError('Failed to create feedback', 500);
  }

  return feedback as Feedback;
};

export const getApprovedFeedbackByStation = async (stationId: string): Promise<Feedback[]> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from('feedback')
    .select(`
      *,
      user:profiles(*)
    `)
    .eq('station_id', stationId)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting feedback:', error);
    throw createError('Failed to get feedback', 500);
  }

  return data as Feedback[];
};
