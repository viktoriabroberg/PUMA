import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getMyLocations } from '../services/LocationService';

export default function testfunktion() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    getMyLocations()
      .then(data => {
        console.log(data);
        setLocations(data);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  return (
    <View>
      <Text>Mina platser</Text>

      {locations.map(location => (
        <View key={location.location_id}>
          <Text>Namn: {location.name}</Text>
          <Text>Beskrivning: {location.description}</Text>
          <Text>Antal: {location.amount}</Text>

          {location.location_species?.map(item => (
            <Text key={item.species_id}>
              Art: {item.Species?.name}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}