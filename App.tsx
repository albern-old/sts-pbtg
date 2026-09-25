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
  Bookmark,
  ClipboardList,
  Zap,
  Droplets,
} from 'lucide-react-native';
import { ActivityMap, Coordinate } from './src/components/ActivityMap';
import { BmiGauge } from './src/components/BmiGauge';
import { BodyIllustration } from './src/components/BodyIllustration';
import { StatusCard } from './src/components/StatusCard';
import { TelemetryGrid } from './src/components/TelemetryGrid';
import { HeartRateZonesModal } from './src/components/HeartRateZonesModal';
import { HistoryModal } from './src/components/HistoryModal';
import { BiometricInput } from './src/components/BiometricInput';
import { AnimatedSplash } from './src/components/AnimatedSplash';
import { calculateTelemetry } from './src/utils/telemetry';
import { ActivityLevel, BmiHistoryRecord, ActivityHistoryRecord } from './src/types';
import {
getBmiHistory,
  saveBmiHistory,
  deleteBmiHistoryItem,
  clearAllBmiHistory,
  getActivityHistory,
  saveActivityHistory,
  deleteActivityHistoryItem,
  clearAllActivityHistory,
} from './src/utils/historyStorage';

// Tingkat Aktivitas Harian (Sedentary, Light, Moderate, Active, Athlete)
interface ActivityLevelItem {
  id: ActivityLevel;
  label: string;
  sub: string;
  name: string;
  desc: string;
}

const ACTIVITY_LEVELS: ActivityLevelItem[] = [
  {
    id: 'sedentary',
    label: 'Santai',
    sub: 'x1.20',
    name: 'Santai / Sedentari',
    desc: 'Banyak duduk, aktivitas harian minim, tanpa olahraga teratur.',
  },
  {
    id: 'light',
    label: 'Ringan',
    sub: 'x1.37',
    name: 'Ringan / Jalan Santai',
    desc: 'Aktivitas santai, berjalan kaki, atau olahraga ringan 1–3 hari/minggu.',
  },
  {
    id: 'moderate',
    label: 'Sedang',
    sub: 'x1.55',
    name: 'Sedang / Olahraga Rutin',
    desc: 'Latihan fisik dinamis (jogging, senam, gym) 3–5 hari/minggu.',
  },
  {
    id: 'active',
    label: 'Aktif',
    sub: 'x1.72',
    name: 'Tinggi / Sangat Aktif',
    desc: 'Latihan fisik berat atau olahraga intensif 6–7 hari/minggu.',
  },
  {
    id: 'athlete',
    label: 'Atlet',
    sub: 'x1.90',
    name: 'Ekstrem / Atletik',
    desc: 'Latihan fisik kompetitif sangat berat atau intensif 2x sehari.',
  },
];

const WEIGHT_PRESETS = [55, 65, 70, 75, 85];

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
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [isHeartZonesOpen, setIsHeartZonesOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [bmiHistory, setBmiHistory] = useState<BmiHistoryRecord[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityHistoryRecord[]>([]);

  // Muat riwayat tersimpan dari penyimpanan lokal saat aplikasi dibuka
  useEffect(() => {
    (async () => {
      const bHistory = await getBmiHistory();
      setBmiHistory(bHistory);
      const aHistory = await getActivityHistory();
      setActivityHistory(aHistory);
    })();
  }, []);

  // PROSES & OUTPUT TELEMETRI LENGKAP:
  // Menghitung BMI, Kategori WHO, Berat Ideal, BMR, TDEE, Body Fat %, Hidrasi, & Heart Rate Zones
  const metrics = useMemo(() => {
    return calculateTelemetry(
      heightCm,
      weightKg,
      age,
      gender === 'pria' ? 'male' : 'female',
      activity
    );
  }, [heightCm, weightKg, age, gender, activity]);

  const handleResetBmi = () => {
    setGender('pria');
    setAge(26);
    setHeightCm(175);
    setWeightKg(72.5);
    setActivity('moderate');
  };

  const handleSaveBmi = async () => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newRecord: BmiHistoryRecord = {
      id: `bmi-${Date.now()}`,
      timestamp: Date.now(),
      dateFormatted,
      timeFormatted,
      gender: gender === 'pria' ? 'male' : 'female',
      age,
      heightCm,
      weightKg,
      bmi: metrics.bmi,
      categoryType: metrics.category.type,
      categoryLabel: metrics.category.label,
      categoryColor: metrics.category.color,
      idealWeightRange: `${metrics.idealWeightMin} – ${metrics.idealWeightMax} kg`,
      bmr: metrics.bmr,
      tdee: metrics.tdee,
      bodyFatPercentage: metrics.bodyFatPercentage,
      bodyFatLabel: metrics.bodyFatCategory.label,
      activityLevel: activity,
    };

    const updated = await saveBmiHistory(newRecord);
    setBmiHistory(updated);

    Alert.alert(
      'Riwayat BMI Tersimpan! 🎉',
      `Data biometrik Anda (${metrics.bmi} BMI • ${metrics.category.label}) berhasil didokumentasikan ke dalam Buku Riwayat.`,
      [
        { text: 'Tutup', style: 'cancel' },
        { text: 'Lihat Riwayat', onPress: () => setIsHistoryModalOpen(true) },
      ]
    );
  };

  const handleRestoreBmiRecord = (record: BmiHistoryRecord) => {
    setGender(record.gender === 'male' ? 'pria' : 'wanita');
    setAge(record.age);
    setHeightCm(record.heightCm);
    setWeightKg(record.weightKg);
    setActivity(record.activityLevel);
    Alert.alert(
      'Data Dimuat ke Kalkulator',
      `Data riwayat tanggal ${record.dateFormatted} (${record.weightKg} kg, ${record.heightCm} cm, ${record.bmi} BMI) telah dimuat kembali.`
    );
  };

  // ==========================================
  // BAGIAN 2: PEMANTAU JARAK TEMPUH (EXPO LOCATION)
  // ==========================================
  const [trackerStatus, setTrackerStatus] = useState<'idle' | 'tracking' | 'paused'>('idle');
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isSimulation, setIsSimulation] = useState<boolean>(false);

  // Koordinat Rute dan Posisi Terkini untuk Peta
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [isPageScrollEnabled, setIsPageScrollEnabled] = useState<boolean>(true);

  const lastRecordedLocationRef = useRef<{ lat: number; lon: number; time: number } | null>(null);
  const lastPingRef = useRef<{ lat: number; lon: number; time: number } | null>(null);
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

        const currentSpeedKmh = delta * 3.6;
        const isRunning = currentSpeedKmh >= 6.0;
        const margariaFactor = isRunning ? 1.036 : 0.75;
        const calAdded = (delta / 1000) * weightKg * margariaFactor;

        setDistanceMeters((d) => Math.round((d + delta) * 10) / 10);
        setSpeedKmh(Math.round(currentSpeedKmh * 10) / 10);
        setCaloriesBurned((prev) => Math.round((prev + calAdded) * 10) / 10);
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



  // Mulai Pelacakan Lokasi Sensor HP saat Jalan / Jogging
  const handleStart = async () => {
    setTrackerStatus('tracking');

    // Pastikan titik awal jejak selalu terinisialisasi seketika
    if (!currentLocation) {
      const defaultStart: Coordinate = { latitude: -6.1754, longitude: 106.8272 };
      setCurrentLocation(defaultStart);
      if (routeCoordinates.length === 0) {
        setRouteCoordinates([defaultStart]);
        lastRecordedLocationRef.current = {
          lat: defaultStart.latitude,
          lon: defaultStart.longitude,
          time: Date.now(),
        };
      }
    } else if (routeCoordinates.length === 0) {
      setRouteCoordinates([currentLocation]);
      lastRecordedLocationRef.current = {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
        time: Date.now(),
      };
    } else {
      // Jika melanjutkan sesi (resume) setelah jeda/pause, segarkan waktu referensi ke waktu sekarang
      if (lastRecordedLocationRef.current) {
        lastRecordedLocationRef.current.time = Date.now();
      }
    }
    lastPingRef.current = null;

    if (isSimulation) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setTrackerStatus('idle');
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
          lastRecordedLocationRef.current = {
            lat: startCoord.latitude,
            lon: startCoord.longitude,
            time: Date.now(),
          };
        }
      } else if (routeCoordinates.length === 0) {
        setRouteCoordinates([currentLocation]);
        lastRecordedLocationRef.current = {
          lat: currentLocation.latitude,
          lon: currentLocation.longitude,
          time: Date.now(),
        };
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 0, // Terima pembaruan periodik konsisten agar saat diam speedometer langsung 0 & tidak freeze
          timeInterval: 1000,  // Evaluasi setiap detik
        },
        (loc) => {
          const { latitude, longitude, accuracy, speed } = loc.coords;
          const now = Date.now();
          if (accuracy) setGpsAccuracy(Math.round(accuracy));

          // 1. FILTER AKURASI SATELIT:
          // Abaikan sinyal GPS yang sangat kabur (> 35 meter) untuk cegah lompatan liar
          if (accuracy && accuracy > 35) {
            return;
          }

          const newCoord: Coordinate = { latitude, longitude };
          setCurrentLocation(newCoord);

          // 2. HITUNG KECEPATAN INSTAN AKTUAL (m/s):
          // Prioritas A: Sensor GPS Hardware bawaan HP (Doppler ground speed)
          // Prioritas B: Jarak pergeseran dari ping sensor terakhir dibagi jeda waktu singkat
          let currentSpeedMps = 0;
          if (speed !== null && speed !== undefined && speed >= 0) {
            currentSpeedMps = speed;
          } else if (lastPingRef.current) {
            const pingDeltaSec = (now - lastPingRef.current.time) / 1000;
            if (pingDeltaSec >= 0.2 && pingDeltaSec <= 5.0) {
              const pingDist = getHaversineDistance(
                lastPingRef.current.lat,
                lastPingRef.current.lon,
                latitude,
                longitude
              );
              currentSpeedMps = pingDist / pingDeltaSec;
            } else if (pingDeltaSec > 5.0) {
              // Jika sensor sempat berhenti mengirim data saat diam, lalu mendeteksi pergerakan kembali
              const pingDist = getHaversineDistance(
                lastPingRef.current.lat,
                lastPingRef.current.lon,
                latitude,
                longitude
              );
              if (pingDist >= 1.0 && pingDist < 100) {
                currentSpeedMps = 1.2; // default kecepatan langkah jalan wajar pejalan kaki
              }
            }
          }

          // Selalu perbarui catatan ping terakhir agar interval waktu antar-ping tidak pernah menumpuk
          lastPingRef.current = { lat: latitude, lon: longitude, time: now };

          // Titik rekam awal pertama jika belum ada
          if (!lastRecordedLocationRef.current) {
            lastRecordedLocationRef.current = { lat: latitude, lon: longitude, time: now };
            setRouteCoordinates([newCoord]);
            return;
          }

          // 3. DETEKSI STATUS BERHENTI / DIAM (Anti-Drift):
          // Bila kecepatan < 0.3 m/s (~1.1 km/jam), pengguna sedang berhenti di tempat.
          // Nolkan speedometer dan jangan catat pergeseran semu/jitter GPS saat diam.
          const isUserMoving = currentSpeedMps >= 0.3;

          if (!isUserMoving) {
            setSpeedKmh(0);
            return;
          }

          // 4. JIKA PENGGUNA SEDANG BERJALAN / BERLARI:
          // Hitung jarak nyata dari titik rute terakhir yang berhasil tersimpan
          const d = getHaversineDistance(
            lastRecordedLocationRef.current.lat,
            lastRecordedLocationRef.current.lon,
            latitude,
            longitude
          );

          // Batasi kecepatan fisik wajar pelari/pejalan (< 14.0 m/s atau ~50 km/jam) untuk cegah GPS spike
          const isPhysicallyRealistic = currentSpeedMps < 14.0;

          if (d >= 1.0 && isPhysicallyRealistic) {
            const currentSpeedKmh = Math.round(currentSpeedMps * 3.6 * 10) / 10;
            const isRunning = currentSpeedKmh >= 6.0;
            const margariaFactor = isRunning ? 1.036 : 0.75;
            const calAdded = (d / 1000) * weightKg * margariaFactor;

            setDistanceMeters((prev) => Math.round((prev + d) * 10) / 10);
            setSpeedKmh(currentSpeedKmh);
            setCaloriesBurned((prev) => Math.round((prev + calAdded) * 10) / 10);
            setRouteCoordinates((coords) => [...coords, newCoord]);
            lastRecordedLocationRef.current = { lat: latitude, lon: longitude, time: now };
          } else if (isPhysicallyRealistic) {
            // Pengguna bergerak tapi akumulasi langkah belum 1m (perbarui speedometer)
            const currentSpeedKmh = Math.round(currentSpeedMps * 3.6 * 10) / 10;
            setSpeedKmh(currentSpeedKmh);
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
    lastPingRef.current = null;
  };

  const doResetCleanup = () => {
    handlePause();
    setTrackerStatus('idle');
    setDistanceMeters(0);
    setDurationSeconds(0);
    setSpeedKmh(0);
    setCaloriesBurned(0);
    lastRecordedLocationRef.current = null;
    lastPingRef.current = null;
    setRouteCoordinates([]);
    setCurrentLocation(null);
  };

  const saveGpsSession = async () => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Hitung kecepatan rata-rata yang lebih akurat untuk riwayat
    const km = distanceMeters / 1000;
    const durationHours = durationSeconds / 3600;
    const avgSpeed =
      durationHours > 0 && km > 0
        ? Math.round((km / durationHours) * 10) / 10
        : speedKmh;

    const actRecord: ActivityHistoryRecord = {
      id: `act-${Date.now()}`,
      timestamp: Date.now(),
      dateFormatted,
      timeFormatted,
      distanceMeters,
      durationSeconds,
      caloriesBurned,
      speedKmh: avgSpeed,
      routeCoordinates: [...routeCoordinates],
    };

    const updatedActs = await saveActivityHistory(actRecord);
    setActivityHistory(updatedActs);
    return actRecord;
  };

  const handleReset = () => {
    const hasSignificantData = distanceMeters > 10 || durationSeconds > 10;

    if (hasSignificantData) {
      // Tampilkan dialog konfirmasi: Simpan sesi ke riwayat GPS atau Buang?
      const distanceStr = (distanceMeters / 1000).toFixed(2);
      const durationStr = `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}d`;
      const caloriesStr = caloriesBurned;

      Alert.alert(
        'Simpan Sesi Aktivitas? 🏃',
        `Anda telah menempuh ${distanceStr} km dalam ${durationStr} dan membakar ${caloriesStr} kkal.\n\nSimpan ke Riwayat GPS sebelum reset?`,
        [
          {
            text: 'Buang',
            style: 'destructive',
            onPress: () => {
              doResetCleanup();
            },
          },
          {
            text: 'Simpan & Reset',
            style: 'default',
            onPress: async () => {
              await saveGpsSession();
              doResetCleanup();
              Alert.alert(
                'Aktivitas Tersimpan! 🎉',
                `Sesi lari/jalan ${distanceStr} km berhasil disimpan ke Riwayat GPS.`,
                [
                  { text: 'Tutup', style: 'cancel' },
                  {
                    text: 'Lihat Riwayat',
                    onPress: () => setIsHistoryModalOpen(true),
                  },
                ]
              );
            },
          },
        ]
      );
    } else {
      // Data tidak signifikan, langsung reset tanpa menyimpan
      doResetCleanup();
    }
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

  const isResetDisabled = trackerStatus === 'idle' && distanceMeters === 0 && durationSeconds === 0;

  return (
    <>
      {showSplash && <AnimatedSplash onAnimationDone={() => setShowSplash(false)} />}
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        {/* SELURUH FITUR DITAMPILKAN DALAM SATU (1) HALAMAN / SCROLLVIEW */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isPageScrollEnabled}
        >
          {/* Header Aplikasi */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Activity size={22} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Kinetic Pulse</Text>
              <Text style={styles.headerSub}>Kalkulator BMI &amp; Pemantau Jarak Tempuh</Text>
            </View>
            <TouchableOpacity
              style={styles.headerHistoryBtn}
              onPress={() => setIsHistoryModalOpen(true)}
              activeOpacity={0.8}
            >
              <ClipboardList size={14} color="#2563EB" />
              <Text style={styles.headerHistoryText}>Riwayat ({bmiHistory.length})</Text>
            </TouchableOpacity>
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

            {/* Input Tinggi Badan (cm) - Direct TextInput + Stepper */}
            <BiometricInput
              label="TINGGI BADAN"
              sublabel="Ketik langsung atau gunakan tombol +/-"
              value={heightCm}
              unit="cm"
              min={80}
              max={240}
              step={1}
              decimalPlaces={0}
              onChange={(val) => setHeightCm(val)}
              presets={[150, 160, 165, 170, 175, 180]}
            />

            {/* Input Berat Badan (kg) - Direct TextInput + Stepper + Preset Cepat */}
            <BiometricInput
              label="BERAT BADAN"
              sublabel="Ketik langsung (bisa desimal, misal 72.5)"
              value={weightKg}
              unit="kg"
              min={25}
              max={200}
              step={0.5}
              decimalPlaces={1}
              onChange={(val) => setWeightKg(val)}
              presets={WEIGHT_PRESETS}
            />

            {/* Input Usia Pengguna (thn) - Direct TextInput + Stepper */}
            <BiometricInput
              label="USIA PENGGUNA"
              sublabel="Parameter Detak Jantung Max & BMR"
              value={age}
              unit="thn"
              min={10}
              max={110}
              step={1}
              decimalPlaces={0}
              onChange={(val) => setAge(val)}
              presets={[18, 25, 30, 40, 50]}
            />

            {/* Kartu Tingkat Aktivitas Harian */}
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityHeaderLeft}>
                  <Text style={styles.activityTitle}>TINGKAT AKTIVITAS HARIAN</Text>
                  <Text style={styles.activityCardSub} numberOfLines={2}>
                    Mempengaruhi pengeluaran kalori harian (TDEE) & kebutuhan hidrasi
                  </Text>
                </View>
                <View style={styles.activityBadgeContainer}>
                  <Text style={styles.activityBadge}>
                    {(ACTIVITY_LEVELS.find((item) => item.id === activity)?.label || activity).toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.activityBtnsGrid}>
                {ACTIVITY_LEVELS.map((item) => {
                  const isSelected = activity === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.activityBtn,
                        isSelected && styles.activityBtnActive,
                      ]}
                      onPress={() => setActivity(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.activityBtnLabel,
                          isSelected && styles.activityBtnLabelActive,
                        ]}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.activityBtnSub,
                          isSelected && styles.activityBtnSubActive,
                        ]}
                        numberOfLines={1}
                      >
                        {item.sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Output Keterangan Aktivitas Terpilih (Pasti Rapi & Terkurung di Dalam Kotak) */}
              {(() => {
                const currentItem =
                  ACTIVITY_LEVELS.find((item) => item.id === activity) || ACTIVITY_LEVELS[2];
                return (
                  <View style={styles.activityDetailBox}>
                    <View style={styles.activityDetailHeader}>
                      <View style={styles.activityDetailHeaderLeft}>
                        <Zap size={13} color="#3B82F6" />
                        <Text style={styles.activityDetailTitle}>
                          {currentItem.name}
                        </Text>
                      </View>
                      <View style={styles.activityMultiplierPill}>
                        <Text style={styles.activityMultiplierPillText}>
                          Pengali {currentItem.sub}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.activityDetailDesc}>
                      {currentItem.desc}
                    </Text>

                    <View style={styles.activityImpactRow}>
                      <View style={styles.activityImpactChip}>
                        <Flame size={12} color="#D97706" />
                        <Text style={styles.activityImpactChipText}>
                          +{metrics.activityCalories} kkal aktif/hari
                        </Text>
                      </View>
                      <View style={[styles.activityImpactChip, styles.activityImpactChipWater]}>
                        <Droplets size={12} color="#2563EB" />
                        <Text style={[styles.activityImpactChipText, { color: '#1D4ED8' }]}>
                          +{metrics.hydrationActivityBonus} L hidrasi
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })()}
            </View>

            {/* ========================================================= */}
            {/* FITUR TELEMETRI BIOMETRIK LENGKAP                        */}
            {/* ========================================================= */}

            {/* 1. Biometric Telemetry Index Circular Gauge & Spectrum Bar */}
            <BmiGauge
              bmi={metrics.bmi}
              category={metrics.category}
              gender={gender === 'pria' ? 'male' : 'female'}
              bodyFatPercentage={metrics.bodyFatPercentage}
            />

            {/* 2. Rekomendasi Berat Badan Ideal & Morphing Silhouette */}
            <BodyIllustration
              gender={gender === 'pria' ? 'male' : 'female'}
              category={metrics.category}
              bmi={metrics.bmi}
              weightKg={weightKg}
              idealWeightMin={metrics.idealWeightMin}
              idealWeightMax={metrics.idealWeightMax}
              weightDeltaToNormal={metrics.weightDeltaToNormal}
            />

            {/* 3. Status Fisiologis & Dual Rekomendasi Aktivitas + Nutrisi */}
            <StatusCard
              category={metrics.category}
              weightDelta={metrics.weightDeltaToNormal}
              gender={gender === 'pria' ? 'male' : 'female'}
              genderPhysiology={metrics.genderPhysiology}
            />

            {/* 4. Biometric Performance Matrix (6 Cards Grid + Pengaruh Aktivitas) */}
            <TelemetryGrid
              metrics={metrics}
              currentActivity={activity}
              onSelectActivity={setActivity}
              gpsCaloriesBurned={caloriesBurned}
              onOpenHeartZones={() => setIsHeartZonesOpen(true)}
            />

            {/* 5. Action Buttons: Simpan Riwayat, Lihat Riwayat & Reset BMI */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.saveHistoryBtn}
                onPress={handleSaveBmi}
                activeOpacity={0.8}
              >
                <Bookmark size={15} color="#FFFFFF" />
                <Text style={styles.saveHistoryText}>Simpan BMI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.viewHistoryBtn}
                onPress={() => setIsHistoryModalOpen(true)}
                activeOpacity={0.8}
              >
                <ClipboardList size={15} color="#1E40AF" />
                <Text style={styles.viewHistoryText}>Riwayat ({bmiHistory.length})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetBmiBtn}
                onPress={handleResetBmi}
                activeOpacity={0.8}
              >
                <RotateCcw size={14} color="#475569" />
                <Text style={styles.resetBmiText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ========================================================= */}
          {/* BAGIAN 2: PEMANTAU JARAK TEMPUH (SENSOR EXPO LOCATION)    */}
          {/* ========================================================= */}
          <View style={styles.darkCard}>
            <View style={styles.darkCardHeader}>
              <View style={styles.navIconBox}>
                <NavIcon size={20} color="#3B82F6" />
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
                  <Circle cx="28" cy="12" r="5" fill="#3B82F6" />
                  <Line x1="26" y1="17" x2="20" y2="30" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
                  <Line x1="20" y1="30" x2="30" y2="44" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
                  <Line x1="20" y1="30" x2="10" y2="42" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
                  <Line x1="25" y1="20" x2="35" y2="24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
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
              distanceMeters={distanceMeters}
              onInteractionChange={(interacting) => setIsPageScrollEnabled(!interacting)}
            />

            {/* Display Jarak, Durasi, Kalori secara langsung */}
            <View style={styles.telemetryGrid}>
              <View style={styles.telemetryItem}>
                <MapPin size={16} color="#3B82F6" />
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
                  <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.btnStartText}>Mulai Aktivitas</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.btnPause} onPress={handlePause} activeOpacity={0.8}>
                  <Pause size={18} color="#0B1C30" fill="#0B1C30" />
                  <Text style={styles.btnPauseText}>Berhenti (Jeda)</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.btnReset, isResetDisabled && styles.btnResetDisabled]}
                onPress={handleReset}
                disabled={isResetDisabled}
                activeOpacity={0.8}
              >
                <RotateCcw size={16} color={isResetDisabled ? '#64748B' : '#FFFFFF'} />
                <Text style={[styles.btnResetText, isResetDisabled && styles.btnResetTextDisabled]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Motivasi */}
          <View style={styles.footer}>
            <Sparkles size={14} color="#3B82F6" />
            <Text style={styles.footerText}>Kinetic Pulse • Telemetri Biometrik & Pemantau GPS</Text>
          </View>
        </ScrollView>

        {/* Modal Zona Detak Jantung Latihan */}
        <HeartRateZonesModal
          isOpen={isHeartZonesOpen}
          onClose={() => setIsHeartZonesOpen(false)}
          age={age}
          gender={gender === 'pria' ? 'male' : 'female'}
          maxHeartRate={metrics.maxHeartRate}
          zones={metrics.heartRateZones}
          formulaName={metrics.genderPhysiology.hrFormulaName}
        />

        {/* Modal Buku Riwayat Biometrik & GPS */}
        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          bmiHistory={bmiHistory}
          activityHistory={activityHistory}
          onDeleteBmiItem={async (id) => {
            const updated = await deleteBmiHistoryItem(id);
            setBmiHistory(updated);
          }}
          onClearAllBmi={async () => {
            await clearAllBmiHistory();
            setBmiHistory([]);
          }}
          onDeleteActivityItem={async (id) => {
            const updated = await deleteActivityHistoryItem(id);
            setActivityHistory(updated);
          }}
          onClearAllActivity={async () => {
            await clearAllActivityHistory();
            setActivityHistory([]);
          }}
          onRestoreBmiRecord={handleRestoreBmiRecord}
        />
      </SafeAreaView>
    </SafeAreaProvider>
    </>
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
  sectionBadge: { fontSize: 11, fontWeight: '800', color: '#3B82F6', letterSpacing: 0.5 },
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
    borderColor: '#E2E8F0',
  },
  stepperVal: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  headerHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1, borderColor: '#3B82F6',
  },
  headerHistoryText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    width: '100%',
  },
  saveHistoryBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#3B82F6',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveHistoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  viewHistoryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  viewHistoryText: {
    color: '#1E40AF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  resetBmiBtn: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetBmiText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 7,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  presetBtnTextActive: {
    color: '#FFFFFF',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
    marginBottom: 4,
    gap: 10,
    overflow: 'hidden',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  activityHeaderLeft: {
    flex: 1,
    paddingRight: 6,
  },
  activityTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  activityCardSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  activityBadgeContainer: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1, borderColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    alignSelf: 'center',
  },
  activityBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.3,
  },
  activityBtnsGrid: {
    flexDirection: 'row',
    gap: 5,
  },
  activityBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  activityBtnLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 2,
    textAlign: 'center',
  },
  activityBtnLabelActive: {
    color: '#FFFFFF',
  },
  activityBtnSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  activityBtnSubActive: {
    color: 'rgba(255,255,255,0.75)',
  },
  activityDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    marginTop: 2,
  },
  activityDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  activityDetailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  activityDetailTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  activityMultiplierPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1, borderColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activityMultiplierPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  activityDetailDesc: {
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 15,
  },
  activityImpactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  activityImpactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activityImpactChipWater: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  activityImpactChipText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#B45309',
  },
  darkCard: {
    backgroundColor: '#0B1C30',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkCardBadge: { fontSize: 10, fontWeight: '800', color: '#3B82F6', letterSpacing: 0.5 },
  darkCardTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  simToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  runnerStatusTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  runnerStatusSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  speedBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  speedVal: { fontSize: 16, fontWeight: '900', color: '#3B82F6' },
  speedUnit: { fontSize: 9, fontWeight: '700', color: '#93C5FD' },
  telemetryGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  telemetryItem: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  telemetryLabel: { fontSize: 9, fontWeight: '700', color: '#94A3B8', marginTop: 4 },
  telemetryValue: { fontSize: 16, fontWeight: '900', color: '#FFFFFF', marginTop: 2 },
  btnActionRow: { flexDirection: 'row', gap: 10 },
  btnStart: {
    flex: 1,
    height: 50,
    borderRadius: 999,
    backgroundColor: '#3B82F6',
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
  btnStartText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  btnPauseText: { color: '#0B1C30', fontSize: 15, fontWeight: '800' },
  btnReset: {
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  btnResetDisabled: {
    opacity: 0.45,
    borderColor: '#1E293B',
  },
  btnResetText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  btnResetTextDisabled: { color: '#64748B' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  footerText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
});
