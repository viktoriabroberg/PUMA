import { supabase } from '../utils/supabase';

// Hämtar profilen för den inloggade användaren
export const getMyProfile = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error('Du måste vara inloggad');
  }
 
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();
 
  if (error) {
    throw error;
  }
 
  //return data;
  return { ...data, email: user.email };
};