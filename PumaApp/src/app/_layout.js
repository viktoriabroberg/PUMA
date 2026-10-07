import { Stack } from 'expo-router';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';

export default function RootLayout(){
    const [fontsLoaded, fontError] = useFonts({ Cinzel_700Bold });

    if (!fontsLoaded && !fontError){
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false}}/>
    );
}
