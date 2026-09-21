import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import * as Location from 'expo-location';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Navigation as NavIcon,
  Flame,
  Clock,
  MapPin,
  Sparkles,
  User,
  Plus,
  Minus,
  CheckCircle2,
  Compass,
} from 'lucide-react-native';
import { ActivityMap, Coordinate } from './src/components/ActivityMap';

// --- Haversine Distance Formula (meter) ---
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function App() {
  // ==========================================
  // BAGIAN 1: INPUT KALKULATOR BMI
  // ==========================================
  const [gender, setGender] = useState<'pria' | 'wanita'>('pria');
  const [age, setAge] = useState<number>(26);
  const [weightKg, setWeightKg] = useState<number>(72.5);
  const [heightCm, setHeightCm] = useState<number>(175);

  // PROSES: BMI = berat ÷ [tinggi (m)]²
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  // OUTPUT: Kategori WHO (Kurus, Normal, Gemuk, Obesitas)
  const category = useMemo(() => {
    if (bmi < 18.5) {
      return {
        label: 'Kurus',
        color: '#3B82F6',
        badge: 'Di Bawah Normal',
        bg: '#EFF6FF',
        torsoScale: 0.85,
        hipScale: 0.85,
      };
    }
    if (bmi <= 24.9) {
      return {
        label: 'Normal',
        color: '#10B981',
        badge: 'Rentang Ideal',
        bg: '#ECFDF5',
        torsoScale: 1.0,
        hipScale: 1.0,
      };
    }
    if (bmi <= 29.9) {
      return {
        label: 'Gemuk',
        color: '#F59E0B',
        badge: 'Kelebihan Berat',
        bg: '#FFFBEB',
        torsoScale: 1.18,
        hipScale: 1.15,
      };
    }
    return {
      label: 'Obesitas',
      color: '#EF4444',
      badge: 'Kategori Kritis',
      bg: '#FEF2F2',
      torsoScale: 1.35,
      hipScale: 1.3,
    };
  }, [bmi]);

  // OUTPUT: Rekomendasi Berat Badan Ideal (BMI 18.5 - 24.9)
  const idealMin = Math.round(18.5 * heightM * heightM * 10) / 10;
  const idealMax = Math.round(24.9 * heightM * heightM * 10) / 10;
  const weightDelta =
    weightKg > idealMax
      ? Math.round((weightKg - idealMax) * 10) / 10
      : weightKg < idealMin
      ? Math.round((weightKg - idealMin) * 10) / 10
      : 0;

  // ==========================================
  // BAGIAN 2: PEMANTAU JARAK TEMPUH (EXPO LOCATION)
  // ==========================================
  const [trackerStatus, setTrackerStatus] = useState<'idle' | 'tracking' | 'paused'>('idle');
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isSimulation, setIsSimulation] = useState<boolean>(false);

  // Koordinat Rute dan Posisi Terkini untuk Peta
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);

  const prevLocationRef = useRef<{ lat: number; lon: number; time: number } | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ambil lokasi GPS awal saat aplikasi dibuka agar peta langsung berfokus ke posisi pengguna
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (loc?.coords) {
            const coord: Coordinate = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            };
            setCurrentLocation(coord);
            if (loc.coords.accuracy) {
              setGpsAccuracy(Math.round(loc.coords.accuracy));
            }
          }
        }
      } catch {
        // Fallback aman ke koordinat default
      }
    })();
  }, []);

  // Timer Durasi
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (trackerStatus === 'tracking') {
      interval = setInterval(() => {
        setDurationSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [trackerStatus]);

  // Simulasi Pergerakan (virtual coordinates realtime untuk pengujian di dalam ruangan)
  useEffect(() => {
    if (trackerStatus === 'tracking' && isSimulation) {
      let simStep = 0;
      simIntervalRef.current = setInterval(() => {
        simStep++;
        // Kecepatan jalan santai / jogging ~5.8 km/jam (~1.6 m/s)
        const delta = 1.6 + (Math.random() * 0.3 - 0.15);
        setDistanceMeters((d) => Math.round((d + delta) * 10) / 10);
        setSpeedKmh(Math.round(delta * 3.6 * 10) / 10);
        setGpsAccuracy(3);

        // Tambahkan koordinat virtual bertahap dengan kelokan rute yang natural
        setCurrentLocation((prev) => {
          const baseLat = prev ? prev.latitude : -6.1754;
          const baseLon = prev ? prev.longitude : 106.8272;
          const curve = Math.sin(simStep / 8) * 0.000015;
          const nextCoord: Coordinate = {
            latitude: baseLat + 0.000025 + curve,
            longitude: baseLon + 0.00003,
          };
          setRouteCoordinates((coords) => {
            if (coords.length === 0 && prev) {
              return [prev, nextCoord];
            }
            return [...coords, nextCoord];
          });
          return nextCoord;
        });
      }, 1000);
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [trackerStatus, isSimulation]);

  // Kalori Presisi Tinggi (Standar Klinis ACSM & Formula Kinetik Margaria)
  const caloriesBurned = useMemo(() => {
    if (durationSeconds <= 0 && distanceMeters <= 0) return 0;

    const km = distanceMeters / 1000;
    const durationMinutes = durationSeconds / 60;
    const durationHours = durationSeconds / 3600;

    // Kecepatan rata-rata aktivitas (km/jam)
    const avgSpeedKmh = durationHours > 0 && km > 0 ? km / durationHours : speedKmh;

    // 1. Formula Kinetik Margaria (Kerja Mekanik Tubuh per Jarak Tempuh):
    // - Berjalan (< 6.0 km/jam): ~0.75 kcal/kg/km
    // - Berlari / Jogging (>= 6.0 km/jam): ~1.036 kcal/kg/km
    const isRunning = avgSpeedKmh >= 6.0;
    const margariaFactor = isRunning ? 1.036 : 0.75;
    const kineticCalories = km * weightKg * margariaFactor;

    // 2. Formula Metabolik ACSM (American College of Sports Medicine):
    const speedMpm = (avgSpeedKmh * 1000) / 60; // meter per menit
    let vo2 = 3.5; // Konsumsi oksigen istirahat
    if (avgSpeedKmh > 0.5) {
      vo2 = isRunning ? 0.2 * speedMpm + 3.5 : 0.1 * speedMpm + 3.5;
    }
    const met = vo2 / 3.5;
    // Kalori aktif per menit = (MET * 3.5 * weightKg / 200) * durasiMenit
    const acsmCalories = ((met * 3.5 * weightKg) / 200) * durationMinutes;

    // Mengambil nilai terukur terbaik
    const totalCalories = Math.max(kineticCalories, acsmCalories);
    return Math.round(totalCalories * 10) / 10;
  }, [durationSeconds, distanceMeters, speedKmh, weightKg]);

  // Mulai Pelacakan Lokasi Sensor HP saat Jalan / Jogging
  const handleStart = async () => {
    setTrackerStatus('tracking');
    if (isSimulation) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Izin Lokasi Diperlukan',
          'Aktifkan sensor lokasi HP Anda atau gunakan Mode Simulasi untuk menguji pelacakan rute.'
        );
        return;
      }

      // Pastikan titik awal sudah tercatat sebelum bergerak
      if (!currentLocation) {
        const initialLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (initialLoc?.coords) {
          const startCoord: Coordinate = {
            latitude: initialLoc.coords.latitude,
            longitude: initialLoc.coords.longitude,
          };
          setCurrentLocation(startCoord);
          setRouteCoordinates([startCoord]);
          prevLocationRef.current = {
            lat: startCoord.latitude,
            lon: startCoord.longitude,
            time: Date.now(),
          };
        }
      } else if (routeCoordinates.length === 0) {
        setRouteCoordinates([currentLocation]);
        prevLocationRef.current = {
          lat: currentLocation.latitude,
          lon: currentLocation.longitude,
          time: Date.now(),
        };
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1, // Merekam pergerakan setiap 1 meter
          timeInterval: 1000,   // Evaluasi setiap detik
        },
        (loc) => {
          const { latitude, longitude, accuracy, speed } = loc.coords;
          const now = Date.now();
          if (accuracy) setGpsAccuracy(Math.round(accuracy));

          // 1. FILTER AKURASI SATELIT:
          // Abaikan sinyal GPS yang sangat kabur (> 40 meter)
          if (accuracy && accuracy > 40) {
            return;
          }

          const newCoord: Coordinate = { latitude, longitude };
          setCurrentLocation(newCoord);

          if (prevLocationRef.current) {
            const d = getHaversineDistance(
              prevLocationRef.current.lat,
              prevLocationRef.current.lon,
              latitude,
              longitude
            );
            const timeDeltaSec = (now - prevLocationRef.current.time) / 1000;
            const derivedSpeedMps = timeDeltaSec > 0 ? d / timeDeltaSec : 0;

            // 2. FILTER PERGERAKAN JALAN / JOGGING:
            // Langkah jalan kaki berkisar 0.8 - 1.4 meter per detik.
            // d >= 0.8 meter merekam setiap langkah jalan/jogging tanpa lonjakan saat HP diam.
            // 3. FILTER LOMPATAN SPIKE:
            // Batasi kecepatan fisik wajar pelari/pejalan (< 14.0 m/s atau ~50 km/jam).
            if (d >= 0.8 && derivedSpeedMps < 14.0) {
              setDistanceMeters((prev) => Math.round((prev + d) * 10) / 10);
              const validSpeedKmh =
                speed !== null && speed >= 0 ? speed * 3.6 : derivedSpeedMps * 3.6;
              setSpeedKmh(Math.round(validSpeedKmh * 10) / 10);
              setRouteCoordinates((coords) => [...coords, newCoord]);
              prevLocationRef.current = { lat: latitude, lon: longitude, time: now };
            }
          } else {
            // Titik awal pertama
            prevLocationRef.current = { lat: latitude, lon: longitude, time: now };
            setRouteCoordinates([newCoord]);
          }
        }
      );
      locationSubRef.current = sub;
    } catch {
      Alert.alert('Info', 'Sensor GPS aktif. Anda juga bisa mengaktifkan mode simulasi.');
    }
  };

  const handlePause = () => {
    setTrackerStatus('paused');
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
    setSpeedKmh(0);
  };

  const handleReset = () => {
    handlePause();
    setTrackerStatus('idle');
    setDistanceMeters(0);
    setDurationSeconds(0);
    setSpeedKmh(0);
    prevLocationRef.current = null;
    setRouteCoordinates([]);
    setCurrentLocation(null);
  };

  // Cleanup unmount
  useEffect(() => {
    return () => {
      if (locationSubRef.current) {
        locationSubRef.current.remove();
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        {/* SELURUH FITUR DITAMPILKAN DALAM SATU (1) HALAMAN / SCROLLVIEW */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Aplikasi */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Activity size={22} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Kinetic Pulse</Text>
              <Text style={styles.headerSub}>Kalkulator BMI &amp; Pemantau Jarak Tempuh</Text>
            </View>
          </View>

          {/* ========================================================= */}
          {/* BAGIAN 1: KALKULATOR BMI                                  */}
          {/* ========================================================= */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionBadge}>BAGIAN 1 • KALKULATOR BMI</Text>
              <Text style={styles.formulaBadge}>Formula: berat ÷ [tinggi (m)]²</Text>
            </View>

            {/* Input Gender */}
            <Text style={styles.inputLabel}>PROFIL FISIOLOGIS (GENDER)</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'pria' && styles.genderBtnActive]}
                onPress={() => setGender('pria')}
                activeOpacity={0.7}
              >
                <User size={16} color={gender === 'pria' ? '#0F172A' : '#64748B'} />
                <Text style={[styles.genderText, gender === 'pria' && styles.genderTextActive]}>
                  Pria
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'wanita' && styles.genderBtnActive]}
                onPress={() => setGender('wanita')}
                activeOpacity={0.7}
              >
                <User size={16} color={gender === 'wanita' ? '#0F172A' : '#64748B'} />
                <Text style={[styles.genderText, gender === 'wanita' && styles.genderTextActive]}>
                  Wanita
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Usia */}
            <View style={styles.stepperContainer}>
              <Text style={styles.inputLabel}>USIA (TAHUN)</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.circleBtn}
                  onPress={() => setAge((a) => Math.max(10, a - 1))}
                  activeOpacity={0.7}
                >
                  <Minus size={18} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{age} thn</Text>
                <TouchableOpacity
                  style={styles.circleBtn}
                  onPress={() => setAge((a) => Math.min(100, a + 1))}
                  activeOpacity={0.7}
                >
                  <Plus size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Tinggi Badan (cm) */}
            <View style={styles.stepperContainer}>
              <Text style={styles.inputLabel}>TINGGI BADAN (CM)</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.circleBtn}
                  onPress={() => setHeightCm((h) => Math.max(100, h - 1))}
                  activeOpacity={0.7}
                >
                  <Minus size={18} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{heightCm} cm</Text>
                <TouchableOpacity
                  style={styles.circleBtn}
                  onPress={() => setHeightCm((h) => Math.min(230, h + 1))}
                  activeOpacity={0.7}
                >
                  <Plus size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Berat Badan (kg) */}
            <View style={styles.stepperContainer}>
              <Text style={styles.inputLabel}>BERAT BADAN (KG)</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.circleBtn}
                  onPress={() => setWeightKg((w) => Math.max(25, Math.round((w - 0.5) * 10) / 10))}
                  activeOpacity={0.7}
                >
                  <Minus size={18} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{weightKg} kg</Text>
                <TouchableOpacity
                  style={styles.circleBtn}
                  onPress={() => setWeightKg((w) => Math.min(200, Math.round((w + 0.5) * 10) / 10))}
                  activeOpacity={0.7}
                >
                  <Plus size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* OUTPUT HASIL BMI */}
            <View style={[styles.resultCard, { backgroundColor: category.bg, borderColor: category.color }]}>
              {/* Elemen Gambar/Ikon Pendukung: Siluet Tubuh SVG Morphing */}
              <View style={styles.bodySilhouetteBox}>
                <Svg width="70" height="100" viewBox="0 0 100 140">
                  {/* Head */}
                  <Circle cx="50" cy="20" r="10" fill={category.color} />
                  {/* Neck */}
                  <Line x1="50" y1="30" x2="50" y2="38" stroke={category.color} strokeWidth="5" strokeLinecap="round" />
                  {/* Torso */}
                  <Path
                    d={
                      gender === 'pria'
                        ? `M ${50 - 15 * category.torsoScale} 38 L ${50 + 15 * category.torsoScale} 38 L ${50 + 12 * category.hipScale} 78 L ${50 - 12 * category.hipScale} 78 Z`
                        : `M ${50 - 13 * category.torsoScale} 38 L ${50 + 13 * category.torsoScale} 38 L ${50 + 16 * category.hipScale} 80 L ${50 - 16 * category.hipScale} 80 Z`
                    }
                    fill={category.color}
                  />
                  {/* Arms */}
                  <Line x1={50 - 15 * category.torsoScale} y1="40" x2={50 - 20 * category.torsoScale} y2="76" stroke={category.color} strokeWidth="5" strokeLinecap="round" />
                  <Line x1={50 + 15 * category.torsoScale} y1="40" x2={50 + 20 * category.torsoScale} y2="76" stroke={category.color} strokeWidth="5" strokeLinecap="round" />
                  {/* Legs */}
                  <Line x1={50 - 7 * category.hipScale} y1="78" x2={50 - 9 * category.hipScale} y2="128" stroke={category.color} strokeWidth="5" strokeLinecap="round" />
                  <Line x1={50 + 7 * category.hipScale} y1="78" x2={50 + 9 * category.hipScale} y2="128" stroke={category.color} strokeWidth="5" strokeLinecap="round" />
                </Svg>
                <Text style={[styles.catBadge, { color: category.color }]}>{category.badge}</Text>
              </View>

              <View style={styles.resultInfo}>
                <Text style={styles.formulaText}>
                  Proses: {weightKg} ÷ ({heightM}m)²
                </Text>
                <Text style={styles.bmiNumber}>{bmi.toFixed(1)}</Text>
                <Text style={[styles.bmiCategory, { color: category.color }]}>
                  Kategori: {category.label}
                </Text>

                {/* Rekomendasi Berat Badan Ideal */}
                <View style={styles.idealRecBox}>
                  <Text style={styles.idealTitle}>Rekomendasi Berat Ideal:</Text>
                  <Text style={styles.idealRange}>
                    {idealMin} - {idealMax} kg
                  </Text>
                  {weightDelta > 0 ? (
                    <Text style={styles.deltaText}>Perlu turun {weightDelta} kg</Text>
                  ) : weightDelta < 0 ? (
                    <Text style={styles.deltaText}>Perlu naik {Math.abs(weightDelta)} kg</Text>
                  ) : (
                    <Text style={[styles.deltaText, { color: '#10B981' }]}>
                      Berat sudah dalam rentang ideal!
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* ========================================================= */}
          {/* BAGIAN 2: PEMANTAU JARAK TEMPUH (SENSOR EXPO LOCATION)    */}
          {/* ========================================================= */}
          <View style={styles.darkCard}>
            <View style={styles.darkCardHeader}>
              <View style={styles.navIconBox}>
                <NavIcon size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.darkCardBadge}>BAGIAN 2 • PEMANTAU JARAK TEMPUH</Text>
                <Text style={styles.darkCardTitle}>Sensor GPS Expo Location</Text>
              </View>

              {/* Mode Simulasi Toggle */}
              <TouchableOpacity
                style={[styles.simToggleBtn, isSimulation && styles.simToggleActive]}
                onPress={() => setIsSimulation(!isSimulation)}
                activeOpacity={0.8}
              >
                <Compass size={12} color={isSimulation ? '#D97706' : '#94A3B8'} />
                <Text style={[styles.simToggleText, isSimulation && styles.simToggleTextActive]}>
                  {isSimulation ? 'Simulasi Aktif' : 'GPS Nyata'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Elemen Gambar/Ikon Pendukung: Pelari Kinetik SVG */}
            <View style={styles.runnerGraphicRow}>
              <View style={styles.runnerBox}>
                <Svg width="50" height="50" viewBox="0 0 50 50">
                  <Circle cx="28" cy="12" r="5" fill="#10B981" />
                  <Line x1="26" y1="17" x2="20" y2="30" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                  <Line x1="20" y1="30" x2="30" y2="44" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                  <Line x1="20" y1="30" x2="10" y2="42" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
                  <Line x1="25" y1="20" x2="35" y2="24" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.runnerStatusTitle}>
                  {trackerStatus === 'tracking'
                    ? 'Sensor Lokasi Berjalan'
                    : trackerStatus === 'paused'
                    ? 'Sensor Dijeda'
                    : 'Sensor Siaga'}
                </Text>
                <Text style={styles.runnerStatusSub}>
                  {isSimulation
                    ? 'Mode simulasi gerak (~8.3 km/jam)'
                    : gpsAccuracy
                    ? `Akurasi satelit: ±${gpsAccuracy} meter`
                    : 'Menunggu pergerakan...'}
                </Text>
              </View>
              {/* Kecepatan Langsung */}
              <View style={styles.speedBadge}>
                <Text style={styles.speedVal}>{trackerStatus === 'tracking' ? speedKmh : 0}</Text>
                <Text style={styles.speedUnit}>km/jam</Text>
              </View>
            </View>

            {/* Peta Rute Interaktif (GPS Satelit Real-time & Breadcrumb Trail) */}
            <ActivityMap
              currentLocation={currentLocation}
              routeCoordinates={routeCoordinates}
              isTracking={trackerStatus === 'tracking'}
              accuracy={gpsAccuracy}
              speedKmh={speedKmh}
            />

            {/* Display Jarak, Durasi, Kalori secara langsung */}
            <View style={styles.telemetryGrid}>
              <View style={styles.telemetryItem}>
                <MapPin size={16} color="#10B981" />
                <Text style={styles.telemetryLabel}>JARAK TEMPUH</Text>
                <Text style={styles.telemetryValue}>
                  {distanceMeters < 1000
                    ? `${Math.round(distanceMeters)} m`
                    : `${(distanceMeters / 1000).toFixed(2)} km`}
                </Text>
              </View>

              <View style={styles.telemetryItem}>
                <Clock size={16} color="#60A5FA" />
                <Text style={styles.telemetryLabel}>DURASI</Text>
                <Text style={styles.telemetryValue}>{formatTimer(durationSeconds)}</Text>
              </View>

              <View style={styles.telemetryItem}>
                <Flame size={16} color="#F59E0B" />
                <Text style={styles.telemetryLabel}>KALORI</Text>
                <Text style={styles.telemetryValue}>{caloriesBurned} kkal</Text>
              </View>
            </View>

            {/* Tombol: Mulai, Berhenti, Reset */}
            <View style={styles.btnActionRow}>
              {trackerStatus !== 'tracking' ? (
                <TouchableOpacity style={styles.btnStart} onPress={handleStart} activeOpacity={0.8}>
                  <Play size={18} color="#0B1C30" fill="#0B1C30" />
                  <Text style={styles.btnStartText}>Mulai Aktivitas</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.btnPause} onPress={handlePause} activeOpacity={0.8}>
                  <Pause size={18} color="#0B1C30" fill="#0B1C30" />
                  <Text style={styles.btnStartText}>Berhenti (Jeda)</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.btnReset}
                onPress={handleReset}
                disabled={trackerStatus === 'idle' && distanceMeters === 0 && durationSeconds === 0}
                activeOpacity={0.8}
              >
                <RotateCcw size={16} color="#FFFFFF" />
                <Text style={styles.btnResetText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Motivasi */}
          <View style={styles.footer}>
            <Sparkles size={14} color="#10B981" />
            <Text style={styles.footerText}>Kinetic Pulse • Expo React Native Single Screen</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0B1C30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0B1C30', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionBadge: { fontSize: 11, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 },
  formulaBadge: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 6, textTransform: 'uppercase' },
  genderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    padding: 4,
    marginBottom: 12,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 999,
  },
  genderBtnActive: { backgroundColor: '#FFF', elevation: 2 },
  genderText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  genderTextActive: { color: '#0F172A', fontWeight: '800' },
  stepperContainer: { marginBottom: 10 },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepperVal: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  resultCard: {
    marginTop: 12,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bodySilhouetteBox: { alignItems: 'center', width: 70 },
  catBadge: { fontSize: 10, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  resultInfo: { flex: 1 },
  formulaText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  bmiNumber: { fontSize: 36, fontWeight: '900', color: '#0F172A', lineHeight: 42 },
  bmiCategory: { fontSize: 15, fontWeight: '800' },
  idealRecBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  idealTitle: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  idealRange: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  deltaText: { fontSize: 11, fontWeight: '700', color: '#D97706', marginTop: 2 },
  darkCard: {
    backgroundColor: '#0B1C30',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  darkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  navIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkCardBadge: { fontSize: 10, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 },
  darkCardTitle: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  simToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  simToggleActive: { backgroundColor: 'rgba(217, 119, 6, 0.2)', borderWidth: 1, borderColor: '#D97706' },
  simToggleText: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  simToggleTextActive: { color: '#F59E0B' },
  runnerGraphicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 16,
    marginBottom: 14,
  },
  runnerBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  runnerStatusTitle: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  runnerStatusSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  speedBadge: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  speedVal: { fontSize: 16, fontWeight: '900', color: '#10B981' },
  speedUnit: { fontSize: 9, fontWeight: '700', color: '#6EE7B7' },
  telemetryGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  telemetryItem: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  telemetryLabel: { fontSize: 9, fontWeight: '700', color: '#94A3B8', marginTop: 4 },
  telemetryValue: { fontSize: 16, fontWeight: '900', color: '#FFF', marginTop: 2 },
  btnActionRow: { flexDirection: 'row', gap: 10 },
  btnStart: {
    flex: 1,
    height: 50,
    borderRadius: 999,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnPause: {
    flex: 1,
    height: 50,
    borderRadius: 999,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnStartText: { color: '#0B1C30', fontSize: 15, fontWeight: '800' },
  btnReset: {
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnResetText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  footerText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
});
