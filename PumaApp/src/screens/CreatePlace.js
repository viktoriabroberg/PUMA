import { useEffect, useState , useRef, useCallback} from 'react';
import { Image as RNImage, Text as RNText, Pressable, View, useWindowDimensions  } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Host, Button, Form, TextField, HStack, Section, useNativeState, VStack, Text, ZStack, RNHostView, Spacer } from '@expo/ui/swift-ui';
import {
buttonStyle, controlSize, submitLabel, textFieldStyle, onSubmit,
  frame, background, foregroundColor, onTapGesture, shapes,scaleEffect,
  listRowBackground, listRowInsets,tint
} from '@expo/ui/swift-ui/modifiers';
import { createPlaceFunction, getSpecies,addSpeciesFunction} from '../services/CreatePlaceService';
import { COLORS } from '../constants/colors';
import { StyleSheet } from 'react-native';
export default function CreatePlace() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    // Bildens uri skickas hit från kameraskärmen
    const { photoUri } = useLocalSearchParams();
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
    const amountImages = {
        1:{
          label: 'Sparsamt',
          width: 16,
          normal: require('../../assets/amountIndicator/greyIndicator1.png'),
          selected: require('../../assets/amountIndicator/whiteIndicator1.png')
        },
        2:{
          label: 'Måttligt',
          width: 41,
          normal: require('../../assets/amountIndicator/greyIndicator2.png'),
          selected: require('../../assets/amountIndicator/whiteIndicator2.png')
        },
        3:{
          label: 'Rikligt',
          width: 65,
          normal: require('../../assets/amountIndicator/greyIndicator3.png'),
          selected: require('../../assets/amountIndicator/whiteIndicator3.png')
        }
    };
    const amountOptions = [1, 2, 3];
    const [amount, setAmount] = useState(null);

    //Förhindrar att platsen sparas flera gånger vid snabba tryck
    const isSavingRef = useRef(false);
    const [saving, setSaving] = useState(false);
    
    // Gammal för arter
    //const [species, setSpecies] = useState('');
    const mushrooms = speciesList.filter((s) => s.type ==='Svamp');
    const berries = speciesList.filter((s) => s.type === 'Bär'); 

  
     useFocusEffect(
        useCallback(() => {
          getSpecies()
            .then(setSpeciesList)
            .catch((e) => alert(e.message));
        }, [])
    );


  //Funktion för att dela upp alla arter
  function chunk(items, size){ 
    const rows = [];
        for (let i = 0; i < items.length; i += size) {
            rows.push(items.slice(i, i + size));
        }
        return rows;
  }

    //Funktion för att välja arter och lägga in i speciesIds
    async function addNewSpecies(inputSpeciesState, type) {
      //Hämta namn från input
      const inputSpecies = inputSpeciesState.value.trim();

      //Om namn inte kommit in så returnera
      if (!inputSpecies) { return; }

      //Kontrollera så att arten inte redan finns i listan med arter
      const alreadyExists = speciesList.some(
        (s) =>
          s.type === type &&
          s.name.toLowerCase() === inputSpecies.toLowerCase()
      );
      if (alreadyExists) {
        alert('Arten finns redan');
        return;
      }

      try {
        //Lägg in arten i databasen och få tillbaka dess id
        const id = await addSpeciesFunction(inputSpecies, type);
        //Hämta om listan så att arten syns som knapp
        setSpeciesList(await getSpecies());
        //Markera den nya arten som vald
        setSelectedSpeciesIds((prev) => [...prev, id]);
        inputSpeciesState.set('');
      } catch (e) {
        alert(e.message);
      }
    }
    
    function toggleSpecies(id) {
            setSelectedSpeciesIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }
  
    function selectedAmount(id) {
        setAmount(id);   // ersätter det gamla värdet
    }
    function openCamera() {
      router.push('/map/createPlace/camera');
    }
    

  async function save() {
    const placeName = nameState.value.trim();
    const placeNote = noteState.value.trim();

    //Kontroll för att namn måste anges
    if (!placeName) {
      return;
    }
     
    //Kontroll så att art anges
    if (selectedSpeciesIds.length === 0/* && newSpecies.length === 0*/) {
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
        speciesIds: selectedSpeciesIds
    
      });
      router.push('/map');
    } catch (e) {
      alert(e.message);
      //Låt användaren försöka igen om det blev fel
      isSavingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>

       <Host style={{ flex: 1 }}>
        <Form>

            <VStack spacing={12}>
            <ZStack
                modifiers={[
                frame({ width: width - 64, height: photoUri ? 300 : 160 }),
                background('#D1D1D1', shapes.roundedRectangle({ cornerRadius: 12 })),
                ...(photoUri ? [] : [onTapGesture(openCamera)]),
                ]}
            >
                {photoUri ? (
                <RNHostView>
                    <RNImage
                    source={{ uri: String(photoUri) }}
                    style={{ flex: 1, borderRadius: 12 }}
                    resizeMode="cover"
                    />
                </RNHostView>
                ) : (
                <Text modifiers={[foregroundColor('#333333')]}>Ta bild</Text>
                )}
            </ZStack>

            {photoUri ? (
                <Button
                label="Ta ny bild"
                onPress={openCamera}
                modifiers={[buttonStyle('bordered'), controlSize('small')]}
                />
            ) : null}
            </VStack>
        <Section title="Namn">
            <TextField
            placeholder="Namn på plats"
            text={nameState}
            modifiers={[submitLabel('done')]}
            />
        </Section>
        

        <Section
          title="Mängd"
          modifiers={[
            listRowBackground('#F2F2F7'),
            listRowInsets({ top: 0, bottom: 0, leading: 0, trailing: 0 }),
          ]}
        >
          <RNHostView matchContents>
            <View style={[styles.amountRow, { width: width - 40 }]}>
              {amountOptions.map((a) => {
                const isSelected = amount === a;
                const img = amountImages[a];
                return (
                  <Pressable
                    key={a}
                    onPress={() => selectedAmount(a)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.amountButton,
                      isSelected && styles.amountButtonSelected,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    {/* Båda bilderna renderas alltid så att bytet sker direkt utan omladdning */}
                    <View style={{ width: img.width, height: 16 }}>
                      <RNImage
                        source={img.normal}
                        style={[styles.amountImage, { opacity: isSelected ? 0 : 1 }]}
                        resizeMode="contain"
                        fadeDuration={0}
                      />
                      <RNImage
                        source={img.selected}
                        style={[styles.amountImage, { opacity: isSelected ? 1 : 0 }]}
                        resizeMode="contain"
                        fadeDuration={0}
                      />
                    </View>
                    <RNText style={[styles.amountLabel, isSelected && styles.amountLabelSelected]}>
                      {img.label}
                    </RNText>
                  </Pressable>
                );
              })}
            </View>
          </RNHostView>
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


          <Section modifiers={[listRowBackground('#F2F2F7')]}>
            <HStack>
              <Spacer />
              <Button
                label="Spara"
                onPress={save}
                modifiers={[buttonStyle('borderedProminent'), controlSize('large')]}
              />
              <Spacer />
            </HStack>
          </Section>
        </Form>
      </Host>
    </View>
  );
}
const styles = StyleSheet.create({
  amountRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  amountButton: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  amountButtonSelected: {
    backgroundColor: COLORS.green,
  },
  amountImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  amountLabel: {
    fontSize: 14,
    color: '#000000',
  },
  amountLabelSelected: {
    color: '#FFFFFF',
  },
  photoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  photoBox: {
    height: 220,
    width: '100%',
    backgroundColor: '#D1D1D1',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBoxText: {
    color: '#333333',
    fontSize: 18,
    fontWeight: '600',
  },
  retakeButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
