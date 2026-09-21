export type UnitSystem = 'metric' | 'imperial';

export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';

export type BMICategoryType = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BMICategoryInfo {
  type: BMICategoryType;
  label: string;
  badge: string;
  color: string;
  lightBg: string;
  borderAccent: string;
  range: string;
  minVal: number;
  maxVal: number;
  summary: string;
  athleticAdvice: string;
  nutritionAdvice: string;
  riskNotice: string;
}

export interface HeartRateZone {
  zone: number;
  name: string;
  rangePercentage: string;
  bpmRange: string;
  intensity: string;
  color: string;
  description: string;
}

export interface TelemetryMetrics {
  bmi: number;
  category: BMICategoryInfo;
  idealWeightMin: number;
  idealWeightMax: number;
  weightDeltaToNormal: number; // positive = needs to lose, negative = needs to gain, 0 = in range
  bmr: number;
  tdee: number;
  activityLevel: ActivityLevel;
  activityMultiplier: number;
  activityCalories: number;
  hydrationActivityBonus: number;
  bodyFatPercentage: number;
  waterIntakeLiters: number;
  maxHeartRate: number;
  heartRateZones: HeartRateZone[];
}

export interface TelemetrySnapshot {
  id: string;
  timestamp: number;
  dateFormatted: string;
  unitSystem: UnitSystem;
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  bmi: number;
  categoryType: BMICategoryType;
  categoryLabel: string;
  categoryColor: string;
  tdee: number;
  bodyFat: number;
}
