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
  genderFocusTitle?: string;
  obesityStandardNotice?: string;
}

export interface BodyFatCategoryInfo {
  status: 'low' | 'optimal' | 'overfat' | 'obese';
  label: string;
  badge: string;
  color: string;
  thresholdNotice: string;
  description: string;
}

export interface GenderPhysiologyInfo {
  gender: Gender;
  genderLabel: string;
  hrFormulaName: string;
  bodyFatThresholds: string;
  obesityStandardNotice: string;
  trainingFocusTitle: string;
  trainingFocusDesc: string;
  nutritionFocusTitle: string;
  nutritionFocusDesc: string;
}

export interface HeartRateZone {
  zone: number;
  name: string;
  rangePercentage: string;
  bpmRange: string;
  intensity: string;
  color: string;
  description: string;
  genderTip?: string;
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
  bodyFatCategory: BodyFatCategoryInfo;
  genderPhysiology: GenderPhysiologyInfo;
  waterIntakeLiters: number;
  maxHeartRate: number;
  heartRateZones: HeartRateZone[];
}

export interface BmiHistoryRecord {
  id: string;
  timestamp: number;
  dateFormatted: string;
  timeFormatted: string;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  bmi: number;
  categoryType: BMICategoryType;
  categoryLabel: string;
  categoryColor: string;
  idealWeightRange: string;
  bmr: number;
  tdee: number;
  bodyFatPercentage: number;
  bodyFatLabel: string;
  activityLevel: ActivityLevel;
}

export interface ActivityHistoryRecord {
  id: string;
  timestamp: number;
  dateFormatted: string;
  timeFormatted: string;
  distanceMeters: number;
  durationSeconds: number;
  caloriesBurned: number;
  speedKmh: number;
  routeCoordinates?: { latitude: number; longitude: number }[];
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
