import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getMyProfile } from '../services/ProfileService';
import { logOutUser } from '../services/logOutService';
import { COLORS } from '../constants/colors';

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
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.email}>Kunde inte hämta profilen.</Text>
        </View>
        <Pressable style={styles.button} onPress={handleLogOut}>
          <Text style={styles.buttonText}>Logga ut</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <Pressable style={styles.button} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Logga ut</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    justifyContent: 'space-between', // namn och e-post uppe, knappen längst ner
  },
  top: {},
  title: { fontSize: 32, marginTop: 20, marginBottom: 16, marginLeft: 4 },
  email: { fontSize: 16, marginLeft: 4 },
  button: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 500,
  },
  buttonText: { color: '#fff', fontSize: 17 },
});
