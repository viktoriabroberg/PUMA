import { getCurrentLocation } from './GpsService';
import { supabase } from '../utils/supabase';

const TEST_PROFILE_ID = 1; // TEST: hårdkodad användare
//Funtion för att hämta arter till UI
export async function getSpecies(){
  const { data, error } = await supabase
    .from('Species')
    .select('species_id, name, type, fk_species_profile')
    .or(`fk_species_profile.is.null,fk_species_profile.eq.${TEST_PROFILE_ID}`)
    .order('name');
  if (error) throw error;
  return data;
}
/**export async function insertNewSpecies(name, type){

    const { data: newSpecies, error: newSpecisError} = await supabase
    .from('Species')
    .insert({
        fk_location_profile: TEST_PROFILE_ID,
        name,
        type
    })
    if(newSpecisError) throw newSpecisError;

}*/

export async function createPlaceFunction({
  name,
  amount,
  description,
  picture_url,
  type,
  species,
}) {
  const location = await getCurrentLocation();
  if (!location) throw new Error('Kunde inte hämta position');


    const { data: newSpecies, error: newSpecisError} = await supabase
    .from('Species')
    .insert({
        fk_location_profile: TEST_PROFILE_ID,
        name,
        type
    })
    if(newSpecisError) throw newSpecisError;

  // Skapa platsen
  const { data: place, error: placeError } = await supabase
    .from('location')
    .insert({
      name,
      amount,
      description,
      picture_url,
      latitude: location.latitude,
      longitude: location.longitude,
      fk_location_profile: TEST_PROFILE_ID,
    })
    .select('location_id')
    .single();
  if (placeError) throw placeError;

  // Koppla platsen till arten
  const { error: linkError } = await supabase
    .from('location_species')
    .insert({ location_id: place.location_id, species_id: speciesRow.species_id });
  if (linkError) throw linkError;

  return place;
}


   
