import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityMap, Coordinate } from '../ActivityMap';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

// Pembungkus peta OSM gratis (Leaflet + OpenStreetMap, tanpa API key / billing).
// Meneruskan status interaksi agar induk bisa mengunci ScrollView saat peta digeser.
export const OsmMapPanel: React.FC<{
  currentLocation: Coordinate | null;
  route: Coordinate[];
  isTracking: boolean;
  accuracy: number | null;
  speedKmh: number;
  distanceMeters: number;
  onInteractionChange?: (interacting: boolean) => void;
}> = ({ currentLocation, route, isTracking, accuracy, speedKmh, distanceMeters, onInteractionChange }) => {
  return (
    <View style={styles.frame}>
      <ActivityMap
        currentLocation={currentLocation}
        routeCoordinates={route}
        isTracking={isTracking}
        accuracy={accuracy}
        speedKmh={speedKmh}
        distanceMeters={distanceMeters}
        onInteractionChange={onInteractionChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
});
