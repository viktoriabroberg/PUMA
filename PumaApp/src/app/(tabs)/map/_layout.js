import { Stack} from 'expo-router';

export default function MapLayout(){
    return (
        <Stack>
            <Stack.Screen name ="index" options={{headerShown: false}} />
            <Stack.Screen 
                name = "createPlace/index" 
                options = {{title: 'Lägg till plats', headerBackTitle: 'Karta'}}
            />
        </Stack>
    );
}
