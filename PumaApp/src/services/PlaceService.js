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
  // Supabase ger inget fel om RLS stoppar uppdateringen, då kommer bara en tom lista tillbaka
  if (!data || data.length === 0) {
    throw new Error('Platsen kunde inte uppdateras (saknas UPDATE-policy i Supabase?)');
  }
  return data;
};

// Uppdaterar vilka arter som är kopplade till en plats
export const updateLocationSpecies = async (locationId, speciesIds) => {
  const { data: current, error: currentError } = await supabase
    .from('location_species')
    .select('species_id')
    .eq('location_id', locationId);

  if (currentError) {
    throw currentError;
  }

  const currentIds = current.map((s) => s.species_id);
  const toRemove = currentIds.filter((id) => !speciesIds.includes(id));
  const toAdd = speciesIds.filter((id) => !currentIds.includes(id));

  if (toRemove.length > 0) {
    const { data: removed, error } = await supabase
      .from('location_species')
      .delete()
      .eq('location_id', locationId)
      .in('species_id', toRemove)
      .select();

    if (error) {
      throw error;
    }
    // Samma sak här, RLS kan stoppa borttagningen utan att ge något fel
    if (!removed || removed.length === 0) {
      throw new Error('Arterna kunde inte tas bort (saknas DELETE-policy i Supabase?)');
    }
  }

  if (toAdd.length > 0) {
    const { error } = await supabase
      .from('location_species')
      .insert(toAdd.map((species_id) => ({ location_id: locationId, species_id })));

    if (error) {
      throw error;
    }
  }
};

// Tar bort en plats och dess kopplade arter
export const deleteLocation = async (locationId) => {
  // Arterna kopplade till platsen måste tas bort först
  const { error: speciesError } = await supabase
    .from('location_species')
    .delete()
    .eq('location_id', locationId);

  if (speciesError) {
    throw speciesError;
  }

  const { data, error } = await supabase
    .from('location')
    .delete()
    .eq('location_id', locationId)
    .select();

  if (error) {
    throw error;
  }
  // RLS kan stoppa borttagningen utan att ge något fel
  if (!data || data.length === 0) {
    throw new Error('Platsen kunde inte tas bort (saknas DELETE-policy i Supabase?)');
  }
};
