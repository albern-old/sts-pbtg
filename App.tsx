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
import { DialogHost } from './src/components/organisms/DialogHost';
import { RootErrorBoundary } from './src/components/organisms/RootErrorBoundary';
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

const HASH_TABS: TabKey[] = ['home', 'calculator', 'tracker', 'history'];

// URL hash — hanya ada di web. React Native TIDAK punya window.location,
// jadi wajib di-guard (dulu: TypeError → crash saat app dibuka di Android).
function webHash(): string {
  if (typeof window === 'undefined') return '';
  const loc = window.location;
  if (!loc || typeof loc.hash !== 'string') return '';
  return loc.hash.replace('#', '');
}

// Membuka tab tertentu lewat URL hash (mis. /#tracker) — untuk verifikasi web.
function tabFromHash(): TabKey {
  const h = webHash();
  return (HASH_TABS as string[]).includes(h) ? (h as TabKey) : 'home';
}

function App() {
  const [tab, setTab] = useState<TabKey>(tabFromHash);
  const [splashDone, setSplashDone] = useState<boolean>(() =>
    (HASH_TABS as string[]).includes(webHash()),
  );

  const [fontsLoaded, fontError] = useFonts({
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

  if (!fontsLoaded && !fontError) {
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
      <DialogHost />
    </SafeAreaProvider>
  );
}

export default function Root() {
  return (
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}
