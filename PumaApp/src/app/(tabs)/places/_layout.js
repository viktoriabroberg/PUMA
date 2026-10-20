import { Stack} from 'expo-router';

export default function PlacesLayout(){
    return (
        <Stack
    screenOptions={{
      headerTransparent: true,
      headerLargeTitleEnabled: true,
      headerShadowVisible: false,
      headerLargeTitleShadowVisible: false,
    }}>
      <Stack.Screen name="index" options={{ title: 'Platser' }} />
</Stack>
    );
}
