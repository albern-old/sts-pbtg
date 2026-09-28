import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Flame,
  Heart,
  Route,
  Scale,
  TrendingUp,
  Trash2,
} from 'lucide-react-native';
import { AppText } from '../components/atoms/AppText';
import { Badge } from '../components/atoms/Badge';
import { BrandHeader } from '../components/molecules/BrandHeader';
import { WorkoutAnalysisModal } from '../components/WorkoutAnalysisModal';
import { ActivityHistoryRecord, BmiHistoryRecord } from '../types';
import { formatDistance, formatDurationShort, formatPace } from '../utils/format';
import {
  averageBmi,
  filterActivitiesByPeriod,
  filterBmiByPeriod,
  PeriodFilter,
  periodStart,
  summarize,
  weekdayDistanceKm,
} from '../utils/periods';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface Props {
  bmiHistory: BmiHistoryRecord[];
  activityHistory: ActivityHistoryRecord[];
  onDeleteBmi: (id: string) => void;
  onClearBmi: () => void;
  onDeleteActivity: (id: string) => void;
  onClearActivity: () => void;
  onRestoreBmi: (record: BmiHistoryRecord) => void;
  onRestoredNavigateCalculator: () => void;
}

const WEEK_TARGET_KM = 25;
const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const PERIODS: { key: PeriodFilter; label: string }[] = [
  { key: 'week', label: 'Minggu Ini' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'year', label: 'Tahun Ini' },
];

const TITLES: Record<string, string> = {
  lari: 'Lari Santai',
  jalan: 'Jalan Santai',
  sepeda: 'Sepeda Pagi',
};

function peakDayLabel(peakIndex: number, peakKm: number): string {
  if (peakKm <= 0) return 'Belum ada aktivitas pada periode ini';
  return `Puncak: ${['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][peakIndex]} (${peakKm} km)`;
}

export const HistoryScreen: React.FC<Props> = ({
  bmiHistory,
  activityHistory,
  onDeleteBmi,
  onClearBmi,
  onDeleteActivity,
  onClearActivity,
  onRestoreBmi,
  onRestoredNavigateCalculator,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('week');
  const [showAll, setShowAll] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<ActivityHistoryRecord | null>(null);

  const periodActivities = useMemo(
    () => filterActivitiesByPeriod(activityHistory, period),
    [activityHistory, period],
  );
  const periodBmi = useMemo(() => filterBmiByPeriod(bmiHistory, period), [bmiHistory, period]);
  const stats = useMemo(() => summarize(periodActivities), [periodActivities]);
  const chart = useMemo(() => weekdayDistanceKm(activityHistory, period), [activityHistory, period]);
  const avgBmi = useMemo(() => averageBmi(periodBmi), [periodBmi]);
  const latestBmi = bmiHistory[0] ?? null;

  const weekKm = useMemo(() => {
    const from = periodStart('week').getTime();
    let m = 0;
    for (const r of activityHistory) if (r.timestamp >= from) m += r.distanceMeters;
    return Math.round((m / 1000) * 10) / 10;
  }, [activityHistory]);
  const targetRemaining = Math.max(0, Math.round((WEEK_TARGET_KM - weekKm) * 10) / 10);
  const targetPercent = Math.min(100, Math.round((weekKm / WEEK_TARGET_KM) * 100));

  const visibleSessions = showAll ? periodActivities : periodActivities.slice(0, 3);
  const maxBar = Math.max(1, ...chart.days);

  const confirmClear = (kind: 'bmi' | 'activity') => {
    Alert.alert(
      kind === 'bmi' ? 'Hapus Riwayat BMI?' : 'Hapus Riwayat GPS?',
      'Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: () => (kind === 'bmi' ? onClearBmi() : onClearActivity()),
        },
      ],
    );
  };

  const confirmDeleteActivity = (item: ActivityHistoryRecord) => {
    Alert.alert('Hapus Sesi?', `${formatDistance(item.distanceMeters)} pada ${item.dateFormatted}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => onDeleteActivity(item.id) },
    ]);
  };

  const restoreLatest = () => {
    if (!latestBmi) return;
    onRestoreBmi(latestBmi);
    onRestoredNavigateCalculator();
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BrandHeader
          right={
            <View style={styles.iconCircle}>
              <TrendingUp size={17} color={colors.primary} />
            </View>
          }
        />

        <View style={styles.greeting}>
          <AppText variant="headlineLg">Riwayat & Tren</AppText>
          <AppText variant="bodyMd" muted>
            Pantau momentum dan konsistensi kardiovaskularmu.
          </AppText>
        </View>

        {/* Filter periode */}
        <View style={styles.periodRow}>
          <CalendarDays size={15} color={colors.primary} />
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodChip, period === p.key && styles.periodChipActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ringkasan performa */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ringkasan Performa</Text>
          <View style={styles.summaryHero}>
            <Text style={styles.summaryHeroValue}>
              {(stats.distanceMeters / 1000).toFixed(1)}
            </Text>
            <Text style={styles.summaryHeroUnit}>km</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCell}>
              <Route size={15} color={colors.primary} />
              <Text style={styles.summaryValue}>{stats.sessionCount}</Text>
              <Text style={styles.summaryLabel}>Sesi</Text>
            </View>
            <View style={styles.summaryCell}>
              <Flame size={15} color={colors.primary} />
              <Text style={styles.summaryValue}>{stats.calories.toLocaleString('id-ID')}</Text>
              <Text style={styles.summaryLabel}>Kalori</Text>
            </View>
            <View style={styles.summaryCell}>
              <Scale size={15} color={colors.primary} />
              <Text style={styles.summaryValue}>{avgBmi ?? '-'}</Text>
              <Text style={styles.summaryLabel}>Rata BMI</Text>
            </View>
          </View>
        </View>

        {/* Grafik batang 7 hari */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aktivitas Harian (Km)</Text>
          <Text style={styles.chartSub}>{peakDayLabel(chart.peakIndex, chart.peakKm)}</Text>
          <View style={styles.chart}>
            {chart.days.map((km, i) => {
              const h = Math.max(4, Math.round((km / maxBar) * 74));
              const isPeak = i === chart.peakIndex && chart.peakKm > 0;
              return (
                <View key={DAY_LABELS[i]} style={styles.barCol}>
                  <Text style={[styles.barValue, isPeak && styles.barValuePeak]}>
                    {km > 0 ? km : ''}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      { height: h },
                      isPeak ? styles.barPeak : km > 0 ? styles.barMid : styles.barEmpty,
                    ]}
                  />
                  <Text style={[styles.barLabel, isPeak && styles.barLabelPeak]}>
                    {DAY_LABELS[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Kartu BMI terakhir */}
        <TouchableOpacity style={styles.bmiCard} activeOpacity={0.85} onPress={restoreLatest}>
          <View style={styles.bmiIcon}>
            <Heart size={17} color={colors.primary} fill={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            {latestBmi ? (
              <>
                <View style={styles.bmiRow}>
                  <Text style={styles.bmiValue}>BMI {latestBmi.bmi}</Text>
                  <Badge label={latestBmi.categoryLabel} tone="primary" />
                </View>
                <Text style={styles.bmiSub}>
                  {latestBmi.dateFormatted} • {latestBmi.weightKg} kg •{' '}
                  {latestBmi.categoryType === 'normal' ? 'Target tercapai' : 'Pantau terus'}
                </Text>
              </>
            ) : (
              <Text style={styles.bmiSub}>Belum ada data BMI. Hitung di Kalkulator BMI.</Text>
            )}
          </View>
          <ChevronRight size={18} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        {/* Sesi terakhir */}
        <View style={styles.sectionRow}>
          <AppText variant="headlineSm">Sesi Terakhir</AppText>
          {periodActivities.length > 3 ? (
            <TouchableOpacity onPress={() => setShowAll((v) => !v)} activeOpacity={0.8}>
              <Text style={styles.linkText}>
                Semua ({periodActivities.length})
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {visibleSessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <AppText variant="bodySm" muted>
              Belum ada sesi GPS pada periode ini.
            </AppText>
          </View>
        ) : (
          visibleSessions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.sessionCard}
              activeOpacity={0.85}
              onPress={() => setSelectedWorkout(item)}
              onLongPress={() => confirmDeleteActivity(item)}
            >
              <View style={styles.sessionHead}>
                <View style={{ flex: 1 }}>
                  <AppText variant="headlineSm">
                    {TITLES[item.activityType ?? 'lari']}
                  </AppText>
                  <AppText variant="bodySm" muted>
                    {item.dateFormatted}, {item.timeFormatted}
                  </AppText>
                </View>
                <TrendingUp size={16} color={colors.primary} />
              </View>

              {item.routeCoordinates && item.routeCoordinates.length > 1 ? (
                <View style={styles.chipRow}>
                  <View style={styles.chip}>
                    <Route size={12} color={colors.primary} />
                    <Text style={styles.chipText}>Rute GPS tercatat</Text>
                  </View>
                  {item.elevationGainMeters && item.elevationGainMeters > 0 ? (
                    <View style={styles.chip}>
                      <TrendingUp size={12} color={colors.primary} />
                      <Text style={styles.chipText}>Elevasi +{item.elevationGainMeters}m</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.statGrid}>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>Jarak</Text>
                  <Text style={styles.statValue}>
                    {(item.distanceMeters / 1000).toFixed(2)}
                    <Text style={styles.statUnit}> km</Text>
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>Durasi</Text>
                  <Text style={styles.statValue}>{formatDurationShort(item.durationSeconds)}</Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>Pace</Text>
                  <Text style={styles.statValue}>
                    {formatPace(item.distanceMeters, item.durationSeconds)}
                    <Text style={styles.statUnit}> /km</Text>
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>Energi</Text>
                  <Text style={styles.statValue}>
                    {item.caloriesBurned}
                    <Text style={styles.statUnit}> kkal</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Target mingguan */}
        <View style={styles.targetCard}>
          <View style={styles.targetHead}>
            <View style={styles.targetIcon}>
              <Clock3 size={15} color={colors.primary} />
            </View>
            <Text style={styles.targetTitle}>Target Mingguan {WEEK_TARGET_KM} km</Text>
            <Text style={styles.targetPercent}>{targetPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${targetPercent}%` }]} />
          </View>
          <Text style={styles.targetSub}>
            {targetRemaining > 0
              ? `Kurang ${targetRemaining} km lagi untuk mencapai sasaran`
              : 'Sasaran mingguan tercapai. Luar biasa!'}
          </Text>
        </View>

        {/* Riwayat BMI (fitur lama dipertahankan) */}
        <View style={styles.sectionRow}>
          <AppText variant="headlineSm">Riwayat BMI ({bmiHistory.length})</AppText>
          {bmiHistory.length > 0 ? (
            <TouchableOpacity onPress={() => confirmClear('bmi')} activeOpacity={0.8}>
              <Text style={styles.linkDanger}>Hapus semua</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {bmiHistory.map((item) => (
          <View key={item.id} style={styles.bmiRowCard}>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyMd" style={styles.bmiRowTitle}>
                {item.bmi} • {item.categoryLabel}
              </AppText>
              <AppText variant="bodySm" muted>
                {item.dateFormatted} • {item.timeFormatted} • {item.weightKg} kg / {item.heightCm} cm
              </AppText>
            </View>
            <TouchableOpacity
              style={styles.rowAction}
              onPress={() => {
                onRestoreBmi(item);
                onRestoredNavigateCalculator();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.rowActionText}>Muat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rowDelete}
              onPress={() =>
                Alert.alert('Hapus Catatan?', `Hapus riwayat ${item.dateFormatted}?`, [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Hapus', style: 'destructive', onPress: () => onDeleteBmi(item.id) },
                ])
              }
              activeOpacity={0.8}
            >
              <Trash2 size={14} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}

        {activityHistory.length > 0 ? (
          <TouchableOpacity
            style={styles.clearGps}
            onPress={() => confirmClear('activity')}
            activeOpacity={0.8}
          >
            <Trash2 size={14} color={colors.danger} />
            <Text style={styles.clearGpsText}>Hapus semua sesi GPS</Text>
          </TouchableOpacity>
        ) : null}

        <AppText variant="labelSm" muted style={styles.note}>
          Ketuk sesi untuk analisis detail • tekan lama untuk menghapus.
        </AppText>
      </ScrollView>

      <WorkoutAnalysisModal
        isOpen={selectedWorkout !== null}
        onClose={() => setSelectedWorkout(null)}
        activity={selectedWorkout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 12, paddingBottom: 28 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { gap: 3, marginTop: 2 },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  periodChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  periodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodText: { fontSize: 12, fontFamily: fonts.bold, color: colors.onSurfaceVariant },
  periodTextActive: { color: colors.onPrimary },
  card: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.onSurface },
  summaryHero: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  summaryHeroValue: {
    fontSize: 40,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: -1,
  },
  summaryHeroUnit: { fontSize: 15, fontFamily: fonts.bold, color: colors.primaryEmphasis },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCell: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
  },
  summaryValue: { fontSize: 15, fontFamily: fonts.extraBold, color: colors.onSurface },
  summaryLabel: { fontSize: 10, fontFamily: fonts.bold, color: colors.onSurfaceVariant },
  chartSub: { fontSize: 11, fontFamily: fonts.medium, color: colors.primary, marginTop: -6 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    height: 104,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  bar: { width: '70%', borderRadius: 6 },
  barEmpty: { backgroundColor: colors.surfaceHighest },
  barMid: { backgroundColor: 'rgba(5,150,105,0.45)' },
  barPeak: { backgroundColor: colors.primary },
  barValue: { fontSize: 9, fontFamily: fonts.bold, color: colors.onSurfaceVariant, height: 12 },
  barValuePeak: { color: colors.primary },
  barLabel: { fontSize: 10, fontFamily: fonts.medium, color: colors.onSurfaceVariant },
  barLabelPeak: { fontFamily: fonts.bold, color: colors.onSurface },
  bmiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceLowest,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bmiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,105,72,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bmiRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bmiValue: { fontSize: 16, fontFamily: fonts.extraBold, color: colors.onSurface },
  bmiSub: { fontSize: 11, fontFamily: fonts.regular, color: colors.onSurfaceVariant, marginTop: 2 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  linkText: { fontSize: 12, fontFamily: fonts.bold, color: colors.primary },
  linkDanger: { fontSize: 12, fontFamily: fonts.bold, color: colors.danger },
  emptyCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
  sessionCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,105,72,0.07)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chipText: { fontSize: 10, fontFamily: fonts.bold, color: colors.primary },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  statCell: { width: '50%' },
  statLabel: { fontSize: 10, fontFamily: fonts.bold, color: colors.onSurfaceVariant, letterSpacing: 0.4 },
  statValue: { fontSize: 16, fontFamily: fonts.extraBold, color: colors.onSurface },
  statUnit: { fontSize: 11, fontFamily: fonts.medium, color: colors.onSurfaceVariant },
  targetCard: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  targetHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  targetIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetTitle: { flex: 1, fontSize: 13, fontFamily: fonts.bold, color: colors.onSurface },
  targetPercent: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.primary },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceHighest,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  targetSub: { fontSize: 12, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  bmiRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceLowest,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  bmiRowTitle: { fontFamily: fonts.bold },
  rowAction: {
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  rowActionText: { fontSize: 11, fontFamily: fonts.bold, color: colors.primary },
  rowDelete: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearGps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
    backgroundColor: 'rgba(186,26,26,0.05)',
  },
  clearGpsText: { fontSize: 12, fontFamily: fonts.bold, color: colors.danger },
  note: { textAlign: 'center' },
});
