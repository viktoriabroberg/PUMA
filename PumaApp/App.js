import React from 'react';
import { StyleSheet, View } from 'react-native';
import Map from './src/screens/Map';

export default function App() {
  return (
    <View style={styles.container}>
      <Map />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});