import {supabase} from '../utils/supabase';

export const deleteLocation = async (location) => {
    const {data, error} = await supabase
    .from ('location')
    .delete ()
    .eq('location_id', location)
    .select();

    if(error){
        throw error;
    }

    return data;
};
