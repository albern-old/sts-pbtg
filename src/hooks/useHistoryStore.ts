import { useCallback, useEffect, useState } from 'react';
import {
  ActivityHistoryRecord,
  BmiHistoryRecord,
} from '../types';
import {
  clearAllActivityHistory,
  clearAllBmiHistory,
  deleteActivityHistoryItem,
  deleteBmiHistoryItem,
  getActivityHistory,
  getBmiHistory,
} from '../utils/historyStorage';

export function useHistoryStore() {
  const [bmiHistory, setBmiHistory] = useState<BmiHistoryRecord[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityHistoryRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [b, a] = await Promise.all([getBmiHistory(), getActivityHistory()]);
      setBmiHistory(b);
      setActivityHistory(a);
      setLoaded(true);
    })();
  }, []);

  const removeBmi = useCallback(async (id: string) => {
    setBmiHistory(await deleteBmiHistoryItem(id));
  }, []);

  const clearBmi = useCallback(async () => {
    await clearAllBmiHistory();
    setBmiHistory([]);
  }, []);

  const removeActivity = useCallback(async (id: string) => {
    setActivityHistory(await deleteActivityHistoryItem(id));
  }, []);

  const clearActivity = useCallback(async () => {
    await clearAllActivityHistory();
    setActivityHistory([]);
  }, []);

  return {
    loaded,
    bmiHistory,
    setBmiHistory,
    activityHistory,
    setActivityHistory,
    removeBmi,
    clearBmi,
    removeActivity,
    clearActivity,
  };
}
