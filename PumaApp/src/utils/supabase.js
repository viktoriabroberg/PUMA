import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ggxmsvvrgdgpojptpnui.supabase.co";
const supabaseAnonKey = "sb_publishable_DOFmzh-_LgbFQOe5zK3kUQ_7GlOXkUd";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});