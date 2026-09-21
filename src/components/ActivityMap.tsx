import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT, MapType } from 'react-native-maps';
import { Crosshair, Layers, Plus, Minus, Navigation, MapPin } from 'lucide-react-native';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface ActivityMapProps {
  currentLocation: Coordinate | null;
  routeCoordinates: Coordinate[];
  isTracking: boolean;
  accuracy?: number | null;
  speedKmh?: number;
}

export const ActivityMap: React.FC<ActivityMapProps> = ({
  currentLocation,
  routeCoordinates,
  isTracking,
  accuracy,
  speedKmh = 0,
}) => {
  const mapRef = useRef<MapView | null>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [delta, setDelta] = useState<number>(0.0035);

  // Default coordinate (Pusat Kota / Monas) bila lokasi awal masih resolving
  const fallbackCoord: Coordinate = {
    latitude: -6.1754,
    longitude: 106.8272,
  };

  const activePosition =
    currentLocation ||
    (routeCoordinates.length > 0
      ? routeCoordinates[routeCoordinates.length - 1]
      : fallbackCoord);

  // Otomatis menggeser kamera peta mengikuti pergerakan pengguna saat tracking aktif
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: delta,
          longitudeDelta: delta,
        },
        600
      );
    }
  }, [currentLocation, isTracking]);

  // Pusatkan kembali kamera ke koordinat terkini
  const handleRecenter = () => {
    if (activePosition && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: activePosition.latitude,
          longitude: activePosition.longitude,
          latitudeDelta: delta,
          longitudeDelta: delta,
        },
        500
      );
    }
  };

  // Zoom In
  const handleZoomIn = () => {
    const newDelta = Math.max(0.001, delta * 0.6);
    setDelta(newDelta);
    if (activePosition && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: activePosition.latitude,
          longitude: activePosition.longitude,
          latitudeDelta: newDelta,
          longitudeDelta: newDelta,
        },
        300
      );
    }
  };

  // Zoom Out
  const handleZoomOut = () => {
    const newDelta = Math.min(0.05, delta * 1.6);
    setDelta(newDelta);
    if (activePosition && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: activePosition.latitude,
          longitude: activePosition.longitude,
          latitudeDelta: newDelta,
          longitudeDelta: newDelta,
        },
        300
      );
    }
  };

  // Ganti tipe peta (Jalan Standar / Satelit)
  const toggleMapType = () => {
    setMapType((prev) => (prev === 'standard' ? 'hybrid' : 'standard'));
  };

  const startPoint = routeCoordinates.length > 0 ? routeCoordinates[0] : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsIndoors={true}
        initialRegion={{
          latitude: activePosition.latitude,
          longitude: activePosition.longitude,
          latitudeDelta: delta,
          longitudeDelta: delta,
        }}
      >
        {/* Layer 1: Glow / Bayangan Jalur GPS */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="rgba(16, 185, 129, 0.4)"
            strokeWidth={10}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Layer 2: Garis Jalur GPS Solid Emerald Hijau */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#10B981"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Pin Titik Mulai (Start Marker) */}
        {startPoint && (
          <Marker
            coordinate={startPoint}
            title="Titik Mulai"
            description="Aktivitas diawali dari sini"
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.startMarkerContainer}>
              <View style={styles.startPill}>
                <Text style={styles.startPillText}>MULAI</Text>
              </View>
              <View style={styles.startPinTip} />
            </View>
          </Marker>
        )}

        {/* Pin Posisi Terkini / Pelari */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Posisi Terkini Anda"
            description={
              isTracking
                ? `Kecepatan: ${speedKmh} km/jam • Akurasi ±${accuracy || 0}m`
                : 'Posisi Siap'
            }
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.liveMarkerContainer}>
              <View style={styles.liveMarkerAura} />
              <View style={styles.liveMarkerDot}>
                <Navigation size={12} color="#FFFFFF" style={{ transform: [{ rotate: '45deg' }] }} />
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Baris Status Atas (HUD Pelacakan) */}
      <View style={styles.topHud}>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusPulse,
              { backgroundColor: isTracking ? '#10B981' : '#F59E0B' },
            ]}
          />
          <Text style={styles.statusPillText}>
            {isTracking
              ? `Melacak Rute (${routeCoordinates.length} titik)`
              : currentLocation
              ? 'GPS Terkunci • Siap'
              : 'Mencari Sinyal GPS...'}
          </Text>
        </View>

        {accuracy !== undefined && accuracy !== null && (
          <View style={styles.accuracyPill}>
            <Text style={styles.accuracyPillText}>Akurasi: ±{accuracy}m</Text>
          </View>
        )}
      </View>

      {/* Kontrol Mengambang (Recenter, Map Type, Zoom) */}
      <View style={styles.controlsGroup}>
        {/* Toggle Tipe Peta (Jalan / Satelit) */}
        <TouchableOpacity
          style={[styles.ctrlBtn, mapType === 'hybrid' && styles.ctrlBtnActive]}
          onPress={toggleMapType}
          activeOpacity={0.8}
        >
          <Layers size={18} color={mapType === 'hybrid' ? '#10B981' : '#1E293B'} />
        </TouchableOpacity>

        {/* Recenter ke Lokasi Saya */}
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={handleRecenter}
          activeOpacity={0.8}
        >
          <Crosshair size={18} color="#0F172A" />
        </TouchableOpacity>

        {/* Zoom In */}
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={handleZoomIn}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#0F172A" />
        </TouchableOpacity>

        {/* Zoom Out */}
        <TouchableOpacity
          style={styles.ctrlBtn}
          onPress={handleZoomOut}
          activeOpacity={0.8}
        >
          <Minus size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Label Keterangan Bawah */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomBarText}>
          {isTracking
            ? '🟢 Garis hijau menggambar rute jalan / lari Anda secara langsung'
            : 'Tekan "Mulai Aktivitas" untuk merekam jejak langkah & rute'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 280,
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    marginVertical: 12,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  topHud: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  accuracyPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  accuracyPillText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  controlsGroup: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  ctrlBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  ctrlBtnActive: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  startMarkerContainer: {
    alignItems: 'center',
  },
  startPill: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  startPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  startPinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#059669',
  },
  liveMarkerContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveMarkerAura: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  liveMarkerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomBarText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
