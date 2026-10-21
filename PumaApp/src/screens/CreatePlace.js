import { useEffect, useState , useRef, useCallback} from 'react';
import { Image as RNImage, Text as RNText, Pressable, View, useWindowDimensions  } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Host, Button, Form, TextField, HStack, Section, useNativeState, VStack, Text, RNHostView, Spacer, Divider } from '@expo/ui/swift-ui';
import {
  buttonStyle, controlSize, submitLabel, textFieldStyle, onSubmit,
  background, foregroundStyle, shapes, tint, font,
  padding, shadow, lineLimit, headerProminence,
  listRowBackground, listRowInsets,
} from '@expo/ui/swift-ui/modifiers';
import { createPlaceFunction, getSpecies,addSpeciesFunction} from '../services/CreatePlaceService';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { StyleSheet } from 'react-native';
export default function CreatePlace() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const [photoUri, setPhotoUri] = useState(null);
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



    //Funktion för att välja arter och lägga in i speciesIds
    async function addNewSpecies(inputSpeciesState, type) {
      //Hämta namn från input
      const inputSpecies = inputSpeciesState.value.trim();
      console.log('addNewSpecies körs med:', inputSpeciesState.value, type);

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

      //Visa arten direkt med ett tillfälligt id medan den sparas i databasen
      const tempId = `temp-${Date.now()}`;
      //Läggs sist eftersom listan är sorterad på id och den nya arten får högst id
      setSpeciesList((prev) => [...prev, { species_id: tempId, name: inputSpecies, type }]);
      setSelectedSpeciesIds((prev) => [...prev, tempId]);
      inputSpeciesState.set('');

      try {
        //Lägg in arten i databasen och få tillbaka dess id
        const id = await addSpeciesFunction(inputSpecies, type);
        //Byt ut det tillfälliga id:t mot det riktiga
        setSpeciesList((prev) =>
          prev.map((s) => (s.species_id === tempId ? { ...s, species_id: id } : s))
        );
        setSelectedSpeciesIds((prev) => prev.map((x) => (x === tempId ? id : x)));
      } catch (e) {
        //Ta bort arten igen om det inte gick att spara
        setSpeciesList((prev) => prev.filter((s) => s.species_id !== tempId));
        setSelectedSpeciesIds((prev) => prev.filter((x) => x !== tempId));
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
    //Öppnar telefonens kamera och sparar bilden som platsens foto
    async function openCamera() {
      try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          alert('Appen behöver tillgång till telefonens kamera');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
        if (!result.canceled) {
          setPhotoUri(result.assets[0].uri);
        }
      } catch (e) {
        alert(e.message);
      }
    }

  async function save() {
    const placeName = nameState.value.trim();
    const placeNote = noteState.value.trim();

    //Kontroll för att namn måste anges
    if (!placeName) {
      return;
    }
    
    console.log('Valda befintliga arter:', selectedSpeciesIds);
 
    //Kontroll så att art anges
    if (selectedSpeciesIds.length === 0/* && newSpecies.length === 0*/) {
      alert('Välj minst en art');
      return;
    }
    //Kontroll så att alla nya arter hunnit sparas i databasen
    if (selectedSpeciesIds.some((id) => String(id).startsWith('temp-'))) {
      alert('Arten sparas fortfarande, försök igen om en sekund');
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
  //Rubrik ovanför varje sektion, stor och svart som i designen.
  //Sektioner med nollställda radmarginaler flyttar även rubriken, så de får tillbaka indraget här
  function sectionHeader(title, { noRowInsets = false } = {}) {
    return (
      <Text
        modifiers={[
          font({ size: 18, weight: 'semibold' }),
          foregroundStyle('#000000'),
          ...(noRowInsets ? [padding({ leading: 20 })] : []),
        ]}
      >
        {title}
      </Text>
    );
  }

  //Knappar för arter, markerade får vår gröna färg
  function speciesRows(list, type) {
    return (
      //key gör att vyn mäts om när en art läggs till eller tas bort
      <RNHostView matchContents key={`${type}-${list.length}`}>
        <View style={[styles.speciesWrap, { width: width - 80 }]}>
          {list.map((s) => {
            const isSelected = selectedSpeciesIds.includes(s.species_id);
            return (
              <Pressable
                key={s.species_id}
                onPress={() => toggleSpecies(s.species_id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.speciesButton,
                  isSelected && styles.speciesButtonSelected,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <RNText style={[styles.speciesLabel, isSelected && styles.speciesLabelSelected]}>
                  {s.name}
                </RNText>
              </Pressable>
            );
          })}
        </View>
      </RNHostView>
    );
  }


  //Fält för att lägga till egen art: vit kapsel med mjuk skugga så att det syns mot det vita kortet
  function speciesInput(state, placeholder, type) {
    return (
      <TextField
        placeholder={placeholder}
        text={state}
        modifiers={[
          textFieldStyle('plain'),
          font({ size: 17 }),
          padding({ horizontal: 20, vertical: 14 }),
          background('#FFFFFF', shapes.capsule()),
          shadow({ color: '#0000001F', radius: 10, x: 0, y: 3 }),
          padding({ vertical: 6 }),
          submitLabel('done'),
          onSubmit(() => addNewSpecies(state, type)),
        ]}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Host style={{ flex: 1 }}>
        <Form>
          <Section
            header={sectionHeader('Foto', { noRowInsets: true })}
            modifiers={[
              headerProminence('increased'),
              listRowBackground('#F2F2F7'),
              listRowInsets({ top: 0, bottom: 0, leading: 0, trailing: 0 }),
            ]}
          >
            {/* key gör att vyn byggs om när en ny bild kommer, annars ritas den inte om */}
            <RNHostView matchContents key={photoUri ? String(photoUri) : 'no-photo'}>
              <View style={{ width: width - 40, alignItems: 'center', gap: 10, paddingVertical: 4 }}>
                {/* Stor knapp, bilden blir kortets bakgrund när ett foto är taget */}
                <Pressable
                  onPress={openCamera}
                  accessibilityRole="button"
                  accessibilityLabel={photoUri ? 'Ta ny bild' : 'Lägg till foto'}
                  style={({ pressed }) => [
                    styles.photoCard,
                    { height: photoUri ? 300 : 200 },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  {photoUri ? (
                    <View style={styles.photoClip}>
                      <RNImage
                        source={{ uri: String(photoUri) }}
                        style={{ width: width - 40, height: 300 }}
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={32} color={COLORS.secondaryLabel} />
                      <RNText style={styles.photoCardText}>Lägg till foto</RNText>
                    </>
                  )}
                </Pressable>
              </View>
            </RNHostView>
          </Section>

          <Section header={sectionHeader('Namn')} modifiers={[headerProminence('increased')]}>
            <TextField
              placeholder="Namn på plats"
              text={nameState}
              modifiers={[submitLabel('done')]}
            />
          </Section>

          <Section header={sectionHeader('Art')} modifiers={[headerProminence('increased')]}>
            <VStack alignment="leading" spacing={12}>
              {speciesRows(mushrooms, 'Svamp')}
              {speciesInput(mushroomState, 'Ange egen svampart här...', 'Svamp')}
              <Divider />
              {speciesRows(berries, 'Bär')}
              {speciesInput(berryState, 'Ange egen bärart här...', 'Bär')}
            </VStack>
          </Section>

          <Section
            header={sectionHeader('Mängd', { noRowInsets: true })}
            modifiers={[
              headerProminence('increased'),
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

          <Section header={sectionHeader('Anteckningar')} modifiers={[headerProminence('increased')]}>
            <TextField
              axis="vertical"
              placeholder="Anteckningar från plats.."
              text={noteState}
              modifiers={[lineLimit({ min: 4, max: 8 })]}
            />
          </Section>

          <Section modifiers={[listRowBackground('#F2F2F7')]}>
            <HStack>
              <Spacer />
              <Button
                label="Spara"
                onPress={save}
                modifiers={[
                  buttonStyle('borderedProminent'),
                  tint(COLORS.green),
                  controlSize('large'),
                  font({ size: 17, weight: 'semibold' }),
                ]}
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
  speciesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 4,
  },
  speciesButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  speciesButtonSelected: {
    backgroundColor: COLORS.green,
  },
  speciesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  speciesLabelSelected: {
    color: '#FFFFFF',
  },
  photoCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  photoClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
  },
  photoCardText: {
    fontSize: 17,
    color: COLORS.secondaryLabel,
  },
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
    backgroundColor: '#007AFF',
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
