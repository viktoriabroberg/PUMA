import {supabase} from  '../utils/supabase';
export const getMyLocations = async () => {
    const {
        data : {user},
        error: userError,
    } = await supabase.auth.getUser();


    if (userError){
        throw userError;
    }


const { data: profile, error: profileError} = await supabase
.from('profile')
.select('profile_id')
.eq('auth_user_id', user.id)
.single();


if(profileError) {
    throw profileError;
}
const {data, error} = await supabase
  .from('location')
    .select(`
      location_id,
      name,
      created_at,
      picture_url,
      amount,
      longitude,
      latitude,
      description,
      location_species (
        species_id,
        Species (
          species_id,
          name,
          type
        )
      )
    `)
    .eq('fk_location_profile', profile.profile_id);


  if (error) {
    throw error;
  }

  return data;
};

export const getLocationById = async (locationId) => {
  const { data, error } = await supabase
    .from('location')
    .select(`
      location_id,
      name,
      created_at,
      picture_url,
      amount,
      longitude,
      latitude,
      description,
      location_species (
        species_id,
        Species (
          species_id,
          name,
          type
        )
      )
    `)
    .eq('location_id', locationId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};


// funtkionen för uppdatera

export const updateLocation = async (locationId, locationName, amount, description, picture_url) => {
  const {data, error} = await supabase
  .from ('location')
  .update ({

    name: locationName,
    amount: amount,
    description: description,
    picture_url: picture_url

  })
  .eq('location_id', locationId)
  .select();

  if (error){

    throw error;
  }
  return data;
};