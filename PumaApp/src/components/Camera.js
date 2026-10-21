import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Host, Button} from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, buttonBorderShape } from '@expo/ui/swift-ui/modifiers';


export default function App() {
  const router = useRouter();
  const ref = useRef(null);

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) {
      // Gå tillbaka till CreatePlace och skicka med bildens uri
      router.navigate({
        pathname: '/map/createPlace',
        params: { photoUri: photo.uri },
      });
    }
  };

  useEffect(() => {
  // Fråga bara om tillåtelse har inte getts och det fortfarande går att fråga
  if (permission && !permission.granted && permission.canAskAgain) {
    requestPermission();
  }
}, [permission]);

if (!permission || !permission.granted) {
  // Väntar på tillåtelse, eller så nekades den: visa svart skärm
  return <View style={{ flex: 1, backgroundColor: 'black' }} />;
}

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }


  return (
    <View style={styles.container}>
      <CameraView ref={ref} style={styles.camera} facing={facing} />
      <View style={styles.buttonContainer}>
        <Host matchContents>
            <Button
            label="Vänd kamera"
            onPress={toggleCameraFacing}
            //shape={Shape.Circle()}
            modifiers={[buttonStyle('bordered'), controlSize('large'), buttonBorderShape('circle')]}
            />
        </Host>
          <Host matchContents>
            <Button
            label="Ta bild"
            onPress={takePicture}
            //shape={Shape.Circle()}
            modifiers={[buttonStyle('bordered'), controlSize('large'), buttonBorderShape('circle')]}
            />
        </Host>
      </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  label: {

  },
    buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },

});