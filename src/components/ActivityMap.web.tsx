import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ActivityMapProps, Coordinate } from './ActivityMap';

export const ActivityMap: React.FC<ActivityMapProps> = ({
  currentLocation,
  routeCoordinates,
  isTracking,
  accuracy,
  speedKmh = 0,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Fallback coordinate (Monas / Jakarta Pusat) bila GPS belum resolving
  const fallbackCoord: Coordinate = {
    latitude: -6.1754,
    longitude: 106.8272,
  };

  const activePosition =
    currentLocation ||
    (routeCoordinates.length > 0
      ? routeCoordinates[routeCoordinates.length - 1]
      : fallbackCoord);

  // Kirim update koordinat realtime ke Leaflet OpenStreetMap di dalam iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_COORDS',
          currentLocation,
          routeCoordinates,
          isTracking,
        },
        '*'
      );
    }
  }, [currentLocation, routeCoordinates, isTracking]);

  // Siapkan HTML mandiri Leaflet OpenStreetMap
  const initialHtml = useMemo(() => {
    const lat = activePosition.latitude;
    const lon = activePosition.longitude;
    const coordsJson = JSON.stringify(
      routeCoordinates.map((c) => [c.latitude, c.longitude])
    );
    const startJson =
      routeCoordinates.length > 0
        ? JSON.stringify([routeCoordinates[0].latitude, routeCoordinates[0].longitude])
        : 'null';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .runner-marker {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #10B981;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 15px #10B981, 0 0 25px rgba(16, 185, 129, 0.7);
    }
    .start-badge {
      background: #059669;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 800;
      padding: 3px 6px;
      border-radius: 4px;
      border: 1.5px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      white-space: nowrap;
    }
    .leaflet-control-zoom {
      border: none !important;
      border-radius: 10px !important;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lon}], 16);
    
    // Gunakan tile OpenStreetMap dengan nama jalan, gang, dan landmark lengkap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    var polyline = L.polyline(${coordsJson}, {
      color: '#10B981',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    var startCoords = ${startJson};
    var startMarker = startCoords ? L.marker(startCoords, {
      icon: L.divIcon({ className: '', html: '<div class="start-badge">MULAI</div>', iconSize: [46, 20], iconAnchor: [23, 10] })
    }).addTo(map) : null;

    var runnerMarker = L.marker([${lat}, ${lon}], {
      icon: L.divIcon({ className: '', html: '<div class="runner-marker"></div>', iconSize: [22, 22], iconAnchor: [11, 11] })
    }).addTo(map);

    window.addEventListener('message', function(e) {
      if (!e.data || e.data.type !== 'UPDATE_COORDS') return;
      var cur = e.data.currentLocation;
      var route = e.data.routeCoordinates;
      if (cur) {
        runnerMarker.setLatLng([cur.latitude, cur.longitude]);
        map.panTo([cur.latitude, cur.longitude], { animate: true, duration: 0.6 });
      }
      if (route && route.length > 0) {
        var latlngs = route.map(function(c) { return [c.latitude, c.longitude]; });
        polyline.setLatLngs(latlngs);
        if (!startMarker && route.length > 0) {
          startMarker = L.marker([route[0].latitude, route[0].longitude], {
            icon: L.divIcon({ className: '', html: '<div class="start-badge">MULAI</div>', iconSize: [46, 20], iconAnchor: [23, 10] })
          }).addTo(map);
        }
      }
    });
  </script>
</body>
</html>`;
  }, [activePosition.latitude, activePosition.longitude]);

  return (
    <View style={styles.container}>
      {/* Real OpenStreetMap Leaflet Canvas via iframe on Web */}
      {React.createElement('iframe', {
        ref: iframeRef,
        srcDoc: initialHtml,
        style: {
          width: '100%',
          height: '100%',
          border: 'none',
        },
        title: 'OpenStreetMap GPS Route Tracker',
      })}

      {/* Top Tracking Status HUD */}
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
              ? `Melacak Rute (${routeCoordinates.length} titik GPS)`
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

      {/* Bottom Information Footer */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomBarText}>
          {isTracking
            ? `🟢 Rute GPS Aktif • Kecepatan: ${speedKmh} km/jam`
            : 'Peta OpenStreetMap Aktif • Tekan "Mulai Aktivitas" untuk melacak'}
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
  topHud: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    pointerEvents: 'none',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  },
  bottomBarText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
