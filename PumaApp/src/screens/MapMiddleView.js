import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { getMyLocationsTemp } from '../services/PlaceService';
//import { getMyLocations } from '../services/PlaceService'; // byt till denna när inloggningen fungerar

export default function MapMiddleView() {
  const { id } = useLocalSearchParams();
  const [places, setPlaces] = useState(null); // null = laddar
  const hasOpenedSheet = useRef(false);

  useEffect(() => {
    getMyLocationsTemp()
      .then(setPlaces)
      .catch((err) => {
        console.log(err);
        setPlaces([]);
      });
  }, []);

  // Öppna PlaceBanner för den valda platsen en enda gång när skärmen visas
  useEffect(() => {
    if (id && !hasOpenedSheet.current) {
      hasOpenedSheet.current = true;
      router.push(`/place/${id}`);
    }
  }, [id]);

  const validPlaces = (places ?? []).filter(
    (place) => place.latitude != null && place.longitude != null
  );

  // Kartan centreras på den valda platsen, annars på Umeå
  const focusedPlace = validPlaces.find(
    (place) => String(place.location_id) === String(id)
  );
  const initialRegion = {
    latitude: focusedPlace ? Number(focusedPlace.latitude) : 63.820556,
    longitude: focusedPlace ? Number(focusedPlace.longitude) : 20.303611,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      {/* Visar header med tillbaka-knapp ovanpå kartan */}
      <Stack.Screen
        options={{ headerShown: true, headerTransparent: true, title: '' }}
      />

      {places === null ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
          {validPlaces.map((place) => (
            <Marker
              key={place.location_id}
              coordinate={{
                latitude: Number(place.latitude),
                longitude: Number(place.longitude),
              }}
              pinColor="green"
              onPress={() => router.push(`/place/${place.location_id}`)}
            />
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});