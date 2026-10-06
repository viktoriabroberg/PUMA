import { supabase } from '../utils/supabase';

export const ShowPlacesOnMap = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
  throw new Error('Ingen användare är inloggad');
}

  const { data: profile, error: profileError } = await supabase
    .from('profile')
    .select('profile_id')
    .eq('auth_user_id', user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  const { data, error } = await supabase
    .from('location')
    .select('*')
    .eq('fk_location_profile', profile.profile_id);

  if (error) {
    throw error;
  }

  return data;
};