import React, { useMemo, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { SplashScreen } from './src/components/organisms/SplashScreen';
import { RootTabs, TabKey } from './src/navigation/RootTabs';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { TrackerScreen } from './src/screens/TrackerScreen';
import { useActivityTracker } from './src/hooks/useActivityTracker';
import { useBmiCalculator } from './src/hooks/useBmiCalculator';
import { useHistoryStore } from './src/hooks/useHistoryStore';
import { periodStart } from './src/utils/periods';
import { colors } from './src/theme/colors';

export default function App() {
  const [tab, setTab] = useState<TabKey>('home');
  const [splashDone, setSplashDone] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const history = useHistoryStore();
  const calculator = useBmiCalculator(history.setBmiHistory);
  const tracker = useActivityTracker(calculator.weightKg);

  const weekAggregates = useMemo(() => {
    const from = periodStart('week').getTime();
    let distanceMeters = 0;
    let calories = 0;
    let durationSeconds = 0;
    for (const r of history.activityHistory) {
      if (r.timestamp < from) continue;
      distanceMeters += r.distanceMeters;
      calories += r.caloriesBurned;
      durationSeconds += r.durationSeconds;
    }
    return { distanceMeters, calories, durationSeconds };
  }, [history.activityHistory]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {!splashDone ? <SplashScreen onDone={() => setSplashDone(true)} /> : null}
      <RootTabs active={tab} onChange={setTab}>
        {tab === 'home' ? (
          <HomeScreen
            metrics={calculator.metrics}
            bmiHistory={history.bmiHistory}
            weekDistanceMeters={weekAggregates.distanceMeters}
            weekCalories={weekAggregates.calories}
            weekDurationSeconds={weekAggregates.durationSeconds}
            lastActivity={history.activityHistory[0] ?? null}
            onNavigate={setTab}
            onViewHistory={() => setTab('history')}
          />
        ) : null}
        {tab === 'calculator' ? <CalculatorScreen calculator={calculator} /> : null}
        {tab === 'tracker' ? (
          <TrackerScreen
            tracker={tracker}
            onSessionSaved={history.setActivityHistory}
            onRequestHistory={() => setTab('history')}
          />
        ) : null}
        {tab === 'history' ? (
          <HistoryScreen
            bmiHistory={history.bmiHistory}
            activityHistory={history.activityHistory}
            onDeleteBmi={history.removeBmi}
            onClearBmi={history.clearBmi}
            onDeleteActivity={history.removeActivity}
            onClearActivity={history.clearActivity}
            onRestoreBmi={calculator.restore}
            onRestoredNavigateCalculator={() => setTab('calculator')}
          />
        ) : null}
      </RootTabs>
    </SafeAreaProvider>
  );
}
