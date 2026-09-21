import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle, Polyline as SvgPolyline, Line, Rect } from 'react-native-svg';
import { MapPin, Navigation } from 'lucide-react-native';
import { ActivityMapProps } from './ActivityMap';

export const ActivityMap: React.FC<ActivityMapProps> = ({
  currentLocation,
  routeCoordinates,
  isTracking,
  accuracy,
}) => {
  // Normalize GPS coordinates to a 100x100 SVG viewbox
  const getSvgPoints = () => {
    if (routeCoordinates.length === 0) return '';
    const lats = routeCoordinates.map((c) => c.latitude);
    const lons = routeCoordinates.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latSpan = maxLat - minLat || 0.0001;
    const lonSpan = maxLon - minLon || 0.0001;

    return routeCoordinates
      .map((c) => {
        const x = 15 + ((c.longitude - minLon) / lonSpan) * 70;
        // Invert Y because latitude goes north (up) but SVG Y goes down
        const y = 85 - ((c.latitude - minLat) / latSpan) * 70;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const pointsString = getSvgPoints();

  return (
    <View style={styles.container}>
      {/* Grid Pattern Background */}
      <Svg style={styles.mapCanvas} viewBox="0 0 100 100">
        <Rect x="0" y="0" width="100" height="100" fill="#0F172A" />
        {/* Subtle grid lines */}
        <Line x1="25" y1="0" x2="25" y2="100" stroke="#1E293B" strokeWidth="0.5" />
        <Line x1="50" y1="0" x2="50" y2="100" stroke="#1E293B" strokeWidth="0.5" />
        <Line x1="75" y1="0" x2="75" y2="100" stroke="#1E293B" strokeWidth="0.5" />
        <Line x1="0" y1="25" x2="100" y2="25" stroke="#1E293B" strokeWidth="0.5" />
        <Line x1="0" y1="50" x2="100" y2="50" stroke="#1E293B" strokeWidth="0.5" />
        <Line x1="0" y1="75" x2="100" y2="75" stroke="#1E293B" strokeWidth="0.5" />

        {/* Real-time Route Trail */}
        {pointsString.length > 0 && (
          <SvgPolyline
            points={pointsString}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Center / Pulse Marker */}
        <Circle cx="50" cy="50" r="4" fill="#10B981" opacity={0.3} />
        <Circle cx="50" cy="50" r="2" fill="#10B981" />
      </Svg>

      {/* Floating Header */}
      <View style={styles.webHeader}>
        <View style={styles.webTag}>
          <Navigation size={12} color="#10B981" />
          <Text style={styles.webTagText}>RADAR RUTE GPS</Text>
        </View>
        <Text style={styles.webCoordText}>
          {currentLocation
            ? `${currentLocation.latitude.toFixed(4)}°, ${currentLocation.longitude.toFixed(4)}°`
            : 'Menunggu sinyal GPS...'}
        </Text>
      </View>

      {/* Bottom Status Bar */}
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
              ? `Melacak Rute (${routeCoordinates.length} titik koordinat)`
              : 'Sensor Siap'}
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
  mapCanvas: {
    ...StyleSheet.absoluteFill,
  },
  webHeader: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  webTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  webTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  webCoordText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
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
