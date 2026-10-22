import { useCallback, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import PlaceMarkers from '../components/PlaceMarkers';
import { Stack, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getMyLocations } from '../services/PlaceService'; // byt till denna när inloggningen fungerar

export default function MapMiddleView() {
  const { id, lat, lng } = useLocalSearchParams();
  const [places, setPlaces] = useState(null); // null = laddar
  const hasOpenedSheet = useRef(false);
  const mapRef = useRef(null);
  // Synligt kartområde, null tills användaren flyttat kartan
  const [region, setRegion] = useState(null);

  //Hämtas vid fokus så att en borttagen plats försvinner från kartan direkt
  useFocusEffect(
    useCallback(() => {
      getMyLocations()
        .then(setPlaces)
        .catch((err) => {
          console.log(err);
          setPlaces([]);
        });
    }, [])
  );

  // Öppna PlaceBanner en enda gång, först när kartan är redo.
  // Öppnas den direkt hinner kartan inte ritas förrän bannern stängs.
  const openSheet = () => {
    if (id && !hasOpenedSheet.current) {
      hasOpenedSheet.current = true;
      router.push(`/place/${id}`);
    }
  };

  const validPlaces = (places ?? []).filter(
    (place) => place.latitude != null && place.longitude != null
  );

  // Kartan centreras på den valda platsen (skickas med från MyPlaces), annars på Umeå
  const hasCoords = lat != null && lng != null;
  const initialRegion = {
    latitude: hasCoords ? Number(lat) : 63.820556,
    longitude: hasCoords ? Number(lng) : 20.303611,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      {/* Visar header med tillbaka-knapp ovanpå kartan */}
      <Stack.Screen
        options={{ headerShown: true, headerTransparent: true, title: '', headerBackButtonDisplayMode: 'minimal', }}
      />

      {/* Kartan visas direkt, pins läggs till när platserna hämtats */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onRegionChangeComplete={setRegion}
        onMapReady={openSheet}
      >
        <PlaceMarkers
          places={validPlaces}
          region={region ?? initialRegion}
          mapRef={mapRef}
          onPressPlace={(place) => router.push(`/place/${place.location_id}`)}
        />
      </MapView>

      {places === null && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
});
