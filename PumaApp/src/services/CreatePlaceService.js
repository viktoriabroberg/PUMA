import { getCurrentLocation } from './GpsService';
import { supabase } from '../utils/supabase';

// Hämtar profile_id för inloggad användare
async function getCurrentProfileId() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Du måste vara inloggad');

  const { data: profile, error: profileError } = await supabase
    .from('profile')
    .select('profile_id')
    .eq('auth_user_id', user.id)
    .single();
  if (profileError) throw profileError;

  return profile.profile_id;
}

//Funtion för att hämta arter till UI (gemensamma + användarens egna)
export async function getSpecies() {
  const profileId = await getCurrentProfileId();

  const { data, error } = await supabase
    .from('Species')
    .select('species_id, name, type, fk_species_profile')
    .or(`fk_species_profile.is.null,fk_species_profile.eq.${profileId}`)
    .order('name');
  if (error) throw error;
  return data;
}

// Skapar egna arter för användaren och returnerar deras species_id
async function insertNewSpecies(newSpecies, profileId) {
  if (newSpecies.length === 0) return [];

  const { data, error } = await supabase
    .from('Species')
    .insert(
      newSpecies.map((s) => ({
        name: s.name,
        type: s.type,
        fk_species_profile: profileId,
      }))
    )
    .select('species_id');
  if (error) throw error;

  return data.map((s) => s.species_id);
}

export async function createPlaceFunction({
  name,
  amount,
  description,
  picture_url,
  speciesIds = [],
  newSpecies = [],
}) {
  const location = await getCurrentLocation();
  if (!location) throw new Error('Kunde inte hämta position');

  const profileId = await getCurrentProfileId();

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
      fk_location_profile: profileId,
    })
    .select('location_id')
    .single();
  if (placeError) throw placeError;

  // Skapa eventuella egna arter
  const newSpeciesIds = await insertNewSpecies(newSpecies, profileId);

  // Koppla platsen till alla arter
  const allSpeciesIds = [...new Set([...speciesIds, ...newSpeciesIds])];
  if (allSpeciesIds.length > 0) {
    const { error: linkError } = await supabase
      .from('location_species')
      .insert(
        allSpeciesIds.map((species_id) => ({
          location_id: place.location_id,
          species_id,
        }))
      );
    if (linkError) throw linkError;
  }

  return place;
}
