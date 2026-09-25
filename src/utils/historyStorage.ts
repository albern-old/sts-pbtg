import AsyncStorage from '@react-native-async-storage/async-storage';
import { BmiHistoryRecord, ActivityHistoryRecord } from '../types';

const BMI_HISTORY_KEY = '@kinetic_pulse_bmi_history_v1';
const ACTIVITY_HISTORY_KEY = '@kinetic_pulse_activity_history_v1';

// In-memory fallback in case storage has any transient platform issues
let inMemoryBmiHistory: BmiHistoryRecord[] = [];
let inMemoryActivityHistory: ActivityHistoryRecord[] = [];

export async function getBmiHistory(): Promise<BmiHistoryRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(BMI_HISTORY_KEY);
    if (raw) {
      const parsed: BmiHistoryRecord[] = JSON.parse(raw);
      inMemoryBmiHistory = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load BMI history from AsyncStorage:', err);
  }
  return inMemoryBmiHistory;
}

export async function saveBmiHistory(record: BmiHistoryRecord): Promise<BmiHistoryRecord[]> {
  try {
    const current = await getBmiHistory();
    // Taruh record terbaru di paling atas, batasi maksimal 50 data riwayat
    const updated = [record, ...current.filter((item) => item.id !== record.id)].slice(0, 50);
    await AsyncStorage.setItem(BMI_HISTORY_KEY, JSON.stringify(updated));
    inMemoryBmiHistory = updated;
    return updated;
  } catch (err) {
    console.warn('Failed to save BMI history to AsyncStorage:', err);
    inMemoryBmiHistory = [record, ...inMemoryBmiHistory].slice(0, 50);
    return inMemoryBmiHistory;
  }
}

export async function deleteBmiHistoryItem(id: string): Promise<BmiHistoryRecord[]> {
  try {
    const current = await getBmiHistory();
    const updated = current.filter((item) => item.id !== id);
    await AsyncStorage.setItem(BMI_HISTORY_KEY, JSON.stringify(updated));
    inMemoryBmiHistory = updated;
    return updated;
  } catch (err) {
    console.warn('Failed to delete BMI history item from AsyncStorage:', err);
    inMemoryBmiHistory = inMemoryBmiHistory.filter((item) => item.id !== id);
    return inMemoryBmiHistory;
  }
}

export async function clearAllBmiHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BMI_HISTORY_KEY);
    inMemoryBmiHistory = [];
  } catch (err) {
    console.warn('Failed to clear BMI history from AsyncStorage:', err);
    inMemoryBmiHistory = [];
  }
}

export async function getActivityHistory(): Promise<ActivityHistoryRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVITY_HISTORY_KEY);
    if (raw) {
      const parsed: ActivityHistoryRecord[] = JSON.parse(raw);
      inMemoryActivityHistory = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load activity history from AsyncStorage:', err);
  }
  return inMemoryActivityHistory;
}

export async function saveActivityHistory(record: ActivityHistoryRecord): Promise<ActivityHistoryRecord[]> {
  try {
    const current = await getActivityHistory();
    const updated = [record, ...current.filter((item) => item.id !== record.id)].slice(0, 50);
    await AsyncStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(updated));
    inMemoryActivityHistory = updated;
    return updated;
  } catch (err) {
    console.warn('Failed to save activity history to AsyncStorage:', err);
    inMemoryActivityHistory = [record, ...inMemoryActivityHistory].slice(0, 50);
    return inMemoryActivityHistory;
  }
}

export async function deleteActivityHistoryItem(id: string): Promise<ActivityHistoryRecord[]> {
  try {
    const current = await getActivityHistory();
    const updated = current.filter((item) => item.id !== id);
    await AsyncStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(updated));
    inMemoryActivityHistory = updated;
    return updated;
  } catch (err) {
    console.warn('Failed to delete activity history item:', err);
    inMemoryActivityHistory = inMemoryActivityHistory.filter((item) => item.id !== id);
    return inMemoryActivityHistory;
  }
}

export async function clearAllActivityHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVITY_HISTORY_KEY);
    inMemoryActivityHistory = [];
  } catch (err) {
    console.warn('Failed to clear activity history:', err);
    inMemoryActivityHistory = [];
  }
}
