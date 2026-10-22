import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Host, Menu, RNHostView, Section, Toggle } from '@expo/ui/swift-ui';
import { menuActionDismissBehavior } from '@expo/ui/swift-ui/modifiers';
import {
  CATEGORIES,
  DEFAULT_FILTER,
  getAllSpecies,
  groupSpeciesByCategory,
  isFilterActive,
  isCategorySelected,
  isSpeciesSelected,
  toggleCategory,
  toggleSpecies,
} from '../services/FilterService';

const KEEP_OPEN = [menuActionDismissBehavior('disabled')];

export default function FilterMenu({ value = DEFAULT_FILTER, onChange, species, color = '#000' }) {
  const [fetchedSpecies, setFetchedSpecies] = useState([]);

  useEffect(() => {
    if (species) return;
    getAllSpecies().then(setFetchedSpecies).catch(console.log);
  }, [species]);

  const groups = groupSpeciesByCategory(species ?? fetchedSpecies);

  const hasSelectionIn = (category) =>
    isCategorySelected(value, category.key) ||
    groups[category.key].some((s) => isSpeciesSelected(value, s.species_id));


  const layoutKey = (category) => (hasSelectionIn(category) ? 'checked' : 'unchecked');

  return (
    <Host matchContents>
      <Menu
        label={
          // Ikonen ritas i RN så att SwiftUI:s accentfärg (grön) inte färgar över den
          <RNHostView matchContents>
            <View style={styles.trigger} accessibilityLabel="Filter">
              <Ionicons name="filter" size={22} color={color} />
            </View>
          </RNHostView>
        }
      >
        <Section title="Filter">
          <Toggle
            label="Alla"
            isOn={!isFilterActive(value)}
            onIsOnChange={() => onChange?.(DEFAULT_FILTER)}
            modifiers={KEEP_OPEN}
          />
        </Section>

        <Section>
          {CATEGORIES.map((category) => (
            // Antalet arter i nyckeln gör att undermenyn byggs om när arterna har hämtats.
            // Annars kan SwiftUI visa en tom undermeny, t.ex. inne i listhuvudet i MyPlaces.
            <Menu
              key={`${category.key}-${groups[category.key].length}`}
              label={category.label}
              systemImage={hasSelectionIn(category) ? 'checkmark' : undefined}
            >
              <Toggle
                key={`all-${layoutKey(category)}`}
                label={category.allLabel}
                isOn={isCategorySelected(value, category.key)}
                onIsOnChange={() =>
                  onChange?.(toggleCategory(value, category.key, groups[category.key]))
                }
                modifiers={KEEP_OPEN}
              />
              {groups[category.key].map((s) => (
                <Toggle
                  key={`${s.species_id}-${layoutKey(category)}`}
                  label={s.name}
                  isOn={isSpeciesSelected(value, s.species_id)}
                  onIsOnChange={() => onChange?.(toggleSpecies(value, s.species_id, category.key))}
                  modifiers={KEEP_OPEN}
                />
              ))}
            </Menu>
          ))}
        </Section>
      </Menu>
    </Host>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
