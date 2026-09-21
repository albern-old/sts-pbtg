import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Flame,
  Clock,
  Gauge,
  MapPin,
  Compass,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { calculateHaversineDistance, calculateActivityCalories } from '../utils/telemetry';
import { LocationCoord, TrackerStatus, UnitSystem } from '../types';

interface GpsActivityTrackerProps {
  userWeightKg: number;
  unitSystem?: UnitSystem;
}

export const GpsActivityTracker: React.FC<GpsActivityTrackerProps> = ({
  userWeightKg,
  unitSystem = 'metric',
}) => {
  const [status, setStatus] = useState<TrackerStatus>('idle');
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [lastCoord, setLastCoord] = useState<LocationCoord | null>(null);
  const [isSimulation, setIsSimulation] = useState<boolean>(false);
  const [pointCount, setPointCount] = useState<number>(0);

  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Unmount cleanup to prevent GPS sensor memory leaks
  useEffect(() => {
    return () => {
      stopGpsWatch();
    };
  }, []);

  // Calculate calories burned in real-time
  const caloriesBurned = calculateActivityCalories(userWeightKg, distanceMeters, durationSeconds);

  // Format Duration HH:MM:SS or MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start GPS Geolocation watching
  const startGpsWatch = () => {
    if (!navigator.geolocation) {
      setGpsError('Sensor lokasi (Geolocation) tidak didukung pada peramban ini.');
      return;
    }

    setGpsError(null);

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, speed } = position.coords;
      const now = Date.now();

      setGpsAccuracy(accuracy ? Math.round(accuracy) : 5);

      setLastCoord((prev) => {
        if (prev) {
          const deltaMeters = calculateHaversineDistance(
            prev.latitude,
            prev.longitude,
            latitude,
            longitude
          );

          // Threshold check: ignore GPS jitter under 1.5 meters unless moving
          if (deltaMeters > 1.5 && deltaMeters < 500) {
            setDistanceMeters((d) => d + deltaMeters);
            setPointCount((c) => c + 1);

            // Calculate speed in km/h if available, else derive from delta
            if (speed !== null && speed >= 0) {
              setCurrentSpeedKmh(Math.round(speed * 3.6 * 10) / 10);
            } else {
              const timeDeltaSec = (now - prev.timestamp) / 1000;
              if (timeDeltaSec > 0) {
                const derivedSpeed = (deltaMeters / timeDeltaSec) * 3.6;
                setCurrentSpeedKmh(Math.round(derivedSpeed * 10) / 10);
              }
            }
          }
        }
        return {
          latitude,
          longitude,
          accuracy: accuracy || null,
          speed: speed || null,
          timestamp: now,
        };
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setGpsError('Izin akses sensor lokasi HP ditolak. Aktifkan izin lokasi untuk pelacakan.');
          break;
        case error.POSITION_UNAVAILABLE:
          setGpsError('Sinyal GPS lokasi tidak tersedia. Coba gunakan fitur simulasi atau di area terbuka.');
          break;
        case error.TIMEOUT:
          setGpsError('Permintaan lokasi melebihi batas waktu.');
          break;
        default:
          setGpsError('Terjadi kesalahan sensor lokasi.');
      }
    };

    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000,
    });
    watchIdRef.current = id;
  };

  // Stop Geolocation watch
  const stopGpsWatch = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Timer interval handler
  useEffect(() => {
    if (status === 'tracking') {
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [status]);

  // Simulation mode (for indoor testing or devices without moving GPS)
  useEffect(() => {
    if (status === 'tracking' && isSimulation) {
      simulationIntervalRef.current = setInterval(() => {
        // Simulate running pace: ~8.5 km/h = ~2.36 m/s
        const delta = 2.3 + (Math.random() * 0.8 - 0.4);
        setDistanceMeters((d) => d + delta);
        setCurrentSpeedKmh(Math.round((delta * 3.6) * 10) / 10);
        setGpsAccuracy(3);
        setPointCount((c) => c + 1);
      }, 1000);
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [status, isSimulation]);

  // Handle Controls: Mulai, Berhenti, Reset
  const handleStart = () => {
    setStatus('tracking');
    if (!isSimulation) {
      startGpsWatch();
    }
  };

  const handlePause = () => {
    setStatus('paused');
    stopGpsWatch();
    setCurrentSpeedKmh(0);
  };

  const handleReset = () => {
    setStatus('idle');
    stopGpsWatch();
    setDistanceMeters(0);
    setDurationSeconds(0);
    setCurrentSpeedKmh(0);
    setLastCoord(null);
    setPointCount(0);
    setGpsError(null);
  };

  const distanceKm = (distanceMeters / 1000).toFixed(2);
  const distanceMiles = (distanceMeters * 0.000621371).toFixed(2);
  const distanceFormatted =
    unitSystem === 'imperial'
      ? `${distanceMiles} mi`
      : distanceMeters < 1000
      ? `${Math.round(distanceMeters)} m`
      : `${distanceKm} km`;

  const displaySpeed =
    unitSystem === 'imperial'
      ? (currentSpeedKmh * 0.621371).toFixed(1)
      : currentSpeedKmh.toFixed(1);
  const speedUnit = unitSystem === 'imperial' ? 'mph' : 'km/jam';

  return (
    <div className="bg-[#0b1c30] text-white rounded-[28px] p-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Decorative ambient pulse */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#10b981]/20 text-[#10b981] flex items-center justify-center border border-[#10b981]/30 shrink-0">
            <Navigation className={`w-6 h-6 ${status === 'tracking' ? 'animate-pulse text-[#34d399]' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-extrabold text-white tracking-tight">
                Pemantau Jarak Tempuh
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                  status === 'tracking'
                    ? 'bg-[#10b981] text-slate-950 animate-pulse'
                    : status === 'paused'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {status === 'tracking' ? 'Sensor Aktif' : status === 'paused' ? 'Dihentikan Sementara' : 'Siap Mulai'}
              </span>
            </div>
            <p className="text-[12px] text-slate-400">
              Sensor GPS Expo Location • Penghitung Jarak, Durasi &amp; Kalori Langsung
            </p>
          </div>
        </div>

        {/* Sensor & Simulation Toggle Mode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsSimulation(!isSimulation);
              if (status === 'tracking') {
                if (!isSimulation) {
                  stopGpsWatch();
                } else {
                  startGpsWatch();
                }
              }
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              isSimulation
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Aktifkan simulasi pergerakan bila sedang di dalam ruangan atau di PC"
          >
            <Compass className="w-3.5 h-3.5" />
            {isSimulation ? 'Mode Simulasi Aktif' : 'GPS Nyata'}
          </button>
        </div>
      </div>

      {/* GPS Error Notification if permission denied */}
      {gpsError && (
        <div className="mt-4 p-3 rounded-2xl bg-red-900/30 border border-red-500/40 flex items-start gap-2.5 text-[12px] text-red-200">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">{gpsError}</span>
            <p className="text-[11px] text-red-300/80 mt-0.5">
              Tips: Anda dapat mengaktifkan &quot;Mode Simulasi Aktif&quot; di atas untuk menguji pergerakan secara virtual.
            </p>
          </div>
        </div>
      )}

      {/* Supporting Graphic: Athletic Runner Animation & Radar Progress Pod */}
      <div className="my-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Dynamic Graphic 1: Kinetic Runner Figure */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-20 h-20 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 overflow-hidden shrink-0 shadow-inner">
            {/* Pulsing concentric sonar circles when tracking */}
            {status === 'tracking' && (
              <>
                <div className="absolute inset-0 rounded-2xl border-2 border-[#10b981] animate-ping opacity-25" />
                <div className="absolute inset-2 rounded-xl border border-[#10b981] animate-pulse opacity-40" />
              </>
            )}

            {/* SVG Runner Silhouette with dynamic movement */}
            <svg
              viewBox="0 0 64 64"
              className={`w-14 h-14 ${status === 'tracking' ? 'animate-bounce' : ''}`}
              style={{ animationDuration: currentSpeedKmh > 7 ? '0.6s' : '1s' }}
            >
              {/* Head */}
              <circle cx="36" cy="14" r="5" fill="#10B981" />
              {/* Torso tilted forward */}
              <line x1="34" y1="19" x2="26" y2="34" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
              {/* Left Arm (forward) */}
              <polyline points="32,22 42,26 48,22" fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Right Arm (back) */}
              <polyline points="32,22 22,24 16,30" fill="none" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
              {/* Left Leg (striding forward) */}
              <polyline points="26,34 36,44 46,42" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {/* Right Leg (pushing back) */}
              <polyline points="26,34 16,42 10,54" fill="none" stroke="#34D399" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#10b981]" />
              Status Sensor Lokasi
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[15px] font-bold text-white">
                {status === 'tracking' ? 'Mendeteksi Posisi...' : status === 'paused' ? 'Sensor Dijeda' : 'Siap Berlari / Berjalan'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {isSimulation
                ? 'Simulasi pergerakan aktif (laju ~8.5 km/jam)'
                : gpsAccuracy
                ? `Akurasi satelit GPS: ±${gpsAccuracy} meter (${pointCount} titik)`
                : 'Menggunakan GPS bawaan perangkat'}
            </span>
          </div>
        </div>

        {/* Speedometer Badge */}
        <div className="flex items-center gap-4 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800 self-stretch md:self-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#10b981]" />
            <span className="text-[12px] text-slate-400 font-semibold">Kecepatan:</span>
          </div>
          <span className="text-[16px] font-extrabold text-[#10b981]">
            {status === 'tracking' ? displaySpeed : 0} <span className="text-[11px] text-slate-400 font-bold">{speedUnit}</span>
          </span>
        </div>
      </div>

      {/* 3 Telemetry Metrics: Jarak Tempuh, Durasi, Kalori */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Jarak Tempuh */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider uppercase">Jarak Tempuh</span>
            <MapPin className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="my-2">
            <div className="text-[32px] font-black text-white tracking-tight leading-none">
              {distanceFormatted}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Total jarak akumulasi
            </span>
          </div>
        </div>

        {/* Metric 2: Durasi */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider uppercase">Durasi Waktu</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-[32px] font-black text-white tracking-tight font-mono leading-none">
              {formatTime(durationSeconds)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Waktu aktivitas aktif
            </span>
          </div>
        </div>

        {/* Metric 3: Kalori Terbakar */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider uppercase">Kalori Terbakar</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-[32px] font-black text-amber-400 tracking-tight leading-none">
              {caloriesBurned} <span className="text-[16px] font-bold text-slate-300">kkal</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Berdasarkan BB {userWeightKg} kg
            </span>
          </div>
        </div>
      </div>

      {/* Buttons: Mulai, Berhenti, Reset */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap sm:flex-nowrap items-center gap-3">
        {status !== 'tracking' ? (
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 h-[52px] rounded-full bg-[#10b981] hover:bg-[#34d399] text-slate-950 text-[15px] font-extrabold flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-[#10b981]/20 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            Mulai Aktivitas
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            className="flex-1 h-[52px] rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-[15px] font-extrabold flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer"
          >
            <Pause className="w-5 h-5 fill-current" />
            Berhenti (Jeda)
          </button>
        )}

        <button
          type="button"
          onClick={handleReset}
          disabled={status === 'idle' && distanceMeters === 0 && durationSeconds === 0}
          className="h-[52px] px-6 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
};
