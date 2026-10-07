
import { getCurrentLocation } from './GpsService';

export async function createPlaceFunction({
    name, note
}) {

console.log('Platsnamn:', name);
console.log('Anteckning:', note);
const location = await getCurrentLocation();

  if (!location) {
    console.log('Kunde inte hämta position');
    return;
  }else{
    console.log('Latitude:', location.latitude);
    console.log('Longitude:', location.longitude);

  }


  //latitude = location.latitude;
  //longitude = location.longitude;
//Hämta id från användaren
//Om en species är angedd
  //Spara i speciestabell med användarens ID
//Lägg in data i platstabellen kopplat till id
}