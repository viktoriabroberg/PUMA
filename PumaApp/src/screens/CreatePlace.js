import { useRouter } from 'expo-router';
import { Button, View } from 'react-native';

export default function CreatePlace() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title="Ta bild"
        onPress={() => router.push('/map/createPlace/camera')}
      />
    </View>
  );
}