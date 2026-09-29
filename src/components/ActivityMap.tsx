import React, { useRef, useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Crosshair, Layers, MapPin } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

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
  distanceMeters?: number;
  onInteractionChange?: (isInteracting: boolean) => void;
}

const TILE_STREET =
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
// Esri World Imagery (satelit) — gratis tanpa API key. Catatan urutan {z}/{y}/{x}.
const TILE_SATELLITE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Peta OpenStreetMap (Leaflet) via WebView — gratis, tanpa API key.
// Rute bergaya desain: inti gelap di atas cahaya hijau.
export const ActivityMap: React.FC<ActivityMapProps> = ({
  currentLocation,
  routeCoordinates,
  isTracking,
  onInteractionChange,
}) => {
  const webViewRef = useRef<WebView | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [satellite, setSatellite] = useState(false);

  const fallbackCoord: Coordinate = useMemo(
    () => ({ latitude: -6.1754, longitude: 106.8272 }),
    [],
  );

  const activePosition =
    currentLocation ||
    (routeCoordinates.length > 0 ? routeCoordinates[routeCoordinates.length - 1] : fallbackCoord);

  const inject = (js: string) => {
    if (loaded) webViewRef.current?.injectJavaScript(`${js}\ntrue;`);
  };

  useEffect(() => {
    if (currentLocation) {
      inject(
        `if (window.updatePosition) window.updatePosition(${currentLocation.latitude}, ${currentLocation.longitude}, ${isTracking});`,
      );
    }
  }, [currentLocation, isTracking, loaded]);

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      inject(`if (window.updateRoute) window.updateRoute(${JSON.stringify(routeCoordinates)});`);
    }
  }, [routeCoordinates, loaded]);

  const recenter = () => {
    inject(
      `if (window.recenter) window.recenter(${activePosition.latitude}, ${activePosition.longitude});`,
    );
    onInteractionChange?.(false);
  };

  const toggleBasemap = () => {
    setSatellite((v) => {
      const next = !v;
      inject(
        `if (window.setBaseLayer) window.setBaseLayer('${next ? TILE_SATELLITE : TILE_STREET}');`,
      );
      return next;
    });
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'INTERACTION_START') onInteractionChange?.(true);
      else if (data.type === 'INTERACTION_END') onInteractionChange?.(false);
    } catch {
      // abaikan pesan non-JSON
    }
  };

  // HTML dibangun SEKALI (pusat/titik awal = posisi saat mount). Update berikutnya
  // lewat injectJavaScript — source yang berubah tiap tick GPS membuat WebView reload
  // total (peta tak bisa digeser & layer satelit reset).
  const leafletHtml = useMemo(() => {
    const lat = activePosition.latitude;
    const lng = activePosition.longitude;
    const initialRouteJson = JSON.stringify(routeCoordinates);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body {
      width: 100%; height: 100%; overflow: hidden; touch-action: none;
      -webkit-user-select: none; user-select: none; background: #E5EEFF;
    }
    #map { width: 100%; height: 100%; touch-action: none; background: #E5EEFF; }
    .leaflet-control-container { display: none !important; }
    .leaflet-pane, .leaflet-tile, .leaflet-marker-icon { transform: translateZ(0); will-change: transform; }
    .live-marker { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; position: relative; }
    .live-dot { width: 16px; height: 16px; border-radius: 50%; background: #006948; border: 3px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.3); z-index: 2; }
    .live-halo { position: absolute; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,105,72,0.22); border: 1.5px solid rgba(0,105,72,0.5); }
    .start-pill {
      background: #006948; color: #FFFFFF; font-size: 10px; font-weight: 700;
      padding: 3px 8px; border-radius: 999px; border: 2px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = null;
    var streetLayer = null;
    var liveMarker = null;
    var startMarker = null;
    var glowLine = null;
    var mainLine = null;
    var isUserInteracting = false;
    var interactionTimer = null;
    // Follow otomatis hanya sampai user menggeser/zoom; tombol recenter menyalakannya lagi.
    var following = true;

    function notifyInteraction(isStarting) {
      if (isStarting) {
        isUserInteracting = true;
        if (interactionTimer) clearTimeout(interactionTimer);
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'INTERACTION_START' }));
        }
      } else {
        if (interactionTimer) clearTimeout(interactionTimer);
        interactionTimer = setTimeout(function() {
          isUserInteracting = false;
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'INTERACTION_END' }));
          }
        }, 400);
      }
    }

    function init() {
      try {
        streetLayer = L.tileLayer('${TILE_STREET}', { maxZoom: 19, subdomains: 'abc', keepBuffer: 6 });
        map = L.map('map', {
          center: [${lat}, ${lng}],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
          tap: false,
          inertia: true,
          preferCanvas: true
        });
        streetLayer.addTo(map);

        map.on('dragstart movestart zoomstart', function() { notifyInteraction(true); });
        map.on('dragend moveend zoomend', function() { notifyInteraction(false); });
        map.on('dragstart zoomstart', function() { following = false; });

        glowLine = L.polyline([], {
          color: '#10b981', weight: 10, opacity: 0.95, lineCap: 'round', lineJoin: 'round'
        }).addTo(map);
        mainLine = L.polyline([], {
          color: '#0B1C30', weight: 5, lineCap: 'round', lineJoin: 'round'
        }).addTo(map);

        var liveIcon = L.divIcon({
          className: '',
          html: '<div class="live-marker"><div class="live-halo"></div><div class="live-dot"></div></div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        liveMarker = L.marker([${lat}, ${lng}], { icon: liveIcon, zIndexOffset: 1000 }).addTo(map);

        var initRoute = ${initialRouteJson};
        if (initRoute && initRoute.length > 0) window.updateRoute(initRoute);
      } catch (err) { console.error(err); }
    }

    if (window.L) { init(); } else { window.addEventListener('load', init); }

    window.updatePosition = function(lat, lng, isTracking) {
      if (!map || !liveMarker) return;
      var newLatLng = [lat, lng];
      liveMarker.setLatLng(newLatLng);
      if (isTracking && following) {
        map.panTo(newLatLng, { animate: true, duration: 0.4 });
      }
    };

    window.updateRoute = function(coordsJson) {
      if (!map || !glowLine || !mainLine) return;
      try {
        var coords = typeof coordsJson === 'string' ? JSON.parse(coordsJson) : coordsJson;
        if (!Array.isArray(coords)) return;
        var latlngs = coords.map(function(c) { return [c.latitude, c.longitude]; });
        glowLine.setLatLngs(latlngs);
        mainLine.setLatLngs(latlngs);
        if (coords.length > 0 && !startMarker) {
          var startIcon = L.divIcon({
            className: '',
            html: '<div class="start-pill">MULAI</div>',
            iconSize: [56, 22],
            iconAnchor: [28, 22]
          });
          startMarker = L.marker([coords[0].latitude, coords[0].longitude], { icon: startIcon, zIndexOffset: 500 }).addTo(map);
        }
      } catch(e) {}
    };

    window.recenter = function(lat, lng) {
      if (map) {
        following = true;
        isUserInteracting = false;
        map.setView([lat, lng], 16, { animate: true, duration: 0.5 });
      }
    };

    window.setBaseLayer = function(url) {
      if (!map || !streetLayer) return;
      streetLayer.setUrl(url);
    };
  </script>
  </body>
</html>
    `;
  }, []);

  const source = useMemo(() => ({ html: leafletHtml }), [leafletHtml]);

  return (
    <View
      style={styles.container}
      onTouchStart={() => onInteractionChange?.(true)}
      onTouchEnd={() => setTimeout(() => onInteractionChange?.(false), 250)}
      onTouchCancel={() => onInteractionChange?.(false)}
    >
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={source}
        style={styles.map}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        androidLayerType="hardware"
        onMessage={handleMessage}
        onLoadEnd={() => {
          setLoaded(true);
          if (activePosition) {
            inject(
              `if (window.updatePosition) window.updatePosition(${activePosition.latitude}, ${activePosition.longitude}, ${isTracking});`,
            );
          }
          if (routeCoordinates.length > 0) {
            inject(`if (window.updateRoute) window.updateRoute(${JSON.stringify(routeCoordinates)});`);
          }
          // Jika WebView pernah reload saat mode satelit aktif, pulihkan layernya.
          if (satellite) {
            inject(`if (window.setBaseLayer) window.setBaseLayer('${TILE_SATELLITE}');`);
          }
        }}
      />

      {/* Chip kiri-atas sesuai desain */}
      <View style={[styles.chip, { pointerEvents: 'none' }]}>
        <MapPin size={13} color={satellite ? colors.warning : colors.primary} />
        <Text style={styles.chipText}>{satellite ? 'Satelit · Esri' : 'OpenStreetMap'}</Text>
      </View>

      {/* Tombol kanan-atas sesuai desain: lokasi + lapisan peta */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={recenter} activeOpacity={0.85}>
          <Crosshair size={17} color={colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity
          testID="map-layers"
          accessibilityLabel="Ganti lapisan peta"
          style={styles.ctrlBtn}
          onPress={toggleBasemap}
          activeOpacity={0.85}
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
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceContainer,
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
    boxShadow: '0px 2px 10px rgba(11,28,48,0.16)',
  },
  chipText: { fontSize: 11, fontFamily: fonts.bold, color: colors.onSurface },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 8,
  },
  ctrlBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceLowest,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 10px rgba(11,28,48,0.16)',
  },
});
