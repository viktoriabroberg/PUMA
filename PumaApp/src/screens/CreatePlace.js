import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Host, Button, Form, TextField,HStack, Section, useNativeState } from '@expo/ui/swift-ui';
import {buttonStyle,controlSize,scrollContentBackground,background,submitLabel,
} from '@expo/ui/swift-ui/modifiers';
import { createPlaceFunction, getSpecies } from '../services/CreatePlaceService';

export default function CreatePlace() {
    const router = useRouter();
    const nameState = useNativeState('');
    const noteState = useNativeState('');
    const mushroomState = useNativeState('');
    const berryState = useNativeState('');
    const inputSpeciesState = useNativeState('');
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
    // Gammal för arter
    //const [species, setSpecies] = useState('');
    const mushrooms = speciesList.filter((s) => s.type ==='Svamp');
    const berries = speciesList.filter((s) => s.type === 'Bär'); 

    // Useeffect som anvädner service och lägger till allt på arttabellen i artlistan
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
            //Om namn inte kommit in så retunera
            if(!inputSpecies){return;}
        //Kontrollera så att tillagd art inte läggs till dubbelt
        const speciesExist = newSpecies.some(
            (n) => n.type === type && n.name.toLowerCase() === inputSpecies.toLowerCase());
        //Om art inte finns så lägg till i listan med newSpecies
        if(!speciesExist){
            setNewSpecies((prev) => [...prev, { name: inputSpecies, type }]);
        }
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
      alert('Ge platsen ett namn');
      return;
    }
    //Kontroll om en ny art är inlaggd
 
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

    try {
      await createPlaceFunction({
        name: placeName,
        amount,
        description: placeNote,
        picture_url: null,
        speciesIds: selectedSpeciesIds,
        newSpecies
      });
      router.back();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <Host style={{ flex: 1 }}>
      <Form>
        <Section title="Namn">
          <TextField
            placeholder="Namn på plats"
            text={nameState}
            modifiers={[submitLabel('done')]}
          />
        </Section>

        <Section title="Mängd">
          {chunk(amountOptions, 3).map((row, i) => (
            <HStack key={i} spacing={8}>
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

        <Section title="Arter">
          {chunk(speciesList, 3).map((row, i) => (
            <HStack key={i} spacing={8}>
              {row.map((s) => (
                <Button
                  key={s.species_id}
                  label={s.name}
                  onPress={() => toggleSpecies(s.species_id)}
                  modifiers={[
                    buttonStyle(
                      selectedSpeciesIds.includes(s.species_id) ? 'borderedProminent' : 'bordered'
                    ),
                    controlSize('large'),
                  ]}
                />
              ))}
            </HStack>
          ))}
        </Section>
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
  );
}
