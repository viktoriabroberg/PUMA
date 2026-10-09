import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Host,
  DropdownMenu,
  DropdownMenuItem,
  Text,
  RNHostView,
} from '@expo/ui/jetpack-compose';
import {
  CATEGORIES,
  DEFAULT_FILTER,
  getAllSpecies,
  getCategory,
  groupSpeciesByCategory,
  isFilterActive,
  isCategorySelected,
  isSpeciesSelected,
  toggleCategory,
  toggleSpecies,
} from '../services/FilterService';

export default function FilterMenu({ value = DEFAULT_FILTER, onChange, species, color = '#000' }) {
  const [fetchedSpecies, setFetchedSpecies] = useState([]);
  const [expanded, setExpanded] = useState(false);
  // null = huvudmenyn, annars key för kategorin som visas
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    if (species) return;
    getAllSpecies().then(setFetchedSpecies).catch(console.log);
  }, [species]);

  const groups = groupSpeciesByCategory(species ?? fetchedSpecies);

  // Menyn stängs bara när man trycker utanför den
  const close = () => {
    setExpanded(false);
    setOpenCategory(null);
  };

  const hasSelectionIn = (c) =>
    isCategorySelected(value, c.key) ||
    groups[c.key].some((s) => isSpeciesSelected(value, s.species_id));

  const renderItem = (key, label, { checked = false, onClick }) => (
    <DropdownMenuItem key={key} onClick={onClick}>
      <DropdownMenuItem.Text>
        <Text>{label}</Text>
      </DropdownMenuItem.Text>
      {checked && (
        <DropdownMenuItem.LeadingIcon>
          <Text>✓</Text>
        </DropdownMenuItem.LeadingIcon>
      )}
    </DropdownMenuItem>
  );

  const category = getCategory(openCategory);

  const items = category
    ? [
        renderItem('back', `‹  ${category.label}`, { onClick: () => setOpenCategory(null) }),
        renderItem(`all-${category.key}`, category.allLabel, {
          checked: isCategorySelected(value, category.key),
          onClick: () => onChange?.(toggleCategory(value, category.key, groups[category.key])),
        }),
        ...groups[category.key].map((s) =>
          renderItem(s.species_id, s.name, {
            checked: isSpeciesSelected(value, s.species_id),
            onClick: () => onChange?.(toggleSpecies(value, s.species_id, category.key)),
          })
        ),
      ]
    : [
        renderItem('all', 'Alla', {
          checked: !isFilterActive(value),
          onClick: () => onChange?.(DEFAULT_FILTER),
        }),
        ...CATEGORIES.map((c) =>
          renderItem(c.key, `${c.label}  ›`, {
            checked: hasSelectionIn(c),
            onClick: () => setOpenCategory(c.key),
          })
        ),
      ];

  return (
    <Host matchContents>
      <DropdownMenu expanded={expanded} onDismissRequest={close} cornerRadius={16}>
        <DropdownMenu.Trigger>
          <RNHostView matchContents>
            <Pressable onPress={() => setExpanded(true)} hitSlop={10}>
              <Ionicons
                name={isFilterActive(value) ? 'filter' : 'filter-outline'}
                size={22}
                color={color}
              />
            </Pressable>
          </RNHostView>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>{items}</DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
