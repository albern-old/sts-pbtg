import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Bike, Footprints, PersonStanding } from 'lucide-react-native';
import { BrandHeader } from '../components/molecules/BrandHeader';
import { TrackerPanel } from '../components/molecules/TrackerPanel';
import { OsmMapPanel } from '../components/organisms/OsmMapPanel';
import { saveTrackerSession, TrackerStatus, useActivityTracker } from '../hooks/useActivityTracker';
import { showConfirm, showAlert } from '../services/dialog';
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

const ACTIVITY_TABS: {
  id: ActivityType;
  label: string;
  renderIcon: (color: string) => React.ReactNode;
}[] = [
  { id: 'lari', label: 'Lari', renderIcon: (c) => <Footprints size={15} color={c} /> },
  { id: 'jalan', label: 'Jalan Santai', renderIcon: (c) => <PersonStanding size={15} color={c} /> },
  { id: 'sepeda', label: 'Bersepeda', renderIcon: (c) => <Bike size={15} color={c} /> },
];

// Layar "Pelacak Aktivitas GPS" sesuai desain:
// header + pill GPS → tab aktivitas → peta full-bleed → kartu statistik di bawah.
export const TrackerScreen: React.FC<Props> = ({
  tracker,
  onSessionSaved,
  onRequestHistory,
}) => {
  const status: TrackerStatus = tracker.status;
  const tracking = status === 'tracking';
  const canReset =
    !(status === 'idle' && tracker.distanceMeters === 0 && tracker.durationSeconds === 0);
  const canStop = tracking || status === 'paused';

  const handleStop = async () => {
    tracker.pause();
    const significant = tracker.distanceMeters > 10 || tracker.durationSeconds > 10;
    if (!significant) {
      tracker.resetLocal();
      await showAlert(
        'Sesi Terlalu Pendek',
        'Berjalan minimal 10 m atau 10 detik untuk menyimpan sesi. Sesi dibuang.',
      );
      return;
    }
    const save = await showConfirm({
      title: 'Simpan Sesi Aktivitas?',
      message: `${formatDistance(tracker.distanceMeters)} dalam ${formatDurationShort(tracker.durationSeconds)} • ${tracker.caloriesBurned} kkal.\n\nSimpan ke Riwayat sebelum berhenti?`,
      confirmLabel: 'Simpan & Reset',
      cancelLabel: 'Batal',
    });
    if (!save) return;
    const record = await tracker.persistSession();
    onSessionSaved(await saveTrackerSession(record));
    tracker.resetLocal();
    const openHistory = await showConfirm({
      title: 'Aktivitas Tersimpan',
      message: 'Sesi berhasil disimpan ke Riwayat.',
      confirmLabel: 'Lihat Riwayat',
      cancelLabel: 'Tutup',
    });
    if (openHistory) onRequestHistory();
  };

  const handleReset = async () => {
    const confirmed = await showConfirm({
      title: 'Reset Sesi?',
      message: 'Data sesi saat ini akan dihapus tanpa disimpan.',
      confirmLabel: 'Reset',
      cancelLabel: 'Batal',
      destructive: true,
    });
    if (confirmed) tracker.resetLocal();
  };

  const statusText = tracking
    ? `GPS AKTIF • ${tracker.speedKmh} km/jam`
    : tracker.isSimulation
      ? 'SIMULASI'
      : 'GPS SIAGA';
  const statusColor = tracking
    ? colors.primary
    : tracker.isSimulation
      ? colors.warning
      : colors.outline;
  const dotColor = tracking
    ? colors.primaryEmphasis
    : tracker.isSimulation
      ? colors.warning
      : colors.outline;

  return (
    <View style={styles.root}>
      <View style={styles.headerWrap}>
        <BrandHeader
          right={
            <>
              <View style={[styles.statusPill, { backgroundColor: colors.surfaceLow }]}>
                <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
              </View>
              <Switch
                value={tracker.isSimulation}
                onValueChange={tracker.setIsSimulation}
                disabled={tracking}
                trackColor={{ false: colors.outlineVariant, true: 'rgba(0,105,72,0.35)' }}
                thumbColor={tracker.isSimulation ? colors.primary : '#f4f3f4'}
              />
            </>
          }
        />
      </View>

      {/* Tab jenis aktivitas — container biru muda, aktif = pil putih */}
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
              {tab.renderIcon(active ? colors.primary : colors.onSurfaceVariant)}
              <Text
                numberOfLines={1}
                style={[styles.tabLabel, active && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Peta full-bleed sesuai desain */}
      <View style={styles.mapWrap}>
        <OsmMapPanel
          currentLocation={tracker.currentLocation}
          route={tracker.route}
          isTracking={tracking}
          accuracy={tracker.accuracy}
          speedKmh={tracker.speedKmh}
          distanceMeters={tracker.distanceMeters}
        />
      </View>

      {/* Kartu statistik di bawah peta */}
      <View style={styles.statsWrap}>
        <TrackerPanel
          status={tracker.status}
          distanceMeters={tracker.distanceMeters}
          durationSeconds={tracker.durationSeconds}
          caloriesBurned={tracker.caloriesBurned}
          elevationGainMeters={tracker.elevationGainMeters}
          canReset={canReset && !tracking}
          canStop={canStop}
          onStart={tracker.start}
          onPause={tracker.pause}
          onStop={handleStop}
          onReset={handleReset}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingHorizontal: 20, paddingTop: 4 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 10.5, fontFamily: fonts.bold, letterSpacing: 0.3 },
  tabsWrap: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: colors.surfaceLow,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.surfaceLowest,
    boxShadow: '0px 2px 8px rgba(11,28,48,0.12)',
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
  tabLabelActive: { fontFamily: fonts.bold, color: colors.onSurface },
  mapWrap: {
    flex: 1,
    minHeight: 180,
    overflow: 'hidden',
  },
  statsWrap: {
    marginTop: -18,
    marginHorizontal: 10,
    marginBottom: 8,
    zIndex: 2,
  },
});
