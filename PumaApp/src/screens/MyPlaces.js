import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, FlatList, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyLocations } from '../services/PlaceService';
//import { getAllLocationsTemp } from '../services/PlaceService';
import { getMyLocationsTemp } from '../services/PlaceService';

// OBS: justera sökvägen om din assets-mapp ligger någon annanstans
const AMOUNT_INDICATORS = {
  1: require('../../assets/amountIndicator/greenIndicator1.png'),
  2: require('../../assets/amountIndicator/greenIndicator2.png'),
  3: require('../../assets/amountIndicator/greenIndicator3.png'),
};

// Max två artnamn, sedan "+ antal över"
const formatSpecies = (location_species) => {
  const names = (location_species ?? [])
    .map((item) => item.Species?.name)
    .filter(Boolean);

  const shown = names.slice(0, 2).join(', ');
  const extra = names.length - 2;

  return extra > 0 ? `${shown}  +${extra}` : shown;
};

export default function MyPlaces() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    getMyLocationsTemp().then(setLocations).catch(console.log);
  }, []);

  const header = (
    <View>
      <Text style={styles.title}>Platser</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#000" />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök"
            placeholderTextColor="#000"
            // TODO: sökfunktion
          />
        </View>

        <Pressable
          style={styles.filterButton}
          onPress={() => {
            // TODO: filtrering
          }}
        >
          <Ionicons name="filter-outline" size={22} color="#000" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={locations}
      keyExtractor={(item) => String(item.location_id)}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          //onPress={() => router.push(`/place/${item.location_id}`)}
          onPress={() => router.push(`/place/MapMiddleView/${item.location_id}`)}
        >
          {item.picture_url ? (
            <Image source={{ uri: item.picture_url }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
          )}

          <View style={styles.cardContent}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardDate}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString('sv-SE')
                  : ''}
              </Text>
            </View>

            <View style={styles.cardBottomRow}>
              {AMOUNT_INDICATORS[item.amount] ? (
                <Image
                  source={AMOUNT_INDICATORS[item.amount]}
                  style={styles.cardIndicator}
                />
              ) : (
                <View />
              )}
              <Text style={styles.cardSpecies} numberOfLines={1}>
                {formatSpecies(item.location_species)}
              </Text>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#f4f4f6' },
  listContent: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 },

  title: { fontSize: 32, marginTop: 20, marginBottom: 16, marginLeft: 4 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 17 },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardImage: { width: 80, height: 80, borderRadius: 6 },
  cardImagePlaceholder: { backgroundColor: '#c9c9cc' },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 4,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: { flex: 1, fontSize: 16, marginRight: 8 },
  cardDate: { fontSize: 12 },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardIndicator: { width: 54, height: 14, resizeMode: 'contain' },
  cardSpecies: { flexShrink: 1, fontSize: 12, marginLeft: 8 },
});