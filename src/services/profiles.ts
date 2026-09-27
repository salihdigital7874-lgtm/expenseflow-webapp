import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';
import { getLocalProfile, saveLocalProfile } from './localStorageFallback';

export const getProfile = async (userId: string): Promise<Profile | null> => {
  if (userId.startsWith('demo')) {
    return getLocalProfile(userId);
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data as Profile;
  } catch (err) {
    console.warn('Supabase getProfile failed, using local profile:', err);
    return getLocalProfile(userId);
  }
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
  if (userId.startsWith('demo')) {
    return saveLocalProfile(userId, updates);
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (err) {
    console.warn('Supabase updateProfile failed, updating local profile:', err);
    return saveLocalProfile(userId, updates);
  }
};

