import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Crosshair, MapPin } from 'lucide-react-native';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface ActivityMapProps {
  currentLocation: Coordinate | null;
  routeCoordinates: Coordinate[];
  isTracking: boolean;
  accuracy?: number | null;
}

// Dark athletic map styling for high-contrast visibility
const athleticMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1E293B' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0F172A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#E2E8F0' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748B' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1E293B' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#CBD5E1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0B1C30' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748B' }],
  },
];

export const ActivityMap: React.FC<ActivityMapProps> = ({
  currentLocation,
  routeCoordinates,
  isTracking,
  accuracy,
}) => {
  const mapRef = useRef<MapView | null>(null);

  // Default coordinate (Jakarta) if location is still resolving
  const defaultCoord: Coordinate = {
    latitude: -6.2088,
    longitude: 106.8456,
  };

  const activePosition = currentLocation || (routeCoordinates.length > 0 ? routeCoordinates[routeCoordinates.length - 1] : defaultCoord);

  // Auto-recenter map when active tracking updates
  useEffect(() => {
    if (isTracking && currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500
      );
    }
  }, [currentLocation, isTracking]);

  const handleRecenter = () => {
    if (activePosition && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: activePosition.latitude,
          longitude: activePosition.longitude,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        },
        600
      );
    }
  };

  const startPoint = routeCoordinates.length > 0 ? routeCoordinates[0] : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        customMapStyle={athleticMapStyle}
        showsUserLocation={false}
        showsCompass={true}
        showsScale={true}
        initialRegion={{
          latitude: activePosition.latitude,
          longitude: activePosition.longitude,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        }}
      >
        {/* Real-time GPS Breadcrumb Trail */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#10B981"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Start Marker */}
        {startPoint && (
          <Marker
            coordinate={startPoint}
            title="Titik Awal"
            description="Mulai aktivitas di sini"
          >
            <View style={styles.startMarker}>
              <View style={styles.startInner} />
            </View>
          </Marker>
        )}

        {/* Live User Position Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Posisi Anda"
            description={accuracy ? `Akurasi ±${accuracy}m` : undefined}
          >
            <View style={styles.liveMarkerContainer}>
              <View style={styles.liveMarkerRadar} />
              <View style={styles.liveMarkerCenter} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Map Control Floating Overlay */}
      <View style={styles.controlsOverlay}>
        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={handleRecenter}
          activeOpacity={0.8}
        >
          <Crosshair size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Bottom Status Pill */}
      <View style={styles.statusBar}>
        <View style={styles.statusDotRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isTracking ? '#10B981' : '#F59E0B' },
            ]}
          />
          <Text style={styles.statusText}>
            {isTracking
              ? `Melacak Rute (${routeCoordinates.length} titik)`
              : 'Peta Siap'}
          </Text>
        </View>
        {accuracy !== undefined && accuracy !== null && (
          <Text style={styles.accuracyText}>Akurasi: ±{accuracy}m</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 220,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 10,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  controlsOverlay: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  recenterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  startInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  liveMarkerContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveMarkerRadar: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
  },
  liveMarkerCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  accuracyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
