import { supabase } from '../config/supabase';
import type { Profile, UserRole } from '../types/index';
import { createError } from '../middleware/error.middleware';

export const createProfile = async (
  userId: string,
  fullName: string,
  phone: string,
  role: UserRole
): Promise<Profile> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  // Check if profile already exists
  const { data: existing } = await supabase
    .from<import('../types/database').Database['public']['Tables']['profiles']['Row']>('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (existing) {
    throw createError('Profile already exists', 400);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['profiles']['Insert']>('profiles')
    .insert({
      id: userId,
      full_name: fullName,
      phone,
      role,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw createError('Failed to create profile', 500);
  }

  return data as Profile;
};

export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['profiles']['Row']>('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No profile found
    }
    console.error('Error getting profile:', error);
    throw createError('Failed to get profile', 500);
  }

  return data as Profile;
};

export const updateProfile = async (
  userId: string,
  updates: { full_name?: string; phone?: string }
): Promise<Profile> => {
  if (!supabase) {
    throw createError('Database not configured', 500);
  }

  const { data, error } = await supabase
    .from<import('../types/database').Database['public']['Tables']['profiles']['Update']>('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw createError('Failed to update profile', 500);
  }

  return data as Profile;
};

export const getProfileById = async (id: string): Promise<Profile | null> => {
  return getProfileByUserId(id);
};
