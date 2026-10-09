import { Stack } from 'expo-router';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';

export default function RootLayout(){
      const [fontsLoaded, fontError] = useFonts({ Cinzel_700Bold });

    if (!fontsLoaded && !fontError){
        return null;
    }
    return (
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="place/[id]"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.4, 1],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
        }}
      />
    </Stack>
    );
}
