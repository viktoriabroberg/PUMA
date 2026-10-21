import { getCurrentLocation } from './GpsService';
import { supabase } from '../utils/supabase';

// Namnet på din bucket i Supabase Storage
const PICTURE_BUCKET = 'place-images';

// Cache så att profile_id bara hämtas en gång per inloggad användare
let cachedProfile = { userId: null, profileId: null };

// Hämtar profile_id för inloggad användare
export async function getCurrentProfileId() {
  // getSession läser lokalt sparad session, till skillnad från getUser som gör ett nätverksanrop
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const user = session?.user;
  if (!user) throw new Error('Du måste vara inloggad');

  if (cachedProfile.userId === user.id) return cachedProfile.profileId;

  const { data: profile, error: profileError } = await supabase
    .from('profile')
    .select('profile_id')
    .eq('auth_user_id', user.id)
    .single();
  if (profileError) throw profileError;

  cachedProfile = { userId: user.id, profileId: profile.profile_id };
  return profile.profile_id;
}

// Laddar upp en bild från telefonen till Supabase Storage och returnerar bildens publika URL
export async function uploadPicture(uri, profileId) {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const filePath = `${profileId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from(PICTURE_BUCKET)
    .upload(filePath, arrayBuffer, { contentType: 'image/jpeg' });
  if (error) throw error;

  const { data } = supabase.storage.from(PICTURE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

//Funtion för att hämta arter till UI (gemensamma + användarens egna)
export async function getSpecies() {
  const profileId = await getCurrentProfileId();

  const { data, error } = await supabase
    .from('Species')
    .select('species_id, name, type, fk_species_profile')
    .or(`fk_species_profile.is.null,fk_species_profile.eq.${profileId}`)
    .order('species_id');
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

export async function addSpeciesFunction(name, type) {
  const profileId = await getCurrentProfileId();
  const [speciesId] = await insertNewSpecies([{ name, type }], profileId);
  return speciesId;
}

export async function createPlaceFunction({
  name,
  amount,
  description,
  pictureUri = null,
  speciesIds = [],
}) {
  const location = await getCurrentLocation();
  if (!location) throw new Error('Kunde inte hämta position');

  const profileId = await getCurrentProfileId();

  // Ladda upp bilden först (om det finns någon), så att vi får en URL att spara
  const picture_url = pictureUri
    ? await uploadPicture(pictureUri, profileId)
    : null;

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
  //const newSpeciesIds = await insertNewSpecies(newSpecies, profileId);

  // Koppla platsen till alla arter
  const allSpeciesIds = [...new Set([...speciesIds])];
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