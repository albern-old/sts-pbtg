import React, { useRef, useEffect, useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Crosshair, Minus, Plus } from 'lucide-react-native';
import { colors } from '../theme/colors';

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

// Peta OpenStreetMap (Leaflet) via WebView — gratis, tanpa API key/billing.
// Rute bergaya desain: garis gelap di atas cahaya hijau.
export const ActivityMap: React.FC<ActivityMapProps> = ({
  currentLocation,
  routeCoordinates,
  isTracking,
  onInteractionChange,
}) => {
  const webViewRef = useRef<WebView | null>(null);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState<boolean>(false);
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);

  const fallbackCoord: Coordinate = useMemo(
    () => ({ latitude: -6.1754, longitude: 106.8272 }),
    [],
  );

  const activePosition =
    currentLocation ||
    (routeCoordinates.length > 0 ? routeCoordinates[routeCoordinates.length - 1] : fallbackCoord);

  useEffect(() => {
    if (currentLocation && webViewRef.current && isWebViewLoaded) {
      webViewRef.current.injectJavaScript(`
        if (window.updatePosition) {
          window.updatePosition(${currentLocation.latitude}, ${currentLocation.longitude}, ${isTracking});
        }
        true;
      `);
    }
  }, [currentLocation, isTracking, isWebViewLoaded]);

  useEffect(() => {
    if (routeCoordinates.length > 0 && webViewRef.current && isWebViewLoaded) {
      webViewRef.current.injectJavaScript(`
        if (window.updateRoute) {
          window.updateRoute(${JSON.stringify(routeCoordinates)});
        }
        true;
      `);
    }
  }, [routeCoordinates, isWebViewLoaded]);

  const handleRecenter = () => {
    if (!activePosition || !webViewRef.current) return;
    webViewRef.current.injectJavaScript(`
      if (window.recenter) {
        window.recenter(${activePosition.latitude}, ${activePosition.longitude});
      }
      true;
    `);
    setIsUserInteracting(false);
    onInteractionChange?.(false);
  };

  const handleZoom = (dir: 1 | -1) => {
    webViewRef.current?.injectJavaScript(`
      if (window.${dir === 1 ? 'zoomIn' : 'zoomOut'}) { window.${dir === 1 ? 'zoomIn' : 'zoomOut'}(); }
      true;
    `);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'INTERACTION_START') {
        setIsUserInteracting(true);
        onInteractionChange?.(true);
      } else if (data.type === 'INTERACTION_END') {
        setIsUserInteracting(false);
        onInteractionChange?.(false);
      }
    } catch {
      // abaikan pesan non-JSON
    }
  };

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
    .leaflet-control-container .leaflet-top,
    .leaflet-control-container .leaflet-bottom { display: none !important; }
    .leaflet-pane, .leaflet-tile, .leaflet-marker-icon { transform: translateZ(0); -webkit-transform: translateZ(0); will-change: transform; }
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

    var tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

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
        streetLayer = L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd', keepBuffer: 6 });
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

        glowLine = L.polyline([], {
          color: '#10b981', weight: 9, opacity: 0.9, lineCap: 'round', lineJoin: 'round'
        }).addTo(map);
        mainLine = L.polyline([], {
          color: '#0b1c30', weight: 5, lineCap: 'round', lineJoin: 'round'
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
      if (isTracking && !isUserInteracting) {
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

    window.zoomIn = function() { if (map) map.zoomIn(); };
    window.zoomOut = function() { if (map) map.zoomOut(); };
    window.recenter = function(lat, lng) {
      if (map) { isUserInteracting = false; map.setView([lat, lng], 16, { animate: true, duration: 0.5 }); }
    };
  </script>
</body>
</html>
    `;
  }, [activePosition.latitude, activePosition.longitude]);

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
        source={{ html: leafletHtml }}
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
          setIsWebViewLoaded(true);
          if (activePosition) {
            webViewRef.current?.injectJavaScript(`
              if (window.updatePosition) {
                window.updatePosition(${activePosition.latitude}, ${activePosition.longitude}, ${isTracking});
              }
              true;
            `);
          }
          if (routeCoordinates.length > 0) {
            webViewRef.current?.injectJavaScript(`
              if (window.updateRoute) {
                window.updateRoute(${JSON.stringify(routeCoordinates)});
              }
              true;
            `);
          }
        }}
      />

      {/* Kontrol mengambang kanan-bawah (di bawah panel statistik) */}
      <View style={styles.controlsGroup}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => handleZoom(1)} activeOpacity={0.85}>
          <Plus size={18} color={colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => handleZoom(-1)} activeOpacity={0.85}>
          <Minus size={18} color={colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={handleRecenter} activeOpacity={0.85}>
          <Crosshair size={18} color={colors.primary} />
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
  controlsGroup: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    gap: 8,
    zIndex: 10,
  },
  ctrlBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceLowest,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
