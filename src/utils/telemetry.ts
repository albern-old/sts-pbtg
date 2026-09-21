import {
  ActivityLevel,
  BMICategoryInfo,
  BMICategoryType,
  Gender,
  HeartRateZone,
  TelemetryMetrics,
} from '../types';

export const BMI_CATEGORIES: Record<BMICategoryType, BMICategoryInfo> = {
  underweight: {
    type: 'underweight',
    label: 'Kurus',
    badge: 'Di Bawah Normal',
    color: '#3B82F6', // Electric Cobalt Blue
    lightBg: 'rgba(59, 130, 246, 0.1)',
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
    lightBg: 'rgba(16, 185, 129, 0.1)',
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
    lightBg: 'rgba(245, 158, 11, 0.1)',
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
    lightBg: 'rgba(239, 68, 68, 0.1)',
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
  activity: ActivityLevel = 'moderate'
): TelemetryMetrics {
  const heightM = heightCm / 100;
  const bmiRaw = heightM > 0 ? weightKg / (heightM * heightM) : 0;
  const bmi = Math.round(bmiRaw * 10) / 10;

  const category = getBMICategory(bmi);

  // Rentang berat badan ideal WHO (BMI 18.5 - 24.9)
  const idealWeightMin = Math.round(18.5 * heightM * heightM * 10) / 10;
  const idealWeightMax = Math.round(24.9 * heightM * heightM * 10) / 10;

  let weightDeltaToNormal = 0;
  if (weightKg > idealWeightMax) {
    weightDeltaToNormal = Math.round((weightKg - idealWeightMax) * 10) / 10;
  } else if (weightKg < idealWeightMin) {
    weightDeltaToNormal = Math.round((weightKg - idealWeightMin) * 10) / 10;
  }

  // Basal Metabolic Rate (BMR) - Formula Mifflin-St Jeor
  let bmrRaw: number;
  if (gender === 'male') {
    bmrRaw = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmrRaw = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  const bmr = Math.max(800, Math.round(bmrRaw));

  // TDEE Multipliers (Standar Harris-Benedict & Mifflin-St Jeor)
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };
  const activityMultiplier = activityMultipliers[activity] || 1.55;
  const tdee = Math.round(bmr * activityMultiplier);
  const activityCalories = Math.max(0, tdee - bmr);

  // Deurenberg Body Fat Formula:
  // Adult %BF = (1.20 × BMI) + (0.23 × Age) - (10.8 × Sex) - 5.4 (Sex: male = 1, female = 0)
  const sexFactor = gender === 'male' ? 1 : 0;
  const bfRaw = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;
  const bodyFatPercentage = Math.max(5, Math.min(60, Math.round(bfRaw * 10) / 10));

  // Hidrasi yang direkomendasikan berbasis Berat Badan & Tingkat Aktivitas (Standar Klinis ACSM & Mayo Clinic)
  // Base metabolisme: ~35ml/kg
  // Kompensasi keringat & respirasi latihan:
  const hydrationBonuses: Record<ActivityLevel, number> = {
    sedentary: 0.1,
    light: 0.3,
    moderate: 0.6,
    active: 0.9,
    athlete: 1.4,
  };
  const hydrationActivityBonus = hydrationBonuses[activity] || 0.6;
  const baseWater = (weightKg * 35) / 1000;
  const waterIntakeLiters = Math.round((baseWater + hydrationActivityBonus) * 10) / 10;

  // Max Heart Rate: 220 - Usia
  const maxHeartRate = Math.max(130, 220 - age);
  const heartRateZones: HeartRateZone[] = [
    {
      zone: 1,
      name: 'Recovery & Warm-up',
      rangePercentage: '50% - 60%',
      bpmRange: `${Math.round(maxHeartRate * 0.5)} - ${Math.round(maxHeartRate * 0.6)} bpm`,
      intensity: 'Light Effort',
      color: '#3B82F6',
      description: 'Restorasi aktif, oksigenasi jaringan, dan mobilitas pemanasan/pendinginan.',
    },
    {
      zone: 2,
      name: 'Fat Oxidation & Base',
      rangePercentage: '60% - 70%',
      bpmRange: `${Math.round(maxHeartRate * 0.6)} - ${Math.round(maxHeartRate * 0.7)} bpm`,
      intensity: 'Moderate Endurance',
      color: '#10B981',
      description: 'Pengembangan kepadatan mitokondria dan efisiensi pembakaran lemak.',
    },
    {
      zone: 3,
      name: 'Aerobic Power',
      rangePercentage: '70% - 80%',
      bpmRange: `${Math.round(maxHeartRate * 0.7)} - ${Math.round(maxHeartRate * 0.8)} bpm`,
      intensity: 'Tempo / Aerobik',
      color: '#84CC16',
      description: 'Peningkatan volume sekuncup jantung dan ekspansi stamina atletik.',
    },
    {
      zone: 4,
      name: 'Lactate Threshold',
      rangePercentage: '80% - 90%',
      bpmRange: `${Math.round(maxHeartRate * 0.8)} - ${Math.round(maxHeartRate * 0.9)} bpm`,
      intensity: 'Hard / Threshold',
      color: '#F59E0B',
      description: 'Daya tahan otot tinggi di bawah akumulasi laktat, penjagaan kecepatan.',
    },
    {
      zone: 5,
      name: 'Neuromuscular Peak',
      rangePercentage: '90% - 100%',
      bpmRange: `${Math.round(maxHeartRate * 0.9)} - ${maxHeartRate} bpm`,
      intensity: 'Maksimum Sprint',
      color: '#EF4444',
      description: 'Kekuatan anaerobik eksplosif, output sprint maksimum & kapasitas VO2 max.',
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
    activityLevel: activity,
    activityMultiplier,
    activityCalories,
    hydrationActivityBonus,
    bodyFatPercentage,
    waterIntakeLiters,
    maxHeartRate,
    heartRateZones,
  };
}
