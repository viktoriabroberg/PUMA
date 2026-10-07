import { Stack } from 'expo-router';

export default function AuthLayout(){
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="welcome"/>
            <Stack.Screen name="login" options={{ animation: 'fade' }}/>
            <Stack.Screen name="register" options={{ animation: 'fade' }}/>
        </Stack>
    );
}
