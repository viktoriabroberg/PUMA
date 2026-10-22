import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { COLORS } from '../constants/colors';
import { CARD_SHADOW } from '../constants/shadows';
import { hasCategory } from '../services/FilterService';

const ICONS = {
  mushroom: require('../../assets/pins/mushroom.png'),
  berries: require('../../assets/pins/berries.png'),
  mushroomAndBerries: require('../../assets/pins/mushroomAndBerries.png'),
};

// Väljer ikon efter vilka arter som finns på platsen. Svamp är standard om platsen saknar arter.
const getIconKey = (place) => {
  const mushroom = hasCategory(place, 'svamp');
  const berries = hasCategory(place, 'bar');
  if (mushroom && berries) return 'mushroomAndBerries';
  if (berries) return 'berries';
  return 'mushroom';
};

// Gemensam pin för platser på kartorna: cirkel med bild och en spets nedåt
export default function PlacePin({ place, onPress }) {
  const iconKey = getIconKey(place);

  // Följ vyändringar tills bilden laddats, sedan av för bättre prestanda
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  // Rita om när ikonen byts, t.ex. efter att platsen redigerats
  useEffect(() => {
    setTracksViewChanges(true);
  }, [iconKey]);

  return (
    <Marker
      coordinate={{
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
      }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
    >
      <View style={styles.wrapper}>
        <View style={styles.circle}>
          <Image
            key={iconKey}
            source={ICONS[iconKey]}
            style={styles.icon}
            resizeMode="contain"
            onLoad={() => setTracksViewChanges(false)}
          />
        </View>
        <View style={styles.tip} />
      </View>
    </Marker>
  );
}

const CIRCLE_SIZE = 44;

const styles = StyleSheet.create({
  // Lite marginal så att skuggan inte klipps
  wrapper: {
    alignItems: 'center',
    padding: 4,
    paddingBottom: 0, // spetsen ska peka exakt på platsen
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: CARD_SHADOW,
  },
  icon: {
    width: 50,
    height: 50,
  },
  // Triangel byggd med kanter
  tip: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.green,
  },
});
