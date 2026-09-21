import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Check,
  BookmarkPlus,
  RotateCcw,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import {
  ActivityLevel,
  Gender,
  TelemetrySnapshot,
  UnitSystem,
} from './types';
import {
  calculateTelemetry,
  cmToFeetInches,
  feetInchesToCm,
  kgToLbs,
  lbsToKg,
} from './utils/telemetry';
import { Header } from './components/Header';
import { SegmentedControl } from './components/SegmentedControl';
import { BiometricInput } from './components/BiometricInput';
import { BmiGauge } from './components/BmiGauge';
import { BodyIllustration } from './components/BodyIllustration';
import { StatusCard } from './components/StatusCard';
import { TelemetryGrid } from './components/TelemetryGrid';
import { GpsActivityTracker } from './components/GpsActivityTracker';
import { HeartRateZonesModal } from './components/HeartRateZonesModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ExpoCodeModal } from './components/ExpoCodeModal';

export default function App() {
  // Biometric state (stored internally in metric units for calculation consistency)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(72.5);
  const [age, setAge] = useState<number>(26);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');

  // Interactive Modals
  const [isHeartZonesOpen, setIsHeartZonesOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isExpoModalOpen, setIsExpoModalOpen] = useState<boolean>(false);
  const [justLogged, setJustLogged] = useState<boolean>(false);

  // Persistent Snapshots
  const [snapshots, setSnapshots] = useState<TelemetrySnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('kinetic_pulse_snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kinetic_pulse_snapshots', JSON.stringify(snapshots));
    } catch (e) {
      console.error('Failed to save snapshots to localStorage', e);
    }
  }, [snapshots]);

  // Derived telemetry metrics
  const metrics = useMemo(() => {
    return calculateTelemetry(heightCm, weightKg, age, gender, activity);
  }, [heightCm, weightKg, age, gender, activity]);

  // Values in current display unit system
  const displayWeight = useMemo(() => {
    return unitSystem === 'metric' ? weightKg : kgToLbs(weightKg);
  }, [weightKg, unitSystem]);

  const displayHeight = useMemo(() => {
    return unitSystem === 'metric' ? heightCm : Math.round(heightCm / 2.54);
  }, [heightCm, unitSystem]);

  const handleWeightChange = (newVal: number) => {
    if (unitSystem === 'metric') {
      setWeightKg(newVal);
    } else {
      setWeightKg(lbsToKg(newVal));
    }
  };

  const handleHeightChange = (newVal: number) => {
    if (unitSystem === 'metric') {
      setHeightCm(newVal);
    } else {
      setHeightCm(Math.round(newVal * 2.54));
    }
  };

  // Secondary representations for high-precision awareness
  const secondaryHeightText = useMemo(() => {
    if (unitSystem === 'metric') {
      return cmToFeetInches(heightCm).text;
    } else {
      return `${heightCm} cm`;
    }
  }, [heightCm, unitSystem]);

  const secondaryWeightText = useMemo(() => {
    if (unitSystem === 'metric') {
      return `${kgToLbs(weightKg)} lbs`;
    } else {
      return `${weightKg} kg`;
    }
  }, [weightKg, unitSystem]);

  // Log Telemetry Snapshot
  const handleLogSnapshot = () => {
    const newSnapshot: TelemetrySnapshot = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      unitSystem,
      gender,
      age,
      height: heightCm,
      weight: weightKg,
      bmi: metrics.bmi,
      categoryType: metrics.category.type,
      categoryLabel: metrics.category.label,
      categoryColor: metrics.category.color,
      tdee: metrics.tdee,
      bodyFat: metrics.bodyFatPercentage,
    };

    setSnapshots((prev) => [newSnapshot, ...prev]);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2400);
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearHistory = () => {
    setSnapshots([]);
  };

  const handleResetDefaults = () => {
    setHeightCm(175);
    setWeightKg(72.5);
    setAge(26);
    setGender('male');
    setActivity('moderate');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col items-center justify-start py-4 sm:py-8 px-3 sm:px-6">
      {/* Mobile container / Centered athletic telemetry canvas */}
      <main className="w-full max-w-xl flex flex-col gap-4">
        {/* Telemetry Header */}
        <Header
          unitSystem={unitSystem}
          onToggleUnit={setUnitSystem}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenExpoCode={() => setIsExpoModalOpen(true)}
          historyCount={snapshots.length}
        />

        {/* ========================================================= */}
        {/* BAGIAN 1: KALKULATOR BMI                                  */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-slate-800">
                Bagian 1 • Kalkulator BMI
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Formula: berat ÷ [tinggi (m)]²
            </span>
          </div>

          {/* Gender Selector: Pria / Wanita */}
          <div className="bg-white rounded-[24px] p-3.5 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b]">
                Profil Fisiologis (Gender)
              </span>
              <span className="text-[11px] font-medium text-[#64748b]">
                Dasar BMR &amp; Komposisi Tubuh
              </span>
            </div>

            <SegmentedControl<Gender>
              name="gender-selector"
              value={gender}
              onChange={setGender}
              options={[
                {
                  value: 'male',
                  label: 'Pria',
                  icon: <User className="w-4 h-4" />,
                },
                {
                  value: 'female',
                  label: 'Wanita',
                  icon: <User className="w-4 h-4" />,
                },
              ]}
            />
          </div>

          {/* Input Tinggi Badan (cm) & Berat Badan (kg) */}
          <div className="flex flex-col gap-3">
            {/* Height Input Card */}
            <BiometricInput
              label="Tinggi Badan"
              sublabel="Dimensi Linier"
              value={displayHeight}
              unit={unitSystem === 'metric' ? 'cm' : 'in'}
              min={unitSystem === 'metric' ? 120 : 47}
              max={unitSystem === 'metric' ? 220 : 87}
              step={1}
              onChange={handleHeightChange}
              secondaryDisplay={secondaryHeightText}
              presets={unitSystem === 'metric' ? [155, 165, 170, 175, 180] : [63, 67, 69, 71, 73]}
            />

            {/* Weight Input Card */}
            <BiometricInput
              label="Berat Badan"
              sublabel="Massa Tubuh"
              value={displayWeight}
              unit={unitSystem === 'metric' ? 'kg' : 'lbs'}
              min={unitSystem === 'metric' ? 30 : 66}
              max={unitSystem === 'metric' ? 190 : 418}
              step={0.5}
              onChange={handleWeightChange}
              secondaryDisplay={secondaryWeightText}
              presets={unitSystem === 'metric' ? [55, 65, 70, 75, 85] : [132, 154, 165, 176, 198]}
            />

            {/* Age & Quick Activity Matrix */}
            <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#e2e8f0]/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-col gap-3">
              {/* Age selector */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b] block">
                    Usia Pengguna
                  </span>
                  <span className="text-[12px] font-medium text-[#64748b]">
                    Parameter Denyut Jantung Maksimum &amp; BMR
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAge((prev) => Math.max(10, prev - 1))}
                    className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-bold flex items-center justify-center transition-colors cursor-pointer border border-[#e2e8f0]"
                  >
                    -
                  </button>
                  <span className="text-[19px] font-extrabold text-[#0f172a] w-10 text-center">
                    {age}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAge((prev) => Math.min(95, prev + 1))}
                    className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-bold flex items-center justify-center transition-colors cursor-pointer border border-[#e2e8f0]"
                  >
                    +
                  </button>
                  <span className="text-[12px] font-bold text-[#64748b]">thn</span>
                </div>
              </div>

              {/* Activity Level Selector */}
              <div className="pt-2 border-t border-[#f1f5f9]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-[#64748b]">
                    Tingkat Aktivitas Harian
                  </span>
                  <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">
                    {activity}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(
                    [
                      { id: 'sedentary', label: 'Ringan', sub: 'x1.20' },
                      { id: 'light', label: 'Jalan', sub: 'x1.37' },
                      { id: 'moderate', label: 'Sedang', sub: 'x1.55' },
                      { id: 'active', label: 'Aktif', sub: 'x1.72' },
                      { id: 'athlete', label: 'Atlet', sub: 'x1.90' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivity(item.id)}
                      className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer border ${
                        activity === item.id
                          ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                          : 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-none">{item.label}</div>
                      <div className="text-[9px] font-semibold opacity-70 mt-1">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Output 1: Telemetry Gauge (Nilai BMI & Kategori Kurus/Normal/Gemuk/Obesitas) */}
          <BmiGauge bmi={metrics.bmi} category={metrics.category} />

          {/* Output 2: Body Silhouette & Rekomendasi Berat Badan Ideal */}
          <BodyIllustration
            gender={gender}
            category={metrics.category}
            bmi={metrics.bmi}
            weightKg={weightKg}
            idealWeightMin={metrics.idealWeightMin}
            idealWeightMax={metrics.idealWeightMax}
            weightDeltaToNormal={metrics.weightDeltaToNormal}
            unitSystem={unitSystem}
          />

          {/* Output 3: Status Card & Rekomendasi Gizi/Olahraga */}
          <StatusCard
            category={metrics.category}
            weightDelta={metrics.weightDeltaToNormal}
            unitSystem={unitSystem}
          />

          {/* Output 4: Metric Performance Matrix */}
          <TelemetryGrid
            metrics={metrics}
            unitSystem={unitSystem}
            onOpenHeartZones={() => setIsHeartZonesOpen(true)}
          />

          {/* Log Snapshot & Reset Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={handleLogSnapshot}
              className={`w-full sm:flex-1 h-[52px] rounded-full font-bold text-[15px] tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer ${
                justLogged
                  ? 'bg-[#00422b] text-white shadow-[0_8px_24px_rgba(0,66,43,0.3)]'
                  : 'bg-[#10b981] hover:bg-[#059669] text-white shadow-[0_8px_24px_rgba(16,185,129,0.3)] active:scale-[0.99]'
              }`}
            >
              {justLogged ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Snapshot BMI Tersimpan!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-5 h-5" />
                  <span>Simpan Riwayat BMI</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              title="Reset ke Nilai Awal"
              className="w-full sm:w-auto h-[52px] px-5 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#e2e8f0]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748b]" />
              <span>Reset BMI</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BAGIAN 2: PEMANTAU JARAK TEMPUH (SENSOR LOKASI HP)        */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-3.5 pt-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
              <h2 className="text-[13px] font-extrabold uppercase tracking-wider text-slate-800">
                Bagian 2 • Pemantau Jarak Tempuh
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Sensor Geolocation / Expo Location
            </span>
          </div>

          {/* Full GPS Activity Tracker Component */}
          <GpsActivityTracker userWeightKg={weightKg} unitSystem={unitSystem} />
        </div>

        {/* Athletic Quote / Motivation Micro-bar */}
        <footer className="pt-4 pb-8 flex items-center justify-center gap-2 text-center text-[12px] font-medium text-[#94a3b8]">
          <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          <span>Kinetic Pulse • Aplikasi Expo React Native Single Screen</span>
        </footer>

      </main>

      {/* Heart Rate Zones Modal */}
      <HeartRateZonesModal
        isOpen={isHeartZonesOpen}
        onClose={() => setIsHeartZonesOpen(false)}
        age={age}
        maxHeartRate={metrics.maxHeartRate}
        zones={metrics.heartRateZones}
      />

      {/* Snapshots History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        snapshots={snapshots}
        onClearHistory={handleClearHistory}
        onDeleteSnapshot={handleDeleteSnapshot}
      />

      {/* Expo React Native Code & Setup Modal */}
      <ExpoCodeModal
        isOpen={isExpoModalOpen}
        onClose={() => setIsExpoModalOpen(false)}
      />
    </div>
  );
}
