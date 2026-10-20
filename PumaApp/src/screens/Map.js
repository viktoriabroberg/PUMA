import React, { useCallback, useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Host, Button } from '@expo/ui/swift-ui';
import {
  buttonStyle,
  controlSize,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { useRouter, useFocusEffect } from 'expo-router';
import { getCurrentLocation } from '../services/GpsService';
import { watchLocation } from '../services/GpsService';
import { getMyLocations } from '../services/PlaceService';
import { DEFAULT_FILTER, filterLocations } from '../services/FilterService';
import { searchLocations } from '../services/SearchService';
import FilterMenu from '../components/FilterMenu';
import { COLORS } from '../constants/colors';

const BANNER_HEIGHT_RATIO = 0.4;
const FOCUS_DELTA = 0.01;

export default function Map() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const hasCentered = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Hämta användarens platser varje gång skärmen visas,
  useFocusEffect(
    useCallback(() => {
      getMyLocations().then(setPlaces).catch(console.log);
    }, [])
  );

  useEffect(() => {
    let subscription;
    let cancelled = false;
    async function trackLockation() {
      //Hämta plats en gång
      const currentLocation = await getCurrentLocation();
      if (cancelled) return;
      if (currentLocation) {
        setLocation(currentLocation);
      }

      //Prenumerera på aktuell position för att uppdatera om användaren rör sig
      subscription = await watchLocation((newLocation) => {
        setLocation(newLocation);
      });
      if (cancelled) subscription?.remove();
    }

    trackLockation();

    //Stoppa GPS-bevakningen när komponenten avmonteras
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  const centerOnUser = () => {
    if (!location) return;
    mapRef.current?.animateToRegion(
      {
        ...location,
        latitudeDelta: FOCUS_DELTA,
        longitudeDelta: FOCUS_DELTA,
      },
      500
    );
  };

  // Centrera kartan runt användaren en gång, först när både kartan är redo och
  // positionen finns. Annars ignoreras animeringen om platsen hämtas innan kartan laddats.
  useEffect(() => {
    if (!mapReady || !location || hasCentered.current) return;
    hasCentered.current = true;
    centerOnUser();
  }, [mapReady, location]);

  // Endast pins vars arter matchar filtret visas
  const visiblePlaces = filterLocations(places, filter).filter(
    (place) => place.latitude != null && place.longitude != null
  );

  // Förslag visas medan man skriver i sökfältet
  const suggestions = search.trim() ? searchLocations(visiblePlaces, search) : [];
  const showSuggestions = searchFocused && search.trim().length > 0;

  // Centrera kartan på platsen och öppna dess PlaceBanner.
  const selectPlace = (place) => {
    Keyboard.dismiss();
    setSearch(place.name);
    setSearchFocused(false);

    mapRef.current?.animateToRegion(
      {
        latitude: Number(place.latitude) - FOCUS_DELTA * (BANNER_HEIGHT_RATIO / 2),
        longitude: Number(place.longitude),
        latitudeDelta: FOCUS_DELTA,
        longitudeDelta: FOCUS_DELTA,
      },
      500
    );

    router.push(`/place/${place.location_id}`);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        onPress={Keyboard.dismiss}
        onMapReady={() => setMapReady(true)}
        //Kartan utgår från dessa innan användaren godkänner platsinfo
        initialRegion={{
          latitude: 63.820556,
          longitude: 20.303611,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && (
          // Visa endast användarens prick om location finns
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tappable={false}
          >
            <View style={styles.userHalo}>
              <View style={styles.userDot} />
            </View>
          </Marker>
        )}

        {visiblePlaces.map((place) => (
            <Marker
              key={place.location_id}
              coordinate={{
                latitude: Number(place.latitude),
                longitude: Number(place.longitude),
              }}
              title={place.name}
              pinColor="green"
              onPress={() => router.push(`/place/${place.location_id}`)}
            />
          ))}
      </MapView>

      {/* Under filterknappen. Ligger före topBar så att sökförslagen hamnar ovanpå */}
      <Pressable
        onPress={centerOnUser}
        accessibilityRole="button"
        accessibilityLabel="Min position"
        style={({ pressed }) => [
          styles.locateButton,
          { top: insets.top + 8 + 48 + 575 },
          pressed && styles.locatePressed,
        ]}
      >
        <Ionicons name="navigate" size={22} color={COLORS.green} />
      </Pressable>

      <View style={[styles.topBar, { top: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Sök plats"
              placeholderTextColor="#666"
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onSubmitEditing={() => suggestions[0] && selectPlace(suggestions[0])}
              autoCorrect={false}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={10}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </Pressable>
            )}
          </View>

          <View style={styles.filterButton}>
            <FilterMenu value={filter} onChange={setFilter} />
          </View>
        </View>

        {showSuggestions && (
          <View style={styles.suggestions}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {suggestions.length > 0 ? (
                suggestions.map((place, index) => (
                  <Pressable
                    key={place.location_id}
                    style={({ pressed }) => [
                      styles.suggestionRow,
                      index > 0 && styles.suggestionDivider,
                      pressed && styles.suggestionPressed,
                    ]}
                    onPress={() => selectPlace(place)}
                  >
                    <View style={styles.suggestionIcon}>
                      <Ionicons name="location-sharp" size={18} color="#0C7A1A" />
                    </View>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      {place.name}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.noResults}>Inga platser matchar sökningen</Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      <View
        pointerEvents="box-none"
        style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 115,
      }}
      >
        <Host matchContents>
          <Button
            label="Lägg till plats"
            onPress={() => router.push('/map/createPlace')}
            modifiers={[
              buttonStyle('borderedProminent'),
              controlSize('large'),
              tint(COLORS.green),
            ]}
          />
        </Host>
      </View>

    </View>
  );
}

const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',   
    alignItems: 'center',         
    paddingBottom: 24,            
  },

  userHalo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.green + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.green,
    borderWidth: 3,
    borderColor: '#fff',
    ...shadow,
  },

  locateButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  locatePressed: { opacity: 0.6 },

  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#fff',
    ...shadow,
  },
  searchInput: { flex: 1, fontSize: 17 },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },

  suggestions: {
    marginTop: 8,
    maxHeight: 300,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    ...shadow,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  suggestionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  suggestionPressed: { backgroundColor: '#f0f0f2' },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e6f2e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionName: { flex: 1, fontSize: 16 },
  noResults: { padding: 16, fontSize: 15, color: '#666' },
});
