import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import {
  Crosshair,
  Layers,
  Plus,
  Minus,
} from 'lucide-react-native';

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

export type MapType = 'standard' | 'hybrid';
export type MapEngine = 'osm';

export const ActivityMap: React.FC<ActivityMapProps> = ({
  currentLocation,
  routeCoordinates,
  isTracking,
  accuracy,
  speedKmh = 0,
  distanceMeters = 0,
  onInteractionChange,
}) => {

  const webViewRef = useRef<WebView | null>(null);

  const [mapType, setMapType] = useState<MapType>('standard');
  const [isWebViewLoaded, setIsWebViewLoaded] = useState<boolean>(false);
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);

  // Default coordinate (Pusat Kota / Monas) bila lokasi awal masih resolving
  const fallbackCoord: Coordinate = useMemo(
    () => ({
      latitude: -6.1754,
      longitude: 106.8272,
    }),
    []
  );

  const activePosition =
    currentLocation ||
    (routeCoordinates.length > 0
      ? routeCoordinates[routeCoordinates.length - 1]
      : fallbackCoord);

  // Sinkronisasi posisi marker ke OpenStreetMap (WebView)
  useEffect(() => {
    if (currentLocation && webViewRef.current && isWebViewLoaded) {
      const code = `
        if (window.updatePosition) {
          window.updatePosition(${currentLocation.latitude}, ${currentLocation.longitude}, ${isTracking});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(code);
    }
  }, [currentLocation, isTracking, isWebViewLoaded]);

  // Sinkronisasi jejak rute ke OpenStreetMap (WebView)
  useEffect(() => {
    if (routeCoordinates.length > 0 && webViewRef.current && isWebViewLoaded) {
      const code = `
        if (window.updateRoute) {
          window.updateRoute(${JSON.stringify(routeCoordinates)});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(code);
    }
  }, [routeCoordinates, isWebViewLoaded]);

  // Sinkronisasi tipe layer (Standard / Satelit) ke WebView
  useEffect(() => {
    if (webViewRef.current && isWebViewLoaded) {
      const code = `
        if (window.setMapLayer) {
          window.setMapLayer('${mapType}');
        }
        true;
      `;
      webViewRef.current.injectJavaScript(code);
    }
  }, [mapType, isWebViewLoaded]);

  // Pusatkan kembali kamera ke koordinat terkini
  const handleRecenter = () => {
    if (!activePosition || !webViewRef.current) return;
    webViewRef.current.injectJavaScript(`
      if (window.recenter) {
        window.recenter(${activePosition.latitude}, ${activePosition.longitude});
      }
      true;
    `);
    setIsUserInteracting(false);
  };

  // Zoom In
  const handleZoomIn = () => {
    if (!webViewRef.current) return;
    webViewRef.current.injectJavaScript(`
      if (window.zoomIn) { window.zoomIn(); }
      true;
    `);
  };

  // Zoom Out
  const handleZoomOut = () => {
    if (!webViewRef.current) return;
    webViewRef.current.injectJavaScript(`
      if (window.zoomOut) { window.zoomOut(); }
      true;
    `);
  };

  // Ganti tipe peta (Jalan Standar / Citra Satelit)
  const toggleMapType = () => {
    setMapType((prev) => (prev === 'standard' ? 'hybrid' : 'standard'));
  };

  // Terima pesan event touch/drag dari Leaflet di dalam WebView
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
    } catch {}
  };

  // Template HTML Leaflet ultra-lancar dengan hardware acceleration, touch-action: none, dan render canvas
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      background: #0F172A;
    }
    #map {
      width: 100%;
      height: 100%;
      touch-action: none;
      background: #0F172A;
    }
    .leaflet-control-container .leaflet-top,
    .leaflet-control-container .leaflet-bottom {
      display: none !important;
    }
    
    /* Hardware acceleration & smooth GPU compositing */
    .leaflet-pane, .leaflet-tile, .leaflet-marker-icon {
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      will-change: transform;
    }
    
    .live-marker {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      position: relative;
    }
    .live-aura {
      position: absolute;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.35);
      border: 1.5px solid #3B82F6;
      animation: auraPulse 1.8s infinite ease-out;
    }
    .live-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #3B82F6;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      z-index: 2;
    }
    @keyframes auraPulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    .start-pill {
      background: #2563EB;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 900;
      padding: 3px 7px;
      border-radius: 6px;
      border: 1.5px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = null;
    var streetLayer = null;
    var satLayer = null;
    var liveMarker = null;
    var startMarker = null;
    var glowLine = null;
    var mainLine = null;
    var crumbsLayerGroup = null;
    var isUserInteracting = false;
    var interactionTimer = null;

    var standardUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    var satUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

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
        streetLayer = L.tileLayer(standardUrl, {
          maxZoom: 19,
          subdomains: 'abcd',
          updateWhenIdle: false,
          updateWhenZooming: false,
          keepBuffer: 6
        });
        satLayer = L.tileLayer(satUrl, {
          maxZoom: 19,
          updateWhenIdle: false,
          updateWhenZooming: false,
          keepBuffer: 6
        });

        map = L.map('map', {
          center: [${lat}, ${lng}],
          zoom: 17,
          zoomControl: false,
          attributionControl: false,
          tap: false,                    // Menghilangkan delay 300ms & gesture stutter di Android WebView
          touchZoom: true,
          dragging: true,
          inertia: true,
          inertiaDeceleration: 3200,     // Geseran meluncur halus (glide physics)
          inertiaMaxSpeed: 2500,
          easeLinearity: 0.15,
          preferCanvas: true,            // Hardware-accelerated canvas 2D
          fadeAnimation: true,
          zoomAnimation: true,
          markerZoomAnimation: true
        });

        streetLayer.addTo(map);

        map.on('dragstart movestart zoomstart', function() {
          notifyInteraction(true);
        });
        map.on('dragend moveend zoomend', function() {
          notifyInteraction(false);
        });

        glowLine = L.polyline([], {
          color: 'rgba(59, 130, 246, 0.45)',
          weight: 10,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        mainLine = L.polyline([], {
          color: '#3B82F6',
          weight: 4.5,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        crumbsLayerGroup = L.layerGroup().addTo(map);

        var liveIcon = L.divIcon({
          className: 'custom-live-icon',
          html: '<div class="live-marker"><div class="live-aura"></div><div class="live-dot"></div></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        liveMarker = L.marker([${lat}, ${lng}], { icon: liveIcon, zIndexOffset: 1000 }).addTo(map);

        // Render jejak awal jika sudah ada koordinat
        var initRoute = ${initialRouteJson};
        if (initRoute && initRoute.length > 0) {
          window.updateRoute(initRoute);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (window.L) {
      init();
    } else {
      window.addEventListener('load', init);
    }

    window.updatePosition = function(lat, lng, isTracking) {
      if (!map || !liveMarker) return;
      var newLatLng = [lat, lng];
      liveMarker.setLatLng(newLatLng);
      // PENTING: Hanya auto-pan jika user TIDAK sedang menggeser peta secara manual
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
            className: 'custom-start-icon',
            html: '<div class="start-pill">MULAI</div>',
            iconSize: [46, 20],
            iconAnchor: [23, 20]
          });
          startMarker = L.marker([coords[0].latitude, coords[0].longitude], {
            icon: startIcon,
            zIndexOffset: 500
          }).addTo(map);
        }

        // Render titik-titik langkah dengan L.circleMarker (Canvas 2D jauh lebih ringan daripada puluhan DOM div)
        if (crumbsLayerGroup) {
          crumbsLayerGroup.clearLayers();
          var stride = coords.length > 50 ? 3 : 2;
          for (var i = 1; i < coords.length - 1; i += stride) {
            L.circleMarker([coords[i].latitude, coords[i].longitude], {
              radius: 2.5,
              fillColor: '#34D399',
              fillOpacity: 1,
              color: '#FFFFFF',
              weight: 1,
              renderer: L.canvas()
            }).addTo(crumbsLayerGroup);
          }
        }
      } catch(e) {}
    };

    window.setMapLayer = function(layerType) {
      if (!map || !streetLayer || !satLayer) return;
      if (layerType === 'hybrid' || layerType === 'satellite') {
        if (map.hasLayer(streetLayer)) map.removeLayer(streetLayer);
        if (!map.hasLayer(satLayer)) satLayer.addTo(map);
      } else {
        if (map.hasLayer(satLayer)) map.removeLayer(satLayer);
        if (!map.hasLayer(streetLayer)) streetLayer.addTo(map);
      }
    };

    window.zoomIn = function() {
      if (map) map.zoomIn();
    };

    window.zoomOut = function() {
      if (map) map.zoomOut();
    };

    window.recenter = function(lat, lng) {
      if (map) {
        isUserInteracting = false;
        map.setView([lat, lng], 17, { animate: true, duration: 0.5 });
      }
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
      onTouchEnd={() => {
        setTimeout(() => onInteractionChange?.(false), 250);
      }}
      onTouchCancel={() => onInteractionChange?.(false)}
    >
      {/* PETA: OpenStreetMap Leaflet via WebView dengan Hardware Acceleration */}
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
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadingText}>Memuat OpenStreetMap...</Text>
          </View>
        )}
      />

      {/* Baris Status Atas (HUD Pelacakan & Status Jejak) */}
      <View style={styles.topHud}>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusPulse,
              { backgroundColor: isTracking ? '#3B82F6' : '#F59E0B' },
            ]}
          />
          <Text style={styles.statusPillText}>
            {isTracking
              ? `Jejak: ${routeCoordinates.length} titik (${distanceMeters < 1000 ? `${Math.round(distanceMeters)}m` : `${(distanceMeters / 1000).toFixed(2)}km`})`
              : currentLocation
              ? 'GPS Terkunci • Siap Melangkah'
              : 'Mencari Sinyal GPS...'}
          </Text>
        </View>

        {accuracy !== undefined && accuracy !== null && (
          <View style={styles.accuracyPill}>
            <Text style={styles.accuracyPillText}>±{accuracy}m</Text>
          </View>
        )}
      </View>

      {/* Kontrol Mengambang Kanan (Layer Satelit, Recenter, Zoom) */}
      <View style={styles.controlsGroup}>
        {/* Toggle Tipe Peta (Jalan Standar / Citra Satelit) */}
        <TouchableOpacity
          style={[styles.ctrlBtn, mapType === 'hybrid' && styles.ctrlBtnActive]}
          onPress={toggleMapType}
          activeOpacity={0.8}
        >
          <Layers size={18} color={mapType === 'hybrid' ? '#3B82F6' : '#1E293B'} />
        </TouchableOpacity>

        {/* Recenter ke Lokasi Saya */}
        <TouchableOpacity
          style={[styles.ctrlBtn, isUserInteracting && styles.ctrlBtnHighlight]}
          onPress={handleRecenter}
          activeOpacity={0.8}
        >
          <Crosshair size={18} color={isUserInteracting ? '#3B82F6' : '#0F172A'} />
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

      {/* Label Keterangan Bawah (Legend Jejak Langkah & Panduan Geser Bebas) */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomBarText}>
          🌐 OpenStreetMap • {isUserInteracting ? '✋ Mode geser bebas aktif' : routeCoordinates.length > 1
            ? `🟢 ${routeCoordinates.length} titik jejak terekam`
            : isTracking
            ? '🟢 Jejak berjalan aktif'
            : 'Peta siap merekam'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 290,
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
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  topHud: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
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
    zIndex: 10,
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
    borderColor: '#3B82F6',
  },
  ctrlBtnHighlight: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
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
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 10,
  },
  bottomBarText: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
  },
});
