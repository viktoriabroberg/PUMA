import { Stack } from 'expo-router';

// Transparent header med bara en tillbaka-pil, likt MapMiddleView
const backOnlyHeader = {
  headerShown: true,
  headerTransparent: true,
  title: '',
  headerBackButtonDisplayMode: 'minimal',
};

export default function MapLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="createPlace/index"
        options={{
          ...backOnlyHeader,
          title: 'Lägg till plats',
          headerTitleStyle: { fontSize: 20, fontWeight: '600' },
        }}
      />
      <Stack.Screen name="createPlace/camera/index" options={backOnlyHeader} />
    </Stack>
  );
}
