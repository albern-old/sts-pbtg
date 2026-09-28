import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Bike, Footprints, PersonStanding } from 'lucide-react-native';
import { AppText } from '../components/atoms/AppText';
import { BrandHeader } from '../components/molecules/BrandHeader';
import { TrackerPanel } from '../components/molecules/TrackerPanel';
import { OsmMapPanel } from '../components/organisms/OsmMapPanel';
import { saveTrackerSession, TrackerStatus, useActivityTracker } from '../hooks/useActivityTracker';
import { ActivityHistoryRecord, ActivityType } from '../types';
import { formatDistance, formatDurationShort } from '../utils/format';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Tracker = ReturnType<typeof useActivityTracker>;

interface Props {
  tracker: Tracker;
  onSessionSaved: (records: ActivityHistoryRecord[]) => void;
  onRequestHistory: () => void;
}

const ACTIVITY_TABS: { id: ActivityType; label: string; icon: React.ReactNode }[] = [
  { id: 'lari', label: 'Lari', icon: <Footprints size={15} /> },
  { id: 'jalan', label: 'Jalan Santai', icon: <PersonStanding size={15} /> },
  { id: 'sepeda', label: 'Bersepeda', icon: <Bike size={15} /> },
];

export const TrackerScreen: React.FC<Props> = ({
  tracker,
  onSessionSaved,
  onRequestHistory,
}) => {
  const [mapInteracting, setMapInteracting] = useState(false);
  const tracking: TrackerStatus = tracker.status;
  const canReset =
    !(tracker.status === 'idle' && tracker.distanceMeters === 0 && tracker.durationSeconds === 0);

  const handleStop = () => {
    // Stop = jeda + konfirmasi simpan (sesuai perilaku lama yang sudah teruji)
    tracker.pause();
    const significant = tracker.distanceMeters > 10 || tracker.durationSeconds > 10;
    if (!significant) {
      tracker.resetLocal();
      return;
    }
    Alert.alert(
      'Simpan Sesi Aktivitas?',
      `${formatDistance(tracker.distanceMeters)} dalam ${formatDurationShort(tracker.durationSeconds)} • ${tracker.caloriesBurned} kkal.\n\nSimpan ke Riwayat sebelum berhenti?`,
      [
        { text: 'Buang', style: 'destructive', onPress: () => tracker.resetLocal() },
        {
          text: 'Simpan & Reset',
          onPress: async () => {
            const record = await tracker.persistSession();
            onSessionSaved(await saveTrackerSession(record));
            tracker.resetLocal();
            Alert.alert('Aktivitas Tersimpan', 'Sesi berhasil disimpan ke Riwayat.', [
              { text: 'Tutup', style: 'cancel' },
              { text: 'Lihat Riwayat', onPress: onRequestHistory },
            ]);
          },
        },
      ],
    );
  };

  const handleReset = () => {
    Alert.alert('Reset Sesi?', 'Data sesi saat ini akan dihapus tanpa disimpan.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => tracker.resetLocal() },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerWrap}>
        <BrandHeader
          right={
            <>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: tracker.isSimulation ? colors.warningSoft : 'rgba(0,105,72,0.10)' },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: tracking
                        ? colors.primaryEmphasis
                        : tracker.isSimulation
                          ? colors.warning
                          : colors.outline,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: tracker.isSimulation ? colors.warning : colors.primary },
                  ]}
                >
                  {tracking
                    ? `GPS AKTIF • ${tracker.speedKmh} km/jam`
                    : tracker.isSimulation
                      ? 'SIMULASI'
                      : 'GPS SIAGA'}
                </Text>
              </View>
              <Switch
                value={tracker.isSimulation}
                onValueChange={tracker.setIsSimulation}
                disabled={tracking === 'tracking'}
                trackColor={{ false: colors.outlineVariant, true: 'rgba(0,105,72,0.35)' }}
                thumbColor={tracker.isSimulation ? colors.primary : '#f4f3f4'}
              />
            </>
          }
        />
      </View>

      <View style={styles.tabsWrap}>
        {ACTIVITY_TABS.map((tab) => {
          const active = tracker.activityType === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => tracker.setActivityType(tab.id)}
              activeOpacity={0.85}
            >
              <View style={{ opacity: active ? 1 : 0.6 }}>{tab.icon}</View>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.mapArea}>
        <OsmMapPanel
          currentLocation={tracker.currentLocation}
          route={tracker.route}
          isTracking={tracking === 'tracking'}
          accuracy={tracker.accuracy}
          speedKmh={tracker.speedKmh}
          distanceMeters={tracker.distanceMeters}
          onInteractionChange={setMapInteracting}
        />
        <View style={styles.panelOverlay} pointerEvents="box-none">
          <TrackerPanel
            status={tracker.status}
            distanceMeters={tracker.distanceMeters}
            durationSeconds={tracker.durationSeconds}
            caloriesBurned={tracker.caloriesBurned}
            elevationGainMeters={tracker.elevationGainMeters}
            canReset={canReset && tracking !== 'tracking'}
            canStop={tracking === 'tracking' || tracking === 'paused'}
            onStart={tracker.start}
            onPause={tracker.pause}
            onStop={handleStop}
            onReset={handleReset}
          />
        </View>
      </View>

      {!mapInteracting ? null : (
        <AppText variant="labelSm" style={styles.hint}>
          Geser peta bebas • ketuk ikon untuk kembali ke posisi
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: 20, paddingTop: 6 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontFamily: fonts.bold, letterSpacing: 0.3 },
  tabsWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.onSurfaceVariant },
  tabLabelActive: { fontFamily: fonts.bold, color: colors.onPrimary },
  mapArea: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  panelOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
  },
  hint: { paddingHorizontal: 20, paddingBottom: 8, textAlign: 'center' },
});
