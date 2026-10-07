import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLocationById } from '../services/PlaceService';

const AMOUNT_LABELS = {
  1: 'Sparsamt',
  2: 'Måttligt',
  3: 'Rikligt',
};

export default function PlaceBanner() {
  const { id } = useLocalSearchParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLocationById(id)
      .then(setPlace)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !place) {
    return (
      <View style={styles.center}>
        <Text>Kunde inte hämta platsen.</Text>
      </View>
    );
  }

  const speciesNames = (place.location_species ?? [])
    .map((item) => item.Species?.name)
    .filter(Boolean);

  const amountLabel = AMOUNT_LABELS[place.amount];

  const dateText = place.created_at
    ? new Date(place.created_at).toLocaleDateString('sv-SE') // ger XXXX-XX-XX
    : null;

  const hasNotes = place.description && place.description.trim().length > 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Rubrik + ikoner */}
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {place.name}
        </Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              // TODO: redigera plats
            }}
          >
            <Ionicons name="create-outline" size={22} color="#000" />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#000" />
          </Pressable>
        </View>
      </View>

      {/* Vägbeskrivning (gör inget än) */}
      <Pressable
        style={styles.directionsButton}
        onPress={() => {
          // TODO: vägbeskrivning
        }}
      >
        <Ionicons name="navigate-outline" size={20} color="#fff" />
        <Text style={styles.directionsText}>Vägbeskrivning</Text>
      </Pressable>

      {/* Arter | Mängd | Datum */}
      <View style={styles.infoRow}>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>Arter</Text>
          {speciesNames.length > 0 ? (
            speciesNames.map((name) => (
              <Text key={name} style={styles.infoValue}>
                {name}
              </Text>
            ))
          ) : (
            <Text style={styles.infoValue}>–</Text>
          )}
        </View>

        <View style={[styles.infoColumn, styles.infoColumnDivider, styles.infoColumnMiddle]}>
          <Text style={styles.infoLabel}>Mängd</Text>
          <Text style={styles.infoValue}>{amountLabel ?? '–'}</Text>
        </View>

        <View style={[styles.infoColumn, styles.infoColumnDivider]}>
          <Text style={styles.infoLabel}>Datum</Text>
          <Text style={styles.infoValue}>{dateText ?? '–'}</Text>
        </View>
      </View>

      {/* Bild */}
      {place.picture_url ? (
        <Image source={{ uri: place.picture_url }} style={styles.picture} />
      ) : (
        <View style={[styles.picture, styles.picturePlaceholder]}>
          <Text style={styles.placeholderText}>Bild är inte tillgänglig</Text>
        </View>
      )}

      {/* Anteckningar */}
      <View style={styles.notes}>
        <Text style={styles.infoLabel}>Anteckningar</Text>
        <Text style={styles.notesText}>
          {hasNotes ? place.description : 'Anteckningar är inte tillgängliga'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 20, paddingBottom: 40 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: { flex: 1, fontSize: 20, fontFamily: 'SF Pro', fontWeight: '600', marginRight: 12 },
  headerButtons: { flexDirection: 'row', gap: 12 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: '#0C7A1A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 16,
  },
  directionsText: { color: '#fff', fontSize: 17, fontWeight: '500' },

  infoRow: { flexDirection: 'row', marginTop: 24 },
  infoColumn: { flex: 1, paddingHorizontal: 10 },
  infoColumnDivider: { borderLeftWidth: 1, borderLeftColor: '#ddd' },
  infoColumnMiddle: { flex: 0, width: 80 },
  infoLabel: { fontSize: 13, fontFamily: 'SF Pro', color: '#666', marginBottom: 8 },
  infoValue: { fontSize: 15, fontFamily: 'SF Pro', color: '#000' },

  picture: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    marginTop: 24,
  },

  picturePlaceholder: {
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: '#666', fontSize: 15 },

  notes: { marginTop: 24 },
  notesText: { fontSize: 15, fontFamily: 'SF Pro', lineHeight: 22, color: '#000' },
});