import React, { useEffect, useRef, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Crosshair, Layers, MapPin } from 'lucide-react-native';
import { ActivityMapProps, Coordinate } from './ActivityMap';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const TILE_STREET =
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
// Esri World Imagery (satelit) — gratis tanpa API key. Catatan urutan {z}/{y}/{x}.
const TILE_SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Varian web: iframe Leaflet OpenStreetMap (tetap gratis, tanpa API key).
export const ActivityMap: React.FC<ActivityMapProps> = ({
  currentLocation,
  routeCoordinates,
  isTracking,
  onInteractionChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [satellite, setSatellite] = useState(false);

  const fallbackCoord: Coordinate = { latitude: -6.1754, longitude: 106.8272 };
  const activePosition =
    currentLocation ||
    (routeCoordinates.length > 0 ? routeCoordinates[routeCoordinates.length - 1] : fallbackCoord);

  // Snapshot props terbaru agar handler load bisa sinkron tanpa mengubah srcDoc.
  const stateRef = useRef({ currentLocation, routeCoordinates, isTracking, satellite });
  useEffect(() => {
    stateRef.current = { currentLocation, routeCoordinates, isTracking, satellite };
  });

  const post = (msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  };

  useEffect(() => {
    post({ type: 'UPDATE_COORDS', currentLocation, routeCoordinates, isTracking });
  }, [currentLocation, routeCoordinates, isTracking]);

  // HTML dibangun SEKALI: srcDoc yang berubah = iframe reload total
  // (peta reset ke pusat, layer satelit hilah, gestur terputus tiap tick GPS).
  const initialHtml = useMemo(() => {
    const lat = activePosition.latitude;
    const lon = activePosition.longitude;
    const coordsJson = JSON.stringify(routeCoordinates.map((c) => [c.latitude, c.longitude]));
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
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #E5EEFF; }
    .leaflet-control-container { display: none !important; }
    .runner-marker { width: 20px; height: 20px; border-radius: 50%; background: #006948; border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .start-badge { background: #006948; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; border: 2px solid #FFFFFF; white-space: nowrap; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try { window.parent.__mapBootCount = (window.parent.__mapBootCount || 0) + 1; } catch (e) {}
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lon}], 16);
    var base = L.tileLayer('${TILE_STREET}', { maxZoom: 19, subdomains: 'abc' }).addTo(map);
    var following = true;
    map.on('dragstart zoomstart', function() { following = false; });

    var glow = L.polyline(${coordsJson}, { color: '#10b981', weight: 10, opacity: 0.95, lineCap: 'round' }).addTo(map);
    var line = L.polyline(${coordsJson}, { color: '#0B1C30', weight: 5, lineCap: 'round' }).addTo(map);

    var startCoords = ${startJson};
    var startMarker = startCoords ? L.marker(startCoords, {
      icon: L.divIcon({ className: '', html: '<div class="start-badge">MULAI</div>', iconSize: [56, 22], iconAnchor: [28, 22] })
    }).addTo(map) : null;

    var runnerMarker = L.marker([${lat}, ${lon}], {
      icon: L.divIcon({ className: '', html: '<div class="runner-marker"></div>', iconSize: [20, 20], iconAnchor: [10, 10] })
    }).addTo(map);

    window.addEventListener('message', function(e) {
      var d = e.data || {};
      if (d.type === 'RECENTER') {
        if (d.lat != null) {
          following = true;
          map.setView([d.lat, d.lon], 16, { animate: true, duration: 0.5 });
        }
      } else if (d.type === 'SET_LAYER') {
        base.setUrl(d.url);
      } else if (d.type === 'UPDATE_COORDS') {
        var cur = d.currentLocation;
        var route = d.routeCoordinates;
        if (cur) {
          runnerMarker.setLatLng([cur.latitude, cur.longitude]);
          if (d.isTracking && following) {
            map.panTo([cur.latitude, cur.longitude], { animate: true, duration: 0.5 });
          }
        }
        if (route && route.length > 0) {
          var latlngs = route.map(function(c) { return [c.latitude, c.longitude]; });
          glow.setLatLngs(latlngs);
          line.setLatLngs(latlngs);
          if (!startMarker && route.length > 0) {
            startMarker = L.marker([route[0].latitude, route[0].longitude], {
              icon: L.divIcon({ className: '', html: '<div class="start-badge">MULAI</div>', iconSize: [56, 22], iconAnchor: [28, 22] })
            }).addTo(map);
          }
        }
      }
    });
  </script>
  </body>
</html>`;
  }, []);

  // Sinkronkan setiap kali iframe (selesai) load: kirim state terkini + layer satelit.
  const handleLoad = () => {
    const s = stateRef.current;
    post({
      type: 'UPDATE_COORDS',
      currentLocation: s.currentLocation,
      routeCoordinates: s.routeCoordinates,
      isTracking: s.isTracking,
    });
    if (s.satellite) post({ type: 'SET_LAYER', url: TILE_SATELLITE });
  };

  return (
    <View
      style={styles.container}
      onTouchStart={() => onInteractionChange?.(true)}
      onTouchEnd={() => setTimeout(() => onInteractionChange?.(false), 250)}
      onTouchCancel={() => onInteractionChange?.(false)}
    >
      {React.createElement('iframe', {
        ref: iframeRef,
        srcDoc: initialHtml,
        onLoad: handleLoad,
        style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
        title: 'OpenStreetMap GPS Route Tracker',
      })}

      <View style={[styles.chip, { pointerEvents: 'none' }]}>
        <MapPin size={13} color={satellite ? colors.warning : colors.primary} />
        <Text style={styles.chipText}>{satellite ? 'Satelit · Esri' : 'OpenStreetMap'}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.ctrlBtn}
          activeOpacity={0.85}
          onPress={() =>
            post({ type: 'RECENTER', lat: activePosition.latitude, lon: activePosition.longitude })
          }
        >
          <Crosshair size={17} color={colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity
          testID="map-layers"
          accessibilityLabel="Ganti lapisan peta"
          style={styles.ctrlBtn}
          activeOpacity={0.85}
          onPress={() => {
            setSatellite((v) => {
              const next = !v;
              post({ type: 'SET_LAYER', url: next ? TILE_SATELLITE : TILE_STREET });
              return next;
            });
          }}
        >
          <Layers size={17} color={satellite ? colors.primary : colors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
  },
  chip: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceLowest,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    boxShadow: '0 2px 6px rgba(11,28,48,0.16)',
  },
  chipText: { fontSize: 11, fontFamily: fonts.bold, color: colors.onSurface },
  controls: { position: 'absolute', top: 10, right: 10, gap: 8 },
  ctrlBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceLowest,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(11,28,48,0.16)',
  },
});
