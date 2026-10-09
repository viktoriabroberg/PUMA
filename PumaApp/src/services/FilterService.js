import { supabase } from '../utils/supabase';

export const CATEGORIES = [
  { key: 'svamp', label: 'Svamp', allLabel: 'Alla svampar', type: 'svamp' },
  { key: 'bar', label: 'Bär', allLabel: 'Alla bär', type: 'bär' },
];

export const DEFAULT_FILTER = { categories: [], speciesIds: [] };

const normalize = (value) => (value ?? '').toString().trim().toLowerCase();

export const getCategory = (key) => CATEGORIES.find((c) => c.key === key) ?? null;

const getCategoryKeyForType = (type) =>
  CATEGORIES.find((c) => normalize(c.type) === normalize(type))?.key ?? null;

// Hämtar profile_id för inloggad användare, eller null om ingen är inloggad
const getCurrentProfileId = async () => {
  /*const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }


  const { data: profile, error: profileError } = await supabase
    .from('profile')
    .select('profile_id')
    .eq('auth_user_id', user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  return profile.profile_id;
  	*/
	return 1;
};

export const getAllSpecies = async () => {
  const profileId = await getCurrentProfileId();

  let query = supabase
    .from('Species')
    .select('species_id, name, type, fk_species_profile')
    .order('name');

  query = profileId
    ? query.or(`fk_species_profile.is.null,fk_species_profile.eq.${profileId}`)
    : query.is('fk_species_profile', null);

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

// Grupperar arter per kategori
export const groupSpeciesByCategory = (species) => {
  const groups = Object.fromEntries(CATEGORIES.map((c) => [c.key, []]));

  (species ?? []).forEach((item) => {
    const key = getCategoryKeyForType(item.type);
    if (key) {
      groups[key].push(item);
    }
  });

  return groups;
};

export const isFilterActive = (filter) =>
  filter.categories.length > 0 || filter.speciesIds.length > 0;

export const isCategorySelected = (filter, categoryKey) =>
  filter.categories.includes(categoryKey);

export const isSpeciesSelected = (filter, speciesId) =>
  filter.speciesIds.includes(speciesId);

// Slår på/av "Alla <kategori>". Enskilda arter i kategorin avmarkeras när den slås på.
export const toggleCategory = (filter, categoryKey, categorySpecies = []) => {
  if (isCategorySelected(filter, categoryKey)) {
    return { ...filter, categories: filter.categories.filter((k) => k !== categoryKey) };
  }

  const ids = categorySpecies.map((s) => s.species_id);
  return {
    categories: [...filter.categories, categoryKey],
    speciesIds: filter.speciesIds.filter((id) => !ids.includes(id)),
  };
};

// Slår på/av en art. "Alla <kategori>" avmarkeras när en enskild art väljs.
export const toggleSpecies = (filter, speciesId, categoryKey) => {
  if (isSpeciesSelected(filter, speciesId)) {
    return { ...filter, speciesIds: filter.speciesIds.filter((id) => id !== speciesId) };
  }

  return {
    categories: filter.categories.filter((k) => k !== categoryKey),
    speciesIds: [...filter.speciesIds, speciesId],
  };
};

// En plats matchar bara om ALLA valda filter matchar:
// - varje vald art måste finnas på platsen
// - för varje vald kategori ("Alla bär") måste platsen ha minst en art av den typen
export const matchesFilter = (location, filter = DEFAULT_FILTER) => {
  if (!isFilterActive(filter)) {
    return true;
  }

  const species = (location.location_species ?? [])
    .map((item) => item.Species)
    .filter(Boolean);

  const hasAllSpecies = filter.speciesIds.every((id) =>
    species.some((s) => s.species_id === id)
  );

  const hasAllCategories = filter.categories.every((key) => {
    const type = normalize(getCategory(key)?.type);
    return species.some((s) => normalize(s.type) === type);
  });

  return hasAllSpecies && hasAllCategories;
};

export const filterLocations = (locations, filter = DEFAULT_FILTER) =>
  (locations ?? []).filter((location) => matchesFilter(location, filter));
