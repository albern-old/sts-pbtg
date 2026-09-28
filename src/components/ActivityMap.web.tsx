import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityMapProps, Coordinate } from './ActivityMap';
import { colors } from '../theme/colors';

// Varian web: iframe Leaflet OpenStreetMap (tetap gratis, tanpa API key).
export const ActivityMap: React.FC<ActivityMapProps> = ({
  currentLocation,
  routeCoordinates,
  isTracking,
  onInteractionChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const fallbackCoord: Coordinate = { latitude: -6.1754, longitude: 106.8272 };
  const activePosition =
    currentLocation ||
    (routeCoordinates.length > 0 ? routeCoordinates[routeCoordinates.length - 1] : fallbackCoord);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'UPDATE_COORDS', currentLocation, routeCoordinates, isTracking },
        '*',
      );
    }
  }, [currentLocation, routeCoordinates, isTracking]);

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
    .runner-marker { width: 20px; height: 20px; border-radius: 50%; background: #006948; border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .start-badge { background: #006948; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; border: 2px solid #FFFFFF; white-space: nowrap; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lon}], 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19, subdomains: 'abcd'
    }).addTo(map);

    var glow = L.polyline(${coordsJson}, { color: '#10b981', weight: 9, opacity: 0.9, lineCap: 'round' }).addTo(map);
    var line = L.polyline(${coordsJson}, { color: '#0b1c30', weight: 5, lineCap: 'round' }).addTo(map);

    var startCoords = ${startJson};
    var startMarker = startCoords ? L.marker(startCoords, {
      icon: L.divIcon({ className: '', html: '<div class="start-badge">MULAI</div>', iconSize: [56, 22], iconAnchor: [28, 22] })
    }).addTo(map) : null;

    var runnerMarker = L.marker([${lat}, ${lon}], {
      icon: L.divIcon({ className: '', html: '<div class="runner-marker"></div>', iconSize: [20, 20], iconAnchor: [10, 10] })
    }).addTo(map);

    window.addEventListener('message', function(e) {
      if (!e.data || e.data.type !== 'UPDATE_COORDS') return;
      var cur = e.data.currentLocation;
      var route = e.data.routeCoordinates;
      if (cur) {
        runnerMarker.setLatLng([cur.latitude, cur.longitude]);
        if (e.data.isTracking) map.panTo([cur.latitude, cur.longitude], { animate: true, duration: 0.5 });
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
    });
  </script>
</body>
</html>`;
  }, [activePosition.latitude, activePosition.longitude]);

  return (
    <View style={styles.container}>
      {React.createElement('iframe', {
        ref: iframeRef,
        srcDoc: initialHtml,
        style: { width: '100%', height: '100%', border: 'none' },
        title: 'OpenStreetMap GPS Route Tracker',
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surfaceContainer,
  },
});
