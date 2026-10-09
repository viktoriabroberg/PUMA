import { Stack } from 'expo-router';

export default function CreatePlaceLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Lägg till plats', headerBackTitle: 'Karta' }}
      />
       
      
    </Stack>
  );
}