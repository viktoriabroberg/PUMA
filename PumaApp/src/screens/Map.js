import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { StyleSheet, View } from 'react-native';

export default function Map() {
  //const [state, setState] = useState(null);
  const [location, setLocation] = useState(null);
    useEffect(() => {
    async function getLocation() {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('GPS-behörighet nekades');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      //Prenumerera på aktuell position för att uppdatera om användaren rör sig
      //Tar in två argument, gps inställningar samt funktion som körs när det uppdateras
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High
        },
        //Funktionen som uppdaterass
         (currentLocation) =>{setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        })}
      );
     /* setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });*/
    }

    getLocation();
    //Avsluta prenumeration
   /* if(subscription){
      subscription.remove();
    }*/
    
  }, []);
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
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
      </MapView>
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
});