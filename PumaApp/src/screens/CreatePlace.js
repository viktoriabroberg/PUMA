import { useEffect, useState , useRef} from 'react';
import { Image as RNImage, Pressable, View, Text as RNText, } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Host, Button, Form, TextField,HStack, Section, useNativeState, VStack, Text,ZStack, Image} from '@expo/ui/swift-ui';
import {buttonStyle,controlSize,multilineTextAlignment,submitLabel, textFieldStyle, onSubmit,frame,background,foregroundStyle, clipped
} from '@expo/ui/swift-ui/modifiers';
import { createPlaceFunction, getSpecies} from '../services/CreatePlaceService';
import { StyleSheet } from 'react-native';

export default function CreatePlace() {
    const router = useRouter();
    // Bildens uri skickas hit från kameraskärmen
    const { photoUri } = useLocalSearchParams();
    const nameState = useNativeState('');
    const noteState = useNativeState('');
    const mushroomState = useNativeState('');
    const berryState = useNativeState('');
    const inputSpeciesState = useNativeState('');
    //const inputMushroomSpeciesState = useNativeState('');
    //const inputBerrySpeciesState = useNativeState('');
    const [type, setType] = useState('');     

    //Lista med alla arter med id osv
    const [speciesList, setSpeciesList] = useState([]); 
    //För id på arter
    const [selectedSpeciesIds, setSelectedSpeciesIds] = useState([]);
    //För egna arter
    const [newSpecies, setNewSpecies] = useState([]);
    //Mängd, sätts av användaren
    const amountOptions = [1, 2, 3];
    const [amount, setAmount] = useState(null);

    //Förhindrar att platsen sparas flera gånger vid snabba tryck
    const isSavingRef = useRef(false);
    const [saving, setSaving] = useState(false);
    
    // Gammal för arter
    //const [species, setSpecies] = useState('');
    const mushrooms = speciesList.filter((s) => s.type ==='Svamp');
    const berries = speciesList.filter((s) => s.type === 'Bär'); 

    // Useeffect som anvädner service och lägger till allt på arttabellen i artlistan
    //Kolla på att ändra till useFocusEffect
    useEffect(() =>{
        console.log('Valda arter:', selectedSpeciesIds);
            getSpecies()
            .then(setSpeciesList)
            .catch((e) =>  alert(e.message));
    },[]);



  //Funktion för att dela upp alla arter
  function chunk(items, size){ 
    const rows = [];
        for (let i = 0; i < items.length; i += size) {
            rows.push(items.slice(i, i + size));
        }
        return rows;
  }

    //Funktion för att välja arter och lägga in i speciesIds
    function addNewSpecies(inputSpeciesState,type){
        //Hämta namn från input
        const inputSpecies = inputSpeciesState.value.trim();
        console.log('addNewSpecies körs med:', inputSpeciesState.value, type);
            //Om namn inte kommit in så retunera
            if(!inputSpecies){return;}
        //Kontrollera så att tillagd art inte läggs till dubbelt
         const alreadyExists =
            newSpecies.some(
            (s) =>
                s.type === type &&
                s.name.toLowerCase() === inputSpecies.toLowerCase()
            );
        if (alreadyExists) {
            alert('Arten finns redan');
            return;
        }
        else{
            setNewSpecies((prev) => [...prev, { name: inputSpecies, type }]);
        }
        //Om art inte finns så lägg till i listan med newSpecies
    
        inputSpeciesState.set('');
    }
    //Funktion för att kolla om ny art är tilllagd


    function toggleSpecies(id) {
            setSelectedSpeciesIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }
  
    function selectedAmount(id) {
        setAmount(id);   // ersätter det gamla värdet
    }
    

  async function save() {
    const placeName = nameState.value.trim();
    const placeNote = noteState.value.trim();

    //Kontroll för att namn måste anges
    if (!placeName) {
      return;
    }
    
    console.log('Valda befintliga arter:', selectedSpeciesIds);
    console.log('Egna arter:', newSpecies);
 
    //Kontroll så att art anges
    if (selectedSpeciesIds.length === 0 && newSpecies.length === 0) {
      alert('Välj minst en art');
      return;
    }
    //Kontroll så att mängd anges
    if (amount === null) {
      alert('Välj en mängd');
      return;
    }

    //Om en sparning redan pågår, gör ingenting
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaving(true);

    try {
      await createPlaceFunction({
        name: placeName,
        amount,
        description: placeNote,
        pictureUri: photoUri ?? null,
        speciesIds: selectedSpeciesIds,
        newSpecies
      });
      router.push('/map');
    } catch (e) {
      alert(e.message);
      //Låt användaren försöka igen om det blev fel
      isSavingRef.current = false;
      setSaving(false);
    }
  }
console.log('photoUri:', photoUri);
  return (
    <View style={{ flex: 1 }}>

      <Host style={{ flex: 1 }}>
        <Form>   

        <View style={{ height: 300, width: '100%' }}>
        <Pressable
            onPress={() => router.push('/map/createPlace/camera')}
            style={{ flex: 1, backgroundColor: '#D1D1D1', overflow: 'hidden' }}
        >
            {photoUri ? (
            <RNImage
                source={{ uri: photoUri }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
            />
            ) : null}

            <RNText style={styles.photoButtonText}>
            {photoUri ? 'Ta ny bild' : 'Ta bild'}
            </RNText>
        </Pressable>
        </View>

          <Section title="Namn">
            <TextField
              placeholder="Namn på plats"
              text={nameState}
              modifiers={[submitLabel('done')]}
            />
          </Section>

        <Section title="Mängd">
          {chunk(amountOptions, 3).map((row, i) => (
            <HStack key={i} spacing={8} >
              {row.map((a) => (
                <Button
                  key={a}
                  label={String(a)}
                  onPress={() => selectedAmount(a)}
                  modifiers={[
                    buttonStyle(
                      amount === a ? 'borderedProminent' : 'bordered'
                    ),
                    controlSize('large'),
                  ]}
                />
              ))}
            </HStack>
          ))}
        </Section>

        <VStack alignment="leading" >
        {chunk(mushrooms, 3).map((row, i) => (
            <HStack key={i} spacing={8} >
            {row.map((s) => (
                <Button
                key={s.species_id}
                label={s.name}
                onPress={() => toggleSpecies(s.species_id)}
                modifiers={[
                    buttonStyle(
                    selectedSpeciesIds.includes(s.species_id)
                        ? 'borderedProminent'
                        : 'bordered'
                    ),
                    controlSize('large'),
                ]}
                />
            ))}
            </HStack>
        ))}
   
        <TextField
            placeholder="Ange egen art"
            text={mushroomState}
            modifiers={[textFieldStyle('roundedBorder'),submitLabel('done'),onSubmit(() => addNewSpecies(mushroomState, 'Svamp'))]}
          />
    
        {chunk(berries, 3).map((row, i) => (
            <HStack key={i} spacing={8} >
            {row.map((s) => (
                <Button
                key={s.species_id}
                label={s.name}
                onPress={() => toggleSpecies(s.species_id)}
                modifiers={[
                    buttonStyle(
                    selectedSpeciesIds.includes(s.species_id)
                        ? 'borderedProminent'
                        : 'bordered'
                    ),
                    controlSize('large'),
                ]}
                />
            ))}
            </HStack>
        ))}
        
        <TextField
            placeholder="Ange egen art"
            text={berryState}
            modifiers={[textFieldStyle('roundedBorder'),submitLabel('done'), onSubmit(() => addNewSpecies(berryState, 'Bär'))]}
          />
        </VStack>


        <Section title="Namn">
          <TextField
            placeholder="Anteckningar"
            text={noteState}
            modifiers={[submitLabel('done')]}
          />
        </Section>

          <Section>
            <Button
              label="Spara"
              onPress={save}
              modifiers={[buttonStyle('borderedProminent'), controlSize('large')]}
            />
          </Section>
        </Form>
      </Host>
    </View>
  );
}
const styles = StyleSheet.create({
photoButton: {
  height: '100%',
  width: '100%',
  backgroundColor: '#D1D1D1',
  borderRadius: 8,
  overflow: 'hidden',
  justifyContent: 'center',
  alignItems: 'center',
},
photoButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
  textShadowColor: '#000000',
  textShadowRadius: 4,
}
});
