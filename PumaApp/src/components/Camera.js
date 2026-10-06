import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Host, Button} from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, buttonBorderShape } from '@expo/ui/swift-ui/modifiers';


export default function App() {

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();

  const takePicture = async () => {
  const photo = await ref.current?.takePictureAsync();
  if (photo?.uri) setUri(photo.uri);
  };

  if (!permission) {
    // Väntar på tillåtelse till kamera.
    return <View />;
  }

  if (!permission.granted) {
    //Om tillåtels till kamera inte ges.
    return (
      <View style={styles.container}>
        <Host>
            <Button onPress={requestPermission} title="grant permission" />
        </Host>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }


  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} />
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
    paddingHorizontal: 250,
  },

});