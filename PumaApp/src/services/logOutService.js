import {supabase} from '../utils/supabase'

export const logOutUser = async () => {
    const {error} = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
};