export function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(2)} km`;
}

export function formatDurationShort(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}d`;
}

export function formatDateId(date: Date): { dateFormatted: string; timeFormatted: string } {
  return {
    dateFormatted: date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    timeFormatted: date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function formatCalories(calories: number): string {
  return `${calories.toLocaleString('id-ID')}`;
}

// Rata-rata pace "m/dtk per km" → "6'11\""
export function formatPace(distanceMeters: number, durationSeconds: number): string {
  if (distanceMeters < 10 || durationSeconds <= 0) return "–'––\"";
  const minPerKm = durationSeconds / 60 / (distanceMeters / 1000);
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  const safeSecs = secs === 60 ? 59 : secs;
  return `${mins}'${safeSecs.toString().padStart(2, '0')}"`;
}

// "1j 42m" / "24m 15d"
export function formatDurationLong(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m ${totalSeconds % 60}d`;
}

export function formatElevation(meters: number): string {
  const rounded = Math.round(meters);
  return rounded >= 0 ? `+${rounded}` : `${rounded}`;
}
