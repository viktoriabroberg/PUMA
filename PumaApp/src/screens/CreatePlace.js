import { useRouter } from 'expo-router';
import { Host, Button, Form, TextField, Section, HStack,useNativeState } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, scrollContentBackground, background, submitLabel, onSubmit} from '@expo/ui/swift-ui/modifiers';
import { createPlaceFunction} from '../services/CreatePlaceService';


export default function CreatePlace() {
  const router = useRouter();
  const nameState = useNativeState('');
  const noteState = useNativeState('');
  
  async function save(){
    const placeName = nameState.value.trim();
    const placeNote = noteState.value.trim();
    try{
        await createPlaceFunction({placeName: placeName, note: placeNote});
        router.back();
    }catch(e){
        alert(e.message);
    }

  }


  return (
    <Host style={{ flex: 1 }}>
      <Form
        modifiers={[
          scrollContentBackground('hidden'),
          background('#F0F0F0'),
        ]}>
        <Section title="Foto">
         <Button
            label="Ta bild"
            onPress={() => router.push('/map/createPlace/camera')}
            modifiers={[buttonStyle('bordered'), controlSize('large')]}
        />
        </Section>
        <Section title="Namn">
            <TextField
                placeholder="Namn på plats"
                text={nameState}
                modifiers={[
                onSubmit(() =>
                    {createPlaceFunction}
                ),
                ]}
            />
        </Section>
        <Section title = "Kategorier">
            <HStack>
                <Button
                    label="Kantarell"
                    onPress={() => alert('Du klickade kantarell')}
                    modifiers={[buttonStyle('bordered'), controlSize('large')]}
                />
                <Button
                    label="Trattkantarell"
                    onPress={() => alert('Du klickade Trattkantarell')}
                    modifiers={[buttonStyle('bordered'), controlSize('large')]}
                />
                <Button
                    label="Trumpetsvamp"
                    onPress={() => alert('Du klickade Trattkantarell')}
                    modifiers={[buttonStyle('bordered'), controlSize('large')]}
                />
            </HStack>

            <HStack>
                <Button
                    label="Blåbär"
                    onPress={() => alert('Du klickade Blåbär')}
                    modifiers={[buttonStyle('bordered'), controlSize('large')]}
                />
                <Button
                    label="Lingon"
                    onPress={() => alert('Du klickade lingon')}
                    modifiers={[buttonStyle('bordered'), controlSize('large')]}
                />
                
            </HStack>

        </Section>
        <Section title = "Mängd">
            <HStack spacing={12}>
                <Button
                    label="Sparsamt"
                    onPress={() => alert('Sparsamt')}
                    modifiers={[buttonStyle('bordered'), controlSize('large')]}
                />
                <Button
                    label="Måttligt"
                    onPress={() => alert('Måttligt')}
                    modifiers={[buttonStyle('bordered'), controlSize('large')]}
                />
                <Button
                    label="Rikligt"
                    onPress={() => alert('Rikligt')}
                    modifiers={[buttonStyle('bordered'), controlSize('large')]}
                />

            </HStack>

        </Section>

        <Section title="Anteckningar">
            <TextField
                placeholder="Anteckningar från plats.."
                text={noteState}
                modifiers={[
                onSubmit(() =>
                    {createPlaceFunction}
                ),
                ]}
            />
        </Section>
        <Section >
            <Button
                label="Spara"
                onPress={save}
                modifiers={[buttonStyle('bordered'), controlSize('large')]}
            />
        </Section>
      </Form>
    </Host>
  );
}
