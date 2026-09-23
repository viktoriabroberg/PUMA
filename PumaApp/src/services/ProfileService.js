import { supabase } from '../utils/supabase';

export const getProfileById = async (profileId) => {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};