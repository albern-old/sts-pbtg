import { useMemo, useState } from 'react';
import { calculateTelemetry } from '../utils/telemetry';
import {
  ActivityLevel,
  BmiHistoryRecord,
  Gender,
} from '../types';
import { formatDateId } from '../utils/format';
import { saveBmiHistory } from '../utils/historyStorage';
import { showAlert } from '../services/dialog';

export type UiGender = 'pria' | 'wanita';

const DEFAULTS = {
  gender: 'pria' as UiGender,
  age: 26,
  weightKg: 72.5,
  heightCm: 175,
  activity: 'moderate' as ActivityLevel,
};

export function useBmiCalculator(onSaved: (records: BmiHistoryRecord[]) => void) {
  const [gender, setGender] = useState<UiGender>(DEFAULTS.gender);
  const [age, setAge] = useState<number>(DEFAULTS.age);
  const [weightKg, setWeightKg] = useState<number>(DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState<number>(DEFAULTS.heightCm);
  const [activity, setActivity] = useState<ActivityLevel>(DEFAULTS.activity);

  const internalGender: Gender = gender === 'pria' ? 'male' : 'female';

  const metrics = useMemo(
    () =>
      calculateTelemetry(heightCm, weightKg, age, internalGender, activity),
    [heightCm, weightKg, age, internalGender, activity],
  );

  const reset = () => {
    setGender(DEFAULTS.gender);
    setAge(DEFAULTS.age);
    setWeightKg(DEFAULTS.weightKg);
    setHeightCm(DEFAULTS.heightCm);
    setActivity(DEFAULTS.activity);
  };

  const restore = (record: BmiHistoryRecord) => {
    setGender(record.gender === 'male' ? 'pria' : 'wanita');
    setAge(record.age);
    setHeightCm(record.heightCm);
    setWeightKg(record.weightKg);
    setActivity(record.activityLevel);
  };

  const save = async () => {
    const now = new Date();
    const { dateFormatted, timeFormatted } = formatDateId(now);
    const record: BmiHistoryRecord = {
      id: `bmi-${Date.now()}`,
      timestamp: Date.now(),
      dateFormatted,
      timeFormatted,
      gender: internalGender,
      age,
      heightCm,
      weightKg,
      bmi: metrics.bmi,
      categoryType: metrics.category.type,
      categoryLabel: metrics.category.label,
      categoryColor: metrics.category.color,
      idealWeightRange: `${metrics.idealWeightMin} – ${metrics.idealWeightMax} kg`,
      bmr: metrics.bmr,
      tdee: metrics.tdee,
      bodyFatPercentage: metrics.bodyFatPercentage,
      bodyFatLabel: metrics.bodyFatCategory.label,
      activityLevel: activity,
    };
    const updated = await saveBmiHistory(record);
    onSaved(updated);
    await showAlert(
      'BMI Tersimpan',
      `${metrics.bmi} • ${metrics.category.label} berhasil disimpan ke Riwayat.`,
    );
  };

  return {
    gender,
    setGender,
    age,
    setAge,
    weightKg,
    setWeightKg,
    heightCm,
    setHeightCm,
    activity,
    setActivity,
    metrics,
    reset,
    restore,
    save,
  };
}
