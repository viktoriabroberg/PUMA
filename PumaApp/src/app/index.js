import { Redirect } from 'expo-router';

export default function Index(){
    // TODO: Skicka till "/map" direkt om användaren redan är inloggad.
    return <Redirect href = "/welcome" />;
}
