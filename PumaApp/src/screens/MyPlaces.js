import { useEffect, useState } from 'react';
import { Text, Pressable, FlatList } from 'react-native';
import { router } from 'expo-router';
import { getMyLocations } from '../services/PlaceService';
//import { getAllLocationsTemp } from '../services/PlaceService';
import { getMyLocationsTemp } from '../services/PlaceService';

export default function MyPlaces() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    getMyLocationsTemp().then(setLocations).catch(console.log);
  }, []);

  
  return (
    <FlatList
      data={locations}
      keyExtractor={(item) => String(item.location_id)}
      renderItem={({ item }) => (
        <Pressable
          style={{ padding: 16, borderBottomWidth: 1, borderColor: '#ddd' }}
          onPress={() => router.push(`/place/${item.location_id}`)}
        >
          <Text>{item.name}</Text>
        </Pressable>
      )}
    />
  );
} 


