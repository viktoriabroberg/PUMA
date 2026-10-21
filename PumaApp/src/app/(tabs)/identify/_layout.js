import { Stack } from 'expo-router';

export default function IdentifyLayout(){
    return (
        <Stack
    screenOptions={{
      headerTransparent: true,
      headerLargeTitleEnabled: true,
      headerShadowVisible: false,
      headerLargeTitleShadowVisible: false,
    }}>
      <Stack.Screen name="index" options={{ title: 'Identifiera' }} />
</Stack>
    );
}
