import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import Supercluster from 'supercluster';
import PlacePin from './PlacePin';
import { COLORS } from '../constants/colors';
import { CARD_SHADOW } from '../constants/shadows';

// Hur nära (i pixlar) pins måste ligga för att slås ihop
const CLUSTER_RADIUS = 30;
const MAX_ZOOM = 20;

// Kartans zoomnivå räknas fram ur hur många longitudgrader som syns
const regionToZoom = (region) =>
  Math.round(Math.log2(360 / region.longitudeDelta));

const zoomToDelta = (zoom) => 360 / Math.pow(2, zoom);

// Ritar platsernas pins, och slår ihop pins som ligger nära varandra till en pin med en siffra
export default function PlaceMarkers({ places, region, mapRef, onPressPlace }) {
  const index = useMemo(() => {
    const cluster = new Supercluster({ radius: CLUSTER_RADIUS, maxZoom: MAX_ZOOM });
    cluster.load(
      places.map((place) => ({
        type: 'Feature',
        properties: { place },
        geometry: {
          type: 'Point',
          coordinates: [Number(place.longitude), Number(place.latitude)],
        },
      }))
    );
    return cluster;
  }, [places]);

  if (!region) return null;

  const bbox = [
    region.longitude - region.longitudeDelta / 2,
    region.latitude - region.latitudeDelta / 2,
    region.longitude + region.longitudeDelta / 2,
    region.latitude + region.latitudeDelta / 2,
  ];
  const items = index.getClusters(bbox, regionToZoom(region));

  // Zooma in så att klustret delas upp
  const expandCluster = (item) => {
    const [longitude, latitude] = item.geometry.coordinates;
    const zoom = Math.min(index.getClusterExpansionZoom(item.properties.cluster_id), MAX_ZOOM);
    const delta = zoomToDelta(zoom);
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta },
      400
    );
  };

  return items.map((item) => {
    if (item.properties.cluster) {
      return (
        <ClusterPin
          key={`cluster-${item.properties.cluster_id}`}
          item={item}
          onPress={() => expandCluster(item)}
        />
      );
    }

    const { place } = item.properties;
    return (
      <PlacePin
        key={place.location_id}
        place={place}
        onPress={() => onPressPlace(place)}
      />
    );
  });
}

function ClusterPin({ item, onPress }) {
  const [longitude, latitude] = item.geometry.coordinates;

  // Ge texten tid att ritas innan markören slutar uppdateras
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
    >
      <View style={styles.wrapper}>
        <View style={styles.circle}>
          <Text style={styles.count}>{item.properties.point_count}</Text>
        </View>
      </View>
    </Marker>
  );
}

const CIRCLE_SIZE = 44;

const styles = StyleSheet.create({
  // Lite marginal så att skuggan inte klipps
  wrapper: {
    padding: 4,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: COLORS.green,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: CARD_SHADOW,
  },
  count: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
