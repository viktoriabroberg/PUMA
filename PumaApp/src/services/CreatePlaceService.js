
import { getCurrentLocation } from './GpsService';
import {supabase} from  '../utils/supabase';

export async function createPlaceFunction({
    name, amount,description,species, picture_url
}){

    console.log('Platsnamn:', name);
    console.log('Anteckning:', description);
    //Hämta plats
    const location = await getCurrentLocation();

    if (!location) {
        console.log('Kunde inte hämta position');
        return;
    }else{
        console.log('Latitude:', location.latitude);
        console.log('Longitude:', location.longitude);

    }
    //SQL anrop till databas
    //Lägg in plats
    /*const {data, error} = await supabase
        .from('location')
        .insert({
            picture_url: picture_url,
            name: name,
            latitude: location.latitude,
            longitude: location.longitude,
            amount: amount,



        })


    console.log('Plats skapad:', data);
    return data;*/

}


   
