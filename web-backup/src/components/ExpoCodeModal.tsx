import React, { useState } from 'react';
import { Smartphone, Code2, Copy, Check, Terminal, X, Sparkles, Navigation } from 'lucide-react';

export const ExpoCodeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'app' | 'setup'>('app');

  if (!isOpen) return null;

  const expoSetupInstructions = `# =======================================================
# PANDUAN MENJALANKAN DI EXPO REACT NATIVE (SINGLE SCREEN)
# =======================================================

# 1. Buat proyek Expo baru dengan template TypeScript
npx create-expo-app@latest kinetic-pulse --template blank-typescript
cd kinetic-pulse

# 2. Pasang library Expo Location, SVG, Safe Area, dan Lucide Icons
npx expo install expo-location react-native-safe-area-context lucide-react-native react-native-svg

# 3. Ganti isi file App.tsx dengan kode dari tab "Kode Expo App.tsx"

# 4. Jalankan aplikasi di HP melalui Expo Go atau simulator:
npx expo start
`;

  const expoAppCode = `import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ArrowDown,
  ArrowUp,
  AlertTriangle,
} from 'lucide-react-native';

// --- Haversine Distance Formula (meter) ---
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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
  const [age, setAge] = useState(25);
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(172);

  // PROSES: BMI = berat ÷ [tinggi (m)]²
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  // OUTPUT: Kategori (Kurus, Normal, Gemuk, Obesitas)
  const category = useMemo(() => {
    if (bmi < 18.5) return { label: 'Kurus', color: '#3B82F6', badge: 'Di Bawah Normal', bg: '#EFF6FF' };
    if (bmi <= 24.9) return { label: 'Normal', color: '#10B981', badge: 'Rentang Ideal', bg: '#ECFDF5' };
    if (bmi <= 29.9) return { label: 'Gemuk', color: '#F59E0B', badge: 'Kelebihan Berat', bg: '#FFFBEB' };
    return { label: 'Obesitas', color: '#EF4444', badge: 'Kategori Kritis', bg: '#FEF2F2' };
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
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  const prevLocationRef = useRef<{ lat: number; lon: number; time: number } | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  // Timer Durasi
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (trackerStatus === 'tracking') {
      interval = setInterval(() => {
        setDurationSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trackerStatus]);

  // Kalori Langsung (berdasarkan berat badan pengguna dan jarak/waktu)
  const caloriesBurned = useMemo(() => {
    const hours = durationSeconds / 3600;
    const km = distanceMeters / 1000;
    const met = speedKmh > 8 ? 9.0 : speedKmh > 5 ? 6.0 : 3.5;
    const cals = Math.max(met * weightKg * hours, km * weightKg * 0.95);
    return Math.round(cals * 10) / 10;
  }, [durationSeconds, distanceMeters, speedKmh, weightKg]);

  // Mulai Pelacakan Lokasi Sensor HP
  const handleStart = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Akses sensor lokasi GPS diperlukan untuk mendeteksi pergerakan.');
        return;
      }

      setTrackerStatus('tracking');
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 2,
          timeInterval: 1000,
        },
        (loc) => {
          const { latitude, longitude, accuracy, speed } = loc.coords;
          const now = Date.now();
          if (accuracy) setGpsAccuracy(Math.round(accuracy));

          if (prevLocationRef.current) {
            const d = getHaversineDistance(
              prevLocationRef.current.lat,
              prevLocationRef.current.lon,
              latitude,
              longitude
            );
            if (d > 1.5 && d < 300) {
              setDistanceMeters((prev) => prev + d);
              if (speed && speed >= 0) {
                setSpeedKmh(Math.round(speed * 3.6 * 10) / 10);
              }
            }
          }
          prevLocationRef.current = { lat: latitude, lon: longitude, time: now };
        }
      );
      locationSubRef.current = sub;
    } catch (e) {
      Alert.alert('Kesalahan', 'Gagal menyalakan sensor lokasi GPS.');
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
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
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
            <View>
              <Text style={styles.headerTitle}>Kinetic Pulse</Text>
              <Text style={styles.headerSub}>Kalkulator BMI &amp; Pemantau Jarak Tempuh</Text>
            </View>
          </View>

          {/* ========================================================= */}
          {/* BAGIAN 1: KALKULATOR BMI                                  */}
          {/* ========================================================= */}
          <View style={styles.card}>
            <Text style={styles.sectionBadge}>BAGIAN 1 • KALKULATOR BMI</Text>

            {/* Input Gender */}
            <Text style={styles.inputLabel}>GENDER</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'pria' && styles.genderBtnActive]}
                onPress={() => setGender('pria')}
              >
                <User size={16} color={gender === 'pria' ? '#0F172A' : '#64748B'} />
                <Text style={[styles.genderText, gender === 'pria' && styles.genderTextActive]}>Pria</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'wanita' && styles.genderBtnActive]}
                onPress={() => setGender('wanita')}
              >
                <User size={16} color={gender === 'wanita' ? '#0F172A' : '#64748B'} />
                <Text style={[styles.genderText, gender === 'wanita' && styles.genderTextActive]}>Wanita</Text>
              </TouchableOpacity>
            </View>

            {/* Input Usia */}
            <View style={styles.stepperContainer}>
              <Text style={styles.inputLabel}>USIA (TAHUN)</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setAge((a) => Math.max(10, a - 1))}>
                  <Minus size={18} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{age} thn</Text>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setAge((a) => Math.min(100, a + 1))}>
                  <Plus size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Tinggi Badan (cm) */}
            <View style={styles.stepperContainer}>
              <Text style={styles.inputLabel}>TINGGI BADAN (CM)</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setHeightCm((h) => Math.max(100, h - 1))}>
                  <Minus size={18} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{heightCm} cm</Text>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setHeightCm((h) => Math.min(230, h + 1))}>
                  <Plus size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Berat Badan (kg) */}
            <View style={styles.stepperContainer}>
              <Text style={styles.inputLabel}>BERAT BADAN (KG)</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setWeightKg((w) => Math.max(25, w - 1))}>
                  <Minus size={18} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{weightKg} kg</Text>
                <TouchableOpacity style={styles.circleBtn} onPress={() => setWeightKg((w) => Math.min(200, w + 1))}>
                  <Plus size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* OUTPUT HASIL BMI */}
            <View style={[styles.resultCard, { backgroundColor: category.bg, borderColor: category.color }]}>
              {/* Elemen Gambar/Ikon Pendukung: Siluet Tubuh SVG */}
              <View style={styles.bodySilhouetteBox}>
                <Svg width="60" height="90" viewBox="0 0 60 90">
                  <Circle cx="30" cy="15" r="8" fill={category.color} />
                  <Line x1="30" y1="23" x2="30" y2="52" stroke={category.color} strokeWidth="12" strokeLinecap="round" />
                  <Line x1="16" y1="28" x2="44" y2="28" stroke={category.color} strokeWidth="6" strokeLinecap="round" />
                  <Line x1="24" y1="52" x2="20" y2="82" stroke={category.color} strokeWidth="6" strokeLinecap="round" />
                  <Line x1="36" y1="52" x2="40" y2="82" stroke={category.color} strokeWidth="6" strokeLinecap="round" />
                </Svg>
                <Text style={[styles.catBadge, { color: category.color }]}>{category.badge}</Text>
              </View>

              <View style={styles.resultInfo}>
                <Text style={styles.formulaText}>Proses: {weightKg} ÷ ({heightM}m)²</Text>
                <Text style={styles.bmiNumber}>{bmi.toFixed(1)}</Text>
                <Text style={[styles.bmiCategory, { color: category.color }]}>Kategori: {category.label}</Text>

                {/* Rekomendasi Berat Badan Ideal */}
                <View style={styles.idealRecBox}>
                  <Text style={styles.idealTitle}>Rekomendasi Berat Ideal:</Text>
                  <Text style={styles.idealRange}>{idealMin} - {idealMax} kg</Text>
                  {weightDelta > 0 ? (
                    <Text style={styles.deltaText}>Perlu turun {weightDelta} kg</Text>
                  ) : weightDelta < 0 ? (
                    <Text style={styles.deltaText}>Perlu naik {Math.abs(weightDelta)} kg</Text>
                  ) : (
                    <Text style={[styles.deltaText, { color: '#10B981' }]}>Berat sudah ideal!</Text>
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
              <View>
                <Text style={styles.darkCardBadge}>BAGIAN 2 • PEMANTAU JARAK TEMPUH</Text>
                <Text style={styles.darkCardTitle}>Sensor GPS Expo Location</Text>
              </View>
            </View>

            {/* Elemen Gambar/Ikon Pendukung: Pelari Animatif SVG */}
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
                  {trackerStatus === 'tracking' ? 'Sensor Lokasi Berjalan' : trackerStatus === 'paused' ? 'Sensor Dijeda' : 'Sensor Siaga'}
                </Text>
                <Text style={styles.runnerStatusSub}>
                  {gpsAccuracy ? \`Akurasi satelit: ±\${gpsAccuracy}m\` : 'Menunggu pergerakan...'}
                </Text>
              </View>
            </View>

            {/* Display Jarak, Durasi, Kalori secara langsung */}
            <View style={styles.telemetryGrid}>
              <View style={styles.telemetryItem}>
                <MapPin size={16} color="#10B981" />
                <Text style={styles.telemetryLabel}>JARAK TEMPUH</Text>
                <Text style={styles.telemetryValue}>
                  {distanceMeters < 1000 ? \`\${Math.round(distanceMeters)} m\` : \`\${(distanceMeters / 1000).toFixed(2)} km\`}
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
                <TouchableOpacity style={styles.btnStart} onPress={handleStart}>
                  <Play size={18} color="#0B1C30" fill="#0B1C30" />
                  <Text style={styles.btnStartText}>Mulai</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.btnPause} onPress={handlePause}>
                  <Pause size={18} color="#0B1C30" fill="#0B1C30" />
                  <Text style={styles.btnStartText}>Berhenti</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.btnReset} onPress={handleReset}>
                <RotateCcw size={16} color="#FFFFFF" />
                <Text style={styles.btnResetText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#0B1C30', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0B1C30' },
  headerSub: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionBadge: { fontSize: 11, fontWeight: '800', color: '#10B981', letterSpacing: 0.5, marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 6 },
  genderRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 999, padding: 4, marginBottom: 12 },
  genderBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 8, borderRadius: 999 },
  genderBtnActive: { backgroundColor: '#FFF', elevation: 2 },
  genderText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  genderTextActive: { color: '#0F172A', fontWeight: '800' },
  stepperContainer: { marginBottom: 10 },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  circleBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
  stepperVal: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  resultCard: { marginTop: 12, borderRadius: 20, padding: 14, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 14 },
  bodySilhouetteBox: { alignItems: 'center', width: 70 },
  catBadge: { fontSize: 10, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  resultInfo: { flex: 1 },
  formulaText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  bmiNumber: { fontSize: 36, fontWeight: '900', color: '#0F172A' },
  bmiCategory: { fontSize: 15, fontWeight: '800' },
  idealRecBox: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  idealTitle: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  idealRange: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  deltaText: { fontSize: 11, fontWeight: '700', color: '#D97706', marginTop: 2 },
  darkCard: { backgroundColor: '#0B1C30', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#1E293B' },
  darkCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  navIconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.15)', justifyContent: 'center', alignItems: 'center' },
  darkCardBadge: { fontSize: 10, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 },
  darkCardTitle: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  runnerGraphicRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0F172A', padding: 12, borderRadius: 16, marginBottom: 14 },
  runnerBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  runnerStatusTitle: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  runnerStatusSub: { fontSize: 11, color: '#94A3B8' },
  telemetryGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  telemetryItem: { flex: 1, backgroundColor: '#0F172A', padding: 12, borderRadius: 16, alignItems: 'center' },
  telemetryLabel: { fontSize: 9, fontWeight: '700', color: '#94A3B8', marginTop: 4 },
  telemetryValue: { fontSize: 16, fontWeight: '900', color: '#FFF', marginTop: 2 },
  btnActionRow: { flexDirection: 'row', gap: 10 },
  btnStart: { flex: 1, height: 50, borderRadius: 999, backgroundColor: '#10B981', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnPause: { flex: 1, height: 50, borderRadius: 999, backgroundColor: '#F59E0B', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnStartText: { color: '#0B1C30', fontSize: 15, fontWeight: '800' },
  btnReset: { paddingHorizontal: 20, height: 50, borderRadius: 999, backgroundColor: '#1E293B', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  btnResetText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
`;

  const copyCode = () => {
    navigator.clipboard.writeText(activeTab === 'app' ? expoAppCode : expoSetupInstructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1c30] text-white w-full max-w-2xl rounded-[28px] p-5 sm:p-6 shadow-2xl border border-slate-700 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10b981]/20 text-[#10b981] flex items-center justify-center border border-[#10b981]/30 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] sm:text-[18px] font-extrabold text-white tracking-tight">
                  Kode Expo React Native (Single Screen)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#10b981] text-black">
                  Expo Ready
                </span>
              </div>
              <p className="text-[12px] text-slate-400">
                1 Halaman Lengkap: Kalkulator BMI + Sensor Pemantau Jarak Tempuh
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mt-4 mb-2 bg-slate-900 p-1 rounded-full border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('app')}
            className={`flex-1 py-1.5 px-3 rounded-full text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'app' ? 'bg-[#10b981] text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Kode Expo App.tsx
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-1.5 px-3 rounded-full text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'setup' ? 'bg-[#10b981] text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Panduan CLI &amp; Sensor Expo Location
          </button>
        </div>

        {/* Code Content Area */}
        <div className="relative flex-1 overflow-hidden my-2 rounded-[16px] bg-slate-950 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
            <span>{activeTab === 'app' ? 'App.tsx (Expo React Native Single Screen)' : 'Terminal Bash'}</span>
            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1 text-[#10b981] hover:text-[#34d399] font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin!' : 'Salin Kode'}
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-[12px] text-slate-300 leading-relaxed select-all">
            <pre>{activeTab === 'app' ? expoAppCode : expoSetupInstructions}</pre>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
          <span className="text-slate-400 flex items-center gap-1.5 text-center sm:text-left">
            <Sparkles className="w-4 h-4 text-[#10b981] shrink-0" />
            Tanpa React Navigation. Tampilan web di bawah bekerja secara langsung dengan sensor Geolocation.
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="w-full sm:w-auto h-[40px] px-5 rounded-full bg-[#10b981] text-slate-950 font-bold hover:bg-[#34d399] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
          >
            {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Berhasil Disalin!' : 'Salin Kode Expo App.tsx'}
          </button>
        </div>
      </div>
    </div>
  );
};
