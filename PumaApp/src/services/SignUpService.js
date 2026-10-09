import {supabase} from '../utils/supabase';
export const registerUser = async (email, password, username) => {
    const {data, error} = await.supabase.auth.signUp({
        email,
        password,
    });
    
    if (error) {
        throw error;
    }

    const user = data.user;

    if (!user){
        throw new Error ('kunde inte skapa en användare');
    }

    const {error: profileError} = await supabase
    .from('profile')
    .insert({
        auth_user_id: user.id,
        usernamne: username,
    });

    if (profileError){
        throw profileError;
    }

    return data;
};