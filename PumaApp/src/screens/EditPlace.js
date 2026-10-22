import { useEffect, useState, useRef, useCallback } from 'react';
import { Image as RNImage, Text as RNText, Pressable, View, useWindowDimensions, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Host, Form, TextField, Section, useNativeState, VStack, Text, RNHostView, Divider } from '@expo/ui/swift-ui';
import {
  submitLabel, textFieldStyle, onSubmit,
  background, foregroundStyle, shapes, font,
  padding, shadow, lineLimit, headerProminence,
  listRowBackground, listRowInsets,
} from '@expo/ui/swift-ui/modifiers';
import { getSpecies, addSpeciesFunction, getCurrentProfileId, uploadPicture } from '../services/CreatePlaceService';
import { getLocationById, updateLocation, updateLocationSpecies, deleteLocation } from '../services/PlaceService';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

//Mängd, samma bilder som när en plats skapas
const amountImages = {
  1: {
    label: 'Sparsamt',
    width: 16,
    normal: require('../../assets/amountIndicator/greyIndicator1.png'),
    selected: require('../../assets/amountIndicator/whiteIndicator1.png'),
  },
  2: {
    label: 'Måttligt',
    width: 41,
    normal: require('../../assets/amountIndicator/greyIndicator2.png'),
    selected: require('../../assets/amountIndicator/whiteIndicator2.png'),
  },
  3: {
    label: 'Rikligt',
    width: 65,
    normal: require('../../assets/amountIndicator/greyIndicator3.png'),
    selected: require('../../assets/amountIndicator/whiteIndicator3.png'),
  },
};
const amountOptions = [1, 2, 3];

export default function EditPlace() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const router = useRouter();

  //Platsen som redigeras, null tills den hämtats
  const [place, setPlace] = useState(null);
  //Ny bild som tagits, annars visas platsens befintliga bild
  const [photoUri, setPhotoUri] = useState(null);
  const nameState = useNativeState('');
  const noteState = useNativeState('');
  const mushroomState = useNativeState('');
  const berryState = useNativeState('');

  //Lista med alla arter med id osv
  const [speciesList, setSpeciesList] = useState([]);
  //För id på valda arter, fylls i med platsens nuvarande arter
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState([]);
  const [amount, setAmount] = useState(null);

  //Förhindrar att platsen sparas flera gånger vid snabba tryck
  const isSavingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const mushrooms = speciesList.filter((s) => s.type === 'Svamp');
  const berries = speciesList.filter((s) => s.type === 'Bär');
  const shownPhoto = photoUri ?? place?.picture_url ?? null;

  //Hämta platsens data och fyll i formuläret
  useEffect(() => {
    getLocationById(id)
      .then((data) => {
        nameState.set(data.name ?? '');
        noteState.set(data.description ?? '');
        setAmount(data.amount ?? null);
        setSelectedSpeciesIds((data.location_species ?? []).map((s) => s.species_id));
        setPlace(data);
      })
      .catch((e) => alert(e.message));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      getSpecies()
        .then(setSpeciesList)
        .catch((e) => alert(e.message));
    }, [])
  );

  //Funktion för att lägga till egen art och markera den som vald
  async function addNewSpecies(inputSpeciesState, type) {
    const inputSpecies = inputSpeciesState.value.trim();
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
    setSpeciesList((prev) => [...prev, { species_id: tempId, name: inputSpecies, type }]);
    setSelectedSpeciesIds((prev) => [...prev, tempId]);
    inputSpeciesState.set('');

    try {
      const newId = await addSpeciesFunction(inputSpecies, type);
      //Byt ut det tillfälliga id:t mot det riktiga
      setSpeciesList((prev) =>
        prev.map((s) => (s.species_id === tempId ? { ...s, species_id: newId } : s))
      );
      setSelectedSpeciesIds((prev) => prev.map((x) => (x === tempId ? newId : x)));
    } catch (e) {
      //Ta bort arten igen om det inte gick att spara
      setSpeciesList((prev) => prev.filter((s) => s.species_id !== tempId));
      setSelectedSpeciesIds((prev) => prev.filter((x) => x !== tempId));
      alert(e.message);
    }
  }

  function toggleSpecies(speciesId) {
    setSelectedSpeciesIds((prev) =>
      prev.includes(speciesId) ? prev.filter((x) => x !== speciesId) : [...prev, speciesId]
    );
  }

  //Öppnar telefonens kamera och sparar bilden som platsens nya foto
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
      alert('Ange ett namn');
      return;
    }
    //Kontroll så att art anges
    if (selectedSpeciesIds.length === 0) {
      alert('Välj minst en art');
      return;
    }
    //Kontroll så att alla nya arter hunnit sparas i databasen
    if (selectedSpeciesIds.some((x) => String(x).startsWith('temp-'))) {
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
      //Ladda bara upp en bild om användaren tagit en ny
      const pictureUrl = photoUri
        ? await uploadPicture(photoUri, await getCurrentProfileId())
        : place.picture_url;

      await updateLocation(place.location_id, placeName, amount, placeNote, pictureUrl);
      await updateLocationSpecies(place.location_id, selectedSpeciesIds);
      router.back();
    } catch (e) {
      alert(e.message);
      //Låt användaren försöka igen om det blev fel
      isSavingRef.current = false;
      setSaving(false);
    }
  }

  //Frågar först, eftersom borttagningen inte går att ångra
  function confirmDelete() {
    if (isSavingRef.current) return;
    Alert.alert('Ta bort plats?', 'Platsen tas bort permanent och det går inte att ångra.', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Ta bort', style: 'destructive', onPress: removePlace },
    ]);
  }

  async function removePlace() {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setDeleting(true);

    try {
      await deleteLocation(place.location_id);
      //Stäng både redigeringen och PlaceBanner, platsen finns inte längre
      router.dismiss(2);
    } catch (e) {
      alert(e.message);
      isSavingRef.current = false;
      setDeleting(false);
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

  //Visa laddning tills platsens data finns så att fälten fylls i från början
  if (!place) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      {/* Rubrik + stängknapp, samma stil som PlaceBanner */}
      <View style={styles.headerRow}>
        <RNText style={styles.title}>Redigera plats</RNText>
        <Pressable
          style={styles.iconButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Stäng"
        >
          <Ionicons name="close" size={24} color="#000" />
        </Pressable>
      </View>
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
            <RNHostView matchContents key={shownPhoto ? String(shownPhoto) : 'no-photo'}>
              <View style={{ width: width - 40, alignItems: 'center', gap: 10, paddingVertical: 4 }}>
                <Pressable
                  onPress={openCamera}
                  accessibilityRole="button"
                  accessibilityLabel={shownPhoto ? 'Ta ny bild' : 'Lägg till foto'}
                  style={({ pressed }) => [
                    styles.photoCard,
                    { height: shownPhoto ? 300 : 200 },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  {shownPhoto ? (
                    <View style={styles.photoClip}>
                      <RNImage
                        source={{ uri: String(shownPhoto) }}
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
                      onPress={() => setAmount(a)}
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

          <Section
            modifiers={[
              listRowBackground('#F2F2F7'),
              listRowInsets({ top: 0, bottom: 0, leading: 0, trailing: 0 }),
            ]}
          >
            {/* Egen knapp eftersom tint inte slår igenom när vyn visas som modal */}
            <RNHostView matchContents>
              <View style={{ width: width - 40, paddingVertical: 4 }}>
                <Pressable
                  onPress={save}
                  disabled={saving}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.7 }]}
                >
                  <RNText style={styles.saveButtonText}>{saving ? 'Sparar...' : 'Spara'}</RNText>
                </Pressable>
                {/* Ta bort ligger sist, långt från Stäng så att den inte trycks av misstag */}
                <Pressable
                  onPress={confirmDelete}
                  disabled={saving || deleting}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.6 }]}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.red} />
                  <RNText style={styles.deleteButtonText}>{deleting ? 'Tar bort...' : 'Ta bort plats'}</RNText>
                </Pressable>
              </View>
            </RNHostView>
          </Section>
        </Form>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  title: { flex: 1, fontSize: 20, fontFamily: 'SF Pro', fontWeight: '600', marginRight: 12 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
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
  //Samma stil som Logga ut-knappen i Profile.js
  saveButton: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.green,
    //Ger samma bredd som Logga ut-knappen på profilsidan
    marginHorizontal: 16,
  },
  saveButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 25,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 17,
    color: COLORS.red,
  },
});
