import {
  ActivityLevel,
  BMICategoryInfo,
  BMICategoryType,
  Gender,
  HeartRateZone,
  TelemetryMetrics,
  UnitSystem,
} from '../types';

export const BMI_CATEGORIES: Record<BMICategoryType, BMICategoryInfo> = {
  underweight: {
    type: 'underweight',
    label: 'Kurus',
    badge: 'Di Bawah Normal',
    color: '#3B82F6', // Electric Cobalt Blue
    lightBg: 'rgba(59, 130, 246, 0.08)',
    borderAccent: '#3B82F6',
    range: '< 18.5',
    minVal: 0,
    maxVal: 18.5,
    summary: 'Indeks massa tubuh berada di bawah batas ideal (defisit kalori atau massa otot).',
    athleticAdvice: 'Fokus pada latihan beban progresif (hypertrophy) dan asupan kalori surplus berkualitas tinggi.',
    nutritionAdvice: 'Tambahkan surplus +300-500 kkal per hari dengan asupan protein 1.6-2.0g per kg berat badan.',
    riskNotice: 'Rentan terhadap kelelahan cepat, imunitas menurun, dan kepadatan tulang rendah.',
  },
  normal: {
    type: 'normal',
    label: 'Normal',
    badge: 'Rentang Ideal',
    color: '#10B981', // Energetic Emerald Green
    lightBg: 'rgba(16, 185, 129, 0.08)',
    borderAccent: '#10B981',
    range: '18.5 – 24.9',
    minVal: 18.5,
    maxVal: 24.9,
    summary: 'Komposisi massa tubuh seimbang dengan efisiensi kardiovaskular dan metabolisme prima.',
    athleticAdvice: 'Pertahankan periodisasi latihan: seimbangkan daya tahan kardio aerobik dengan latihan kekuatan.',
    nutritionAdvice: 'Pola makan isokalorik seimbang dengan karbohidrat kompleks, serat, dan hidrasi teratur.',
    riskNotice: 'Profil risiko kesehatan terendah dengan elastisitas vaskular dan metabolisme optimal.',
  },
  overweight: {
    type: 'overweight',
    label: 'Gemuk',
    badge: 'Kelebihan Berat',
    color: '#F59E0B', // Amber Flame
    lightBg: 'rgba(245, 158, 11, 0.08)',
    borderAccent: '#F59E0B',
    range: '25.0 – 29.9',
    minVal: 25.0,
    maxVal: 29.9,
    summary: 'Indeks massa tubuh menunjukkan kelebihan beban massa viseral atau sistemik.',
    athleticAdvice: 'Tingkatkan latihan kardio Zona 2 (3-4x seminggu) untuk mengoptimalkan oksidasi lemak.',
    nutritionAdvice: 'Terapkan defisit kalori moderat 300-400 kkal, perbanyak serat sayuran, dan kurangi gula olahan.',
    riskNotice: 'Beban berlebih pada persendian lutut/kaki serta potensi resistensi metabolik.',
  },
  obese: {
    type: 'obese',
    label: 'Obesitas',
    badge: 'Kategori Kritis',
    color: '#EF4444', // Vivid Crimson
    lightBg: 'rgba(239, 68, 68, 0.08)',
    borderAccent: '#EF4444',
    range: '≥ 30.0',
    minVal: 30.0,
    maxVal: 50.0,
    summary: 'Beban massa tubuh tinggi yang memberikan tekanan signifikan pada sistem kardiovaskular.',
    athleticAdvice: 'Pilih olahraga beban sendi rendah (low-impact) seperti jalan cepat miring, renang, atau sepeda statis.',
    nutritionAdvice: 'Program hipokalorik terukur dengan kontrol porsi ketat, tinggi protein, dan konsultasi profesional.',
    riskNotice: 'Risiko tinggi hipertensi, beban jantung, hiperkolesterol, dan gangguan gula darah.',
  },
};

/**
 * Haversine formula to calculate the great-circle distance between two GPS coordinates in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate calories burned based on body weight (kg), distance (km), and duration (seconds)
 */
export function calculateActivityCalories(
  weightKg: number,
  distanceMeters: number,
  durationSeconds: number
): number {
  if (durationSeconds <= 0 && distanceMeters <= 0) return 0;
  const distanceKm = distanceMeters / 1000;
  const durationHours = durationSeconds / 3600;

  // Average speed in km/h
  const speedKmh = durationHours > 0 ? distanceKm / durationHours : 0;

  // MET estimation based on speed
  // walking ~4 km/h -> MET 3.5, jog ~7 km/h -> MET 7, run >10 km/h -> MET 10
  let met = 3.5;
  if (speedKmh > 9) {
    met = 10.0;
  } else if (speedKmh > 7) {
    met = 8.0;
  } else if (speedKmh > 5) {
    met = 5.0;
  } else if (speedKmh > 2) {
    met = 3.5;
  } else {
    met = 2.0; // very slow stroll / standing
  }

  // Calories = MET * weight_kg * duration_hours
  const calories = met * weightKg * durationHours;
  // Also account for direct kinetic work (distance)
  const distanceCalories = distanceKm * weightKg * 0.95;

  return Math.round(Math.max(calories, distanceCalories) * 10) / 10;
}


export function getBMICategory(bmi: number): BMICategoryInfo {
  if (bmi < 18.5) return BMI_CATEGORIES.underweight;
  if (bmi <= 24.9) return BMI_CATEGORIES.normal;
  if (bmi <= 29.9) return BMI_CATEGORIES.overweight;
  return BMI_CATEGORIES.obese;
}

export function calculateTelemetry(
  heightCm: number,
  weightKg: number,
  age: number,
  gender: Gender,
  activity: ActivityLevel
): TelemetryMetrics {
  const heightM = heightCm / 100;
  const bmiRaw = heightM > 0 ? weightKg / (heightM * heightM) : 0;
  const bmi = Math.round(bmiRaw * 10) / 10;

  const category = getBMICategory(bmi);

  // Ideal weight range based on WHO BMI 18.5 - 24.9
  const idealWeightMin = Math.round(18.5 * heightM * heightM * 10) / 10;
  const idealWeightMax = Math.round(24.9 * heightM * heightM * 10) / 10;

  let weightDeltaToNormal = 0;
  if (weightKg > idealWeightMax) {
    weightDeltaToNormal = Math.round((weightKg - idealWeightMax) * 10) / 10;
  } else if (weightKg < idealWeightMin) {
    weightDeltaToNormal = Math.round((weightKg - idealWeightMin) * 10) / 10; // negative
  }

  // Basal Metabolic Rate (BMR) - Mifflin-St Jeor equation
  let bmrRaw: number;
  if (gender === 'male') {
    bmrRaw = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmrRaw = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  const bmr = Math.max(800, Math.round(bmrRaw));

  // TDEE Multipliers
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };
  const tdee = Math.round(bmr * (activityMultipliers[activity] || 1.375));

  // Deurenberg Body Fat Formula
  // Adult %BF = (1.20 × BMI) + (0.23 × Age) - (10.8 × Sex) - 5.4 (Sex: male = 1, female = 0)
  const sexFactor = gender === 'male' ? 1 : 0;
  const bfRaw = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;
  const bodyFatPercentage = Math.max(5, Math.min(60, Math.round(bfRaw * 10) / 10));

  // Recommended hydration: ~35ml/kg + athletic factor
  const athleticWaterBoost = activity === 'athlete' ? 0.8 : activity === 'active' ? 0.5 : 0.2;
  const waterIntakeLiters = Math.round(((weightKg * 35) / 1000 + athleticWaterBoost) * 10) / 10;

  // Heart Rate & Zones
  const maxHeartRate = Math.max(130, 220 - age);
  const heartRateZones: HeartRateZone[] = [
    {
      zone: 1,
      name: 'Recovery & Warm-up',
      rangePercentage: '50% - 60%',
      bpmRange: `${Math.round(maxHeartRate * 0.5)} - ${Math.round(maxHeartRate * 0.6)} bpm`,
      intensity: 'Light Effort',
      color: '#3B82F6',
      description: 'Active restoration, tissue oxygenation, and warm-up/cool-down mobility.',
    },
    {
      zone: 2,
      name: 'Fat Oxidation & Base',
      rangePercentage: '60% - 70%',
      bpmRange: `${Math.round(maxHeartRate * 0.6)} - ${Math.round(maxHeartRate * 0.7)} bpm`,
      intensity: 'Moderate Endurance',
      color: '#10B981',
      description: 'Mitochondrial density development, metabolic fat burning efficiency.',
    },
    {
      zone: 3,
      name: 'Aerobic Power',
      rangePercentage: '70% - 80%',
      bpmRange: `${Math.round(maxHeartRate * 0.7)} - ${Math.round(maxHeartRate * 0.8)} bpm`,
      intensity: 'Tempo / Aerobic',
      color: '#84CC16',
      description: 'Cardiovascular stroke volume increase and athletic stamina expansion.',
    },
    {
      zone: 4,
      name: 'Lactate Threshold',
      rangePercentage: '80% - 90%',
      bpmRange: `${Math.round(maxHeartRate * 0.8)} - ${Math.round(maxHeartRate * 0.9)} bpm`,
      intensity: 'Hard / Threshold',
      color: '#F59E0B',
      description: 'Elevated muscle endurance under lactic accumulation, speed sustainment.',
    },
    {
      zone: 5,
      name: 'Neuromuscular Peak',
      rangePercentage: '90% - 100%',
      bpmRange: `${Math.round(maxHeartRate * 0.9)} - ${maxHeartRate} bpm`,
      intensity: 'Maximum Sprint',
      color: '#EF4444',
      description: 'Explosive anaerobic power, maximum sprint output and VO2 max capacity.',
    },
  ];

  return {
    bmi,
    category,
    idealWeightMin,
    idealWeightMax,
    weightDeltaToNormal,
    bmr,
    tdee,
    bodyFatPercentage,
    waterIntakeLiters,
    maxHeartRate,
    heartRateZones,
  };
}

// Unit conversion helpers
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number; text: string } {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches, text: `${feet}'${inches}"` };
}

export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54);
}
