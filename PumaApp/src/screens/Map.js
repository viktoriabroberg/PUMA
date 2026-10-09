import React, { useCallback, useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, View } from 'react-native';
import { Host, Button } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize } from '@expo/ui/swift-ui/modifiers';
import { useRouter, useFocusEffect } from 'expo-router';
import { getCurrentLocation } from '../services/GpsService';
import { watchLocation } from '../services/GpsService';
//import { getMyLocationsTemp } from '../services/PlaceService';
import { getMyLocations } from '../services/PlaceService'; // byt till denna när inloggningen fungerar

export default function Map() {
  //const [state, setState] = useState(null);
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);

  // Hämta användarens platser varje gång skärmen visas,
  // så att en nyss tillagd plats syns när man kommer tillbaka till kartan
  useFocusEffect(
    useCallback(() => {
      getMyLocations().then(setPlaces).catch(console.log);
    }, [])
  );

    useEffect(() => {
    let subscription;
    async function trackLockation() {
      //Hämta plats en gång
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
      }

      //Prenumerera på aktuell position för att uppdatera om användaren rör sig
      const subscription = await watchLocation((newLocation) => {
        setLocation(newLocation);
      });

    }

    trackLockation();
    
  }, []);
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        //Kartan utgår från dessa innan användaren godkänner platsinfo
        initialRegion={{
          latitude: 63.820556,
          longitude: 20.303611,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
       {location&&(
         <Marker
         //Visa endast marker om location finns
          coordinate={{
            latitude: location.latitude ,
            longitude: location.longitude ,
          }}
          title="Du"
          description="Här är du!"
        />)}

        {/* Pins för användarens sparade platser */}
        {places.filter((place) => place.latitude != null && place.longitude != null).map((place) => (
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
            modifiers={[buttonStyle('bordered'), controlSize('large')]}
          />
        </Host>
      </View>

    </View>
  );
}

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
    justifyContent: 'flex-end',   // trycker ner knappen mot botten
    alignItems: 'center',         // centrerar horisontellt
    paddingBottom: 24,            // litet luftrum över tab-baren
  },
});