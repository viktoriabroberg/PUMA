import { Stack } from 'expo-router';

export default function CameraLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Ta bild', headerBackTitle: 'Tillbaka' }}
      />
    
    </Stack>
  );
}