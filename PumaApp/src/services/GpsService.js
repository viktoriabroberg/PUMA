import * as Location from 'expo-location';
export async function getCurrentLocation(){
    const { status } =
    await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
    console.log('GPS-behörighet nekades');
    return;
    }

    const location = await Location.getCurrentPositionAsync({});
    return{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
    };
}
export async function watchLocation(callback){
    const { status } =
    await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
    console.log('GPS-behörighet nekades');
    return;
    }
    return Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.High
        },
        //Funktionen som uppdaterass
            (currentLocation) =>{callback({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
        })})

}   