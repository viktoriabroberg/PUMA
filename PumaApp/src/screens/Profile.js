import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getMyProfile } from '../services/ProfileService';
import { logOutUser } from '../services/logOutService';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

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

  if (error || !profile) {
    return (
      <View style={styles.center}>
        <Text>Kunde inte hämta profilen.</Text>
        <Pressable style={styles.logOutButton} onPress={handleLogOut}>
          <Text style={styles.logOutText}>Logga ut</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ditt användarnamn:</Text>
      <Text style={styles.name}>{profile.name}</Text>

      <Pressable style={styles.logOutButton} onPress={handleLogOut}>
        <Text style={styles.logOutText}>Logga ut</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: 20, paddingTop: 80 },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  name: { fontSize: 20 },
  logOutButton: {
    alignSelf: 'flex-start',
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#0C7A1A',
  },
  logOutText: { color: '#fff', fontSize: 17, fontWeight: '500' },
});