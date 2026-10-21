import { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { getMyProfile } from '../services/ProfileService';
import { getMyLocations } from '../services/PlaceService';
import MonthlyPlacesChart, { countPlacesPerMonth } from '../components/MonthlyPlacesChart';
import { logOutUser } from '../services/logOutService';
import { COLORS } from '../constants/colors';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [places, setPlaces] = useState(null);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // Hämtar platserna varje gång sidan visas så att statistiken är aktuell
  useFocusEffect(
    useCallback(() => {
      getMyLocations()
        .then(setPlaces)
        .catch(() => setPlaces(null));
    }, [])
  );

  async function handleLogOut() {
    try {
      await logOutUser();
      // Skicka användaren till startsidan (inloggningen)
      router.replace('/');
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
      {/* Användarnamnet visas som stor rubrik, samma stil som Platser och Identifiera */}
      <Stack.Screen options={{ title: profile?.name ?? '' }} />

      <Text style={styles.email}>
        {error || !profile ? 'Kunde inte hämta profilen.' : profile.email}
      </Text>

      {places && (
        <View style={styles.stats}>
          <View style={styles.card}>
            <Text style={styles.statNumber}>{places.length}</Text>
            <Text style={styles.statLabel}>
              {places.length === 1 ? 'sparad plats' : 'sparade platser'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.chartTitle}>Antal sparade platser per månad</Text>
            <MonthlyPlacesChart data={countPlacesPerMonth(places)} />
          </View>
        </View>
      )}

      <Pressable style={styles.button} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Logga ut</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 40 },
  // Samma stil som underrubriken på Identifiera
  email: { fontSize: 15, color: COLORS.secondaryLabel, marginLeft: 4 },
  stats: { marginTop: 28, gap: 20 },
  // Samma kort och skugga som i Identify.js
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, boxShadow: '0px 0px 32px 0px rgba(0, 0, 0, 0.2)' },
  statNumber: { fontSize: 34, fontWeight: '700', color: COLORS.label },
  statLabel: { fontSize: 15, color: COLORS.secondaryLabel },
  chartTitle: { fontSize: 17, fontWeight: '600', color: COLORS.label, marginBottom: 4 },
  button: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    marginHorizontal: 20,
    marginTop: 28,
  },
  buttonText: { color: '#fff', fontSize: 17 },
});
