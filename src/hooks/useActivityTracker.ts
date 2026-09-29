import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '../components/ActivityMap';
import { ActivityHistoryRecord, ActivityType } from '../types';
import { formatDateId } from '../utils/format';
import { estimateCaloriesKcal, getHaversineDistanceMeters } from '../utils/geo';
import { saveActivityHistory } from '../utils/historyStorage';
import { showAlert } from '../services/dialog';

export type TrackerStatus = 'idle' | 'tracking' | 'paused';

const FALLBACK: Coordinate = { latitude: -6.1754, longitude: 106.8272 };

// Aturan filter GPS dipertahankan dari implementasi sebelumnya:
// - abaikan fix dengan akurasi > 35 m
// - anggap diam bila kecepatan < 0.3 m/s
// - tolak spike > 14 m/s (~50 km/jam)
// - akumulasi rute hanya bila pergeseran >= 1 m
const MAX_ACCURACY_M = 35;
const STOP_SPEED_MPS = 0.3;
const MAX_REALISTIC_MPS = 14.0;
const MIN_STEP_M = 1.0;
// Akumulasi elevasi: abaikan noise vertikal < 1 m per langkah GPS
const ELEVATION_NOISE_M = 1.0;

export function useActivityTracker(weightKg: number) {
  const [status, setStatus] = useState<TrackerStatus>('idle');
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isSimulation, setIsSimulation] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('lari');
  const [elevationGainMeters, setElevationGainMeters] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<Coordinate[]>([]);

  const lastRecordedRef = useRef<{ lat: number; lon: number; time: number } | null>(null);
  const lastPingRef = useRef<{ lat: number; lon: number; time: number } | null>(null);
  const lastAltitudeRef = useRef<number | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const weightRef = useRef(weightKg);
  weightRef.current = weightKg;

  // Lokasi awal agar peta langsung fokus.
  useEffect(() => {
    (async () => {
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (loc?.coords) {
          setCurrentLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          if (loc.coords.accuracy) setAccuracy(Math.round(loc.coords.accuracy));
        }
      } catch {
        // Biarkan fallback Monas yang dipakai peta.
      }
    })();
  }, []);

  // Timer durasi.
  useEffect(() => {
    if (status !== 'tracking') return;
    const id = setInterval(() => setDurationSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // Simulasi dalam ruangan (~5.8 km/jam).
  useEffect(() => {
    if (!(status === 'tracking' && isSimulation)) {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      return;
    }
    let step = 0;
    simIntervalRef.current = setInterval(() => {
      step += 1;
      const delta = 1.6 + (Math.random() * 0.3 - 0.15);
      const kmh = Math.round(delta * 3.6 * 10) / 10;
      const cal = estimateCaloriesKcal(delta, weightRef.current, kmh);
      setDistanceMeters((d) => Math.round((d + delta) * 10) / 10);
      setSpeedKmh(kmh);
      setCaloriesBurned((c) => Math.round((c + cal) * 10) / 10);
      // Elevasi simulasi: gain kecil ~0.2 m/detik untuk tampilan realistis
      setElevationGainMeters((e) => Math.round((e + 0.2) * 10) / 10);
      setAccuracy(3);
      setCurrentLocation((prev) => {
        const base = prev ?? FALLBACK;
        const curve = Math.sin(step / 8) * 0.000015;
        const next: Coordinate = {
          latitude: base.latitude + 0.000025 + curve,
          longitude: base.longitude + 0.00003,
        };
        setRoute((coords) => (coords.length === 0 && prev ? [prev, next] : [...coords, next]));
        return next;
      });
    }, 1000);
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    };
  }, [status, isSimulation]);

  useEffect(
    () => () => {
      locationSubRef.current?.remove();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    },
    [],
  );

  const ensureStartPoint = (start: Coordinate) => {
    setRoute((coords) => {
      if (coords.length === 0) {
        lastRecordedRef.current = {
          lat: start.latitude,
          lon: start.longitude,
          time: Date.now(),
        };
        return [start];
      }
      if (lastRecordedRef.current) lastRecordedRef.current.time = Date.now();
      return coords;
    });
  };

  const start = async () => {
    setStatus('tracking');
    const startPoint = currentLocation ?? FALLBACK;
    if (!currentLocation) setCurrentLocation(startPoint);
    ensureStartPoint(startPoint);
    lastPingRef.current = null;
    if (isSimulation) return;

    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('idle');
        await showAlert(
          'Izin Lokasi Diperlukan',
          'Aktifkan GPS atau gunakan Mode Simulasi untuk mencoba pelacakan.',
        );
        return;
      }

      let resolvedStart = startPoint;
      if (!currentLocation) {
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (initial?.coords) {
          resolvedStart = {
            latitude: initial.coords.latitude,
            longitude: initial.coords.longitude,
          };
          setCurrentLocation(resolvedStart);
        }
      }
      ensureStartPoint(resolvedStart);

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000 },
        (loc) => {
          const { latitude, longitude, accuracy: acc, speed } = loc.coords;
          const now = Date.now();
          if (acc) setAccuracy(Math.round(acc));
          if (acc && acc > MAX_ACCURACY_M) return;

          const next: Coordinate = { latitude, longitude };
          setCurrentLocation(next);

          let speedMps = 0;
          if (speed !== null && speed !== undefined && speed >= 0) {
            speedMps = speed;
          } else if (lastPingRef.current) {
            const dt = (now - lastPingRef.current.time) / 1000;
            if (dt >= 0.2 && dt <= 5.0) {
              speedMps =
                getHaversineDistanceMeters(
                  lastPingRef.current.lat,
                  lastPingRef.current.lon,
                  latitude,
                  longitude,
                ) / dt;
            } else if (dt > 5.0) {
              const d = getHaversineDistanceMeters(
                lastPingRef.current.lat,
                lastPingRef.current.lon,
                latitude,
                longitude,
              );
              if (d >= 1.0 && d < 100) speedMps = 1.2;
            }
          }
          lastPingRef.current = { lat: latitude, lon: longitude, time: now };

          if (!lastRecordedRef.current) {
            lastRecordedRef.current = { lat: latitude, lon: longitude, time: now };
            setRoute([next]);
            return;
          }
          if (speedMps < STOP_SPEED_MPS) {
            setSpeedKmh(0);
            return;
          }

          const d = getHaversineDistanceMeters(
            lastRecordedRef.current.lat,
            lastRecordedRef.current.lon,
            latitude,
            longitude,
          );
          const realistic = speedMps < MAX_REALISTIC_MPS;
          if (d >= MIN_STEP_M && realistic) {
            const kmh = Math.round(speedMps * 3.6 * 10) / 10;
            const cal = estimateCaloriesKcal(d, weightRef.current, kmh);
            setDistanceMeters((p) => Math.round((p + d) * 10) / 10);
            setSpeedKmh(kmh);
            setCaloriesBurned((p) => Math.round((p + cal) * 10) / 10);
            setRoute((coords) => [...coords, next]);
            lastRecordedRef.current = { lat: latitude, lon: longitude, time: now };

            // Akumulasi elevasi dari altimeter GPS (gain = hanya naik signifikan)
            const altitude = loc.coords.altitude;
            if (altitude !== null && altitude !== undefined) {
              const prevAlt = lastAltitudeRef.current;
              lastAltitudeRef.current = altitude;
              if (prevAlt !== null) {
                const delta = altitude - prevAlt;
                if (delta > ELEVATION_NOISE_M) {
                  setElevationGainMeters((e) => Math.round((e + delta) * 10) / 10);
                }
              }
            }
          } else if (realistic) {
            setSpeedKmh(Math.round(speedMps * 3.6 * 10) / 10);
          }
        },
      );
      locationSubRef.current = sub;
    } catch {
      setStatus('idle');
      await showAlert(
        'GPS Tidak Tersedia',
        'Layanan lokasi tidak dapat diakses. Gunakan Mode Simulasi untuk mencoba pelacakan.',
      );
    }
  };

  const pause = () => {
    setStatus('paused');
    locationSubRef.current?.remove();
    locationSubRef.current = null;
    setSpeedKmh(0);
    lastPingRef.current = null;
  };

  const resetLocal = () => {
    pause();
    setStatus('idle');
    setDistanceMeters(0);
    setDurationSeconds(0);
    setSpeedKmh(0);
    setCaloriesBurned(0);
    setElevationGainMeters(0);
    setRoute([]);
    setCurrentLocation(null);
    lastRecordedRef.current = null;
    lastPingRef.current = null;
    lastAltitudeRef.current = null;
  };

  const persistSession = async (): Promise<ActivityHistoryRecord> => {
    const { dateFormatted, timeFormatted } = formatDateId(new Date());
    const km = distanceMeters / 1000;
    const hours = durationSeconds / 3600;
    const avg = hours > 0 && km > 0 ? Math.round((km / hours) * 10) / 10 : speedKmh;
    const record: ActivityHistoryRecord = {
      id: `act-${Date.now()}`,
      timestamp: Date.now(),
      dateFormatted,
      timeFormatted,
      distanceMeters,
      durationSeconds,
      caloriesBurned,
      speedKmh: avg,
      routeCoordinates: [...route],
      activityType,
      elevationGainMeters,
    };
    return record;
  };

  return {
    status,
    distanceMeters,
    durationSeconds,
    speedKmh,
    caloriesBurned,
    accuracy,
    isSimulation,
    setIsSimulation,
    activityType,
    setActivityType,
    elevationGainMeters,
    currentLocation,
    route,
    start,
    pause,
    resetLocal,
    persistSession,
  };
}

export async function saveTrackerSession(
  record: ActivityHistoryRecord,
): Promise<ActivityHistoryRecord[]> {
  return saveActivityHistory(record);
}
