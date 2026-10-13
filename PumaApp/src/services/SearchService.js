const normalize = (value) => (value ?? '').toString().trim().toLowerCase();

// En plats matchar om sökordet finns i platsens namn
export const matchesSearch = (location, query) => {
  const search = normalize(query);
  if (!search) {
    return true;
  }

  return normalize(location.name).includes(search);
};

export const searchLocations = (locations, query) =>
  (locations ?? []).filter((location) => matchesSearch(location, query));
