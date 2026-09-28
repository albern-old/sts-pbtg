import { ActivityHistoryRecord, BmiHistoryRecord } from '../types';

export type PeriodFilter = 'week' | 'month' | 'year';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Awal pekan: Senin
export function startOfWeek(d = new Date()): Date {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7; // Senin = 0
  x.setDate(x.getDate() - day);
  return x;
}

export function startOfMonth(d = new Date()): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export function startOfYear(d = new Date()): Date {
  const x = startOfDay(d);
  x.setMonth(0, 1);
  return x;
}

export function periodStart(period: PeriodFilter): Date {
  if (period === 'month') return startOfMonth();
  if (period === 'year') return startOfYear();
  return startOfWeek();
}

export function filterActivitiesByPeriod(
  records: ActivityHistoryRecord[],
  period: PeriodFilter,
): ActivityHistoryRecord[] {
  const from = periodStart(period).getTime();
  return records.filter((r) => r.timestamp >= from);
}

export function filterBmiByPeriod(
  records: BmiHistoryRecord[],
  period: PeriodFilter,
): BmiHistoryRecord[] {
  const from = periodStart(period).getTime();
  return records.filter((r) => r.timestamp >= from);
}

export interface ActivityStats {
  sessionCount: number;
  distanceMeters: number;
  calories: number;
  durationSeconds: number;
}

export function summarize(records: ActivityHistoryRecord[]): ActivityStats {
  let distance = 0;
  let calories = 0;
  let duration = 0;
  for (const r of records) {
    distance += r.distanceMeters;
    calories += r.caloriesBurned;
    duration += r.durationSeconds;
  }
  return {
    sessionCount: records.length,
    distanceMeters: distance,
    calories: Math.round(calories),
    durationSeconds: duration,
  };
}

// Agregat jarak per hari Senin→Minggu dalam periode terpilih.
// Mengembalikan {km per hari, index hari puncak}.
export function weekdayDistanceKm(
  records: ActivityHistoryRecord[],
  period: PeriodFilter,
): { days: number[]; peakIndex: number; peakKm: number } {
  const days = [0, 0, 0, 0, 0, 0, 0];
  const from = periodStart(period).getTime();
  for (const r of records) {
    if (r.timestamp < from) continue;
    const jsDay = new Date(r.timestamp).getDay();
    const idx = (jsDay + 6) % 7;
    days[idx] += r.distanceMeters / 1000;
  }
  const rounded = days.map((v) => Math.round(v * 10) / 10);
  let peakIndex = 0;
  for (let i = 1; i < rounded.length; i += 1) {
    if (rounded[i] > rounded[peakIndex]) peakIndex = i;
  }
  return { days: rounded, peakIndex, peakKm: rounded[peakIndex] };
}

export function averageBmi(records: BmiHistoryRecord[]): number | null {
  if (records.length === 0) return null;
  const sum = records.reduce((acc, r) => acc + r.bmi, 0);
  return Math.round((sum / records.length) * 10) / 10;
}
