import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Droplets,
  Dumbbell,
  Flag,
  Flame,
  Footprints,
  HeartPulse,
  Play,
  Route,
  Timer,
  Trophy,
} from 'lucide-react-native';
import { AppText } from '../components/atoms/AppText';
import { BrandHeader } from '../components/molecules/BrandHeader';
import { SectionHeader } from '../components/molecules/SectionHeader';
import { TelemetryMetrics, ActivityHistoryRecord, BmiHistoryRecord } from '../types';
import { formatDistance, formatDurationLong, formatDurationShort, formatPace } from '../utils/format';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { TabKey } from '../navigation/RootTabs';

const WEEK_TARGET_KM = 20;

interface Props {
  metrics: TelemetryMetrics;
  bmiHistory: BmiHistoryRecord[];
  weekDistanceMeters: number;
  weekCalories: number;
  weekDurationSeconds: number;
  lastActivity: ActivityHistoryRecord | null;
  onNavigate: (tab: TabKey) => void;
  onViewHistory: () => void;
}

const ACTIVITY_TITLES: Record<string, string> = {
  lari: 'Lari Santai',
  jalan: 'Jalan Santai',
  sepeda: 'Bersepeda Pagi',
};

export const HomeScreen: React.FC<Props> = ({
  metrics,
  bmiHistory,
  weekDistanceMeters,
  weekCalories,
  weekDurationSeconds,
  lastActivity,
  onNavigate,
  onViewHistory,
}) => {
  const weekKm = Math.round((weekDistanceMeters / 1000) * 10) / 10;
  const targetPercent = Math.min(100, Math.round((weekKm / WEEK_TARGET_KM) * 100));
  const remainingKm = Math.max(0, Math.round((WEEK_TARGET_KM - weekKm) * 10) / 10);
  const lastBmi = bmiHistory[0] ?? null;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <BrandHeader
        right={
          <>
            <View style={styles.dateChip}>
              <CalendarDays size={13} color={colors.primary} />
              <Text style={styles.dateChipText}>Hari ini</Text>
            </View>
            <View style={styles.iconCircle}>
              <Bell size={17} color={colors.onSurface} />
            </View>
          </>
        }
      />

      <View style={styles.greeting}>
        <AppText variant="headlineLg">Selamat Beraktivitas</AppText>
        <AppText variant="bodyMd" muted>
          Pantau kesehatanmu, capai target harianmu hari ini.
        </AppText>
      </View>

      {/* Target mingguan + progress */}
      <View style={styles.targetCard}>
        <View style={styles.targetHead}>
          <View style={styles.targetIcon}>
            <Trophy size={16} color={colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.targetLabel}>TARGET MINGGUAN</Text>
            <Text style={styles.targetValue}>{targetPercent}%</Text>
          </View>
          <Flag size={16} color={colors.primary} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${targetPercent}%` }]} />
        </View>
        <Text style={styles.targetSub}>
          {remainingKm > 0
            ? `Sisa ${remainingKm} km lagi untuk mencapai target mingguan Anda.`
            : 'Target mingguan tercapai. Pertahankan ritmemu!'}
        </Text>
      </View>

      {/* Mulai tracking */}
      <View style={styles.startCard}>
        <View style={{ flex: 1 }}>
          <AppText variant="headlineSm">Mulai Lari / Jalan</AppText>
          <AppText variant="bodySm" muted>
            Pantau rute, pace, dan durasi secara real-time.
          </AppText>
        </View>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => onNavigate('tracker')}
          activeOpacity={0.85}
        >
          <Play size={16} color={colors.onPrimary} fill={colors.onPrimary} />
          <Text style={styles.startBtnText}>Mulai Tracking</Text>
        </TouchableOpacity>
      </View>

      {/* Metrik vitalitas 2x2 */}
      <SectionHeader title="Metrik Vitalitas" />
      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHead}>
            <HeartPulse size={15} color={colors.primary} />
            <Text style={styles.metricLabel}>BMI Terakhir</Text>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{metrics.bmi}</Text>
            <Text style={styles.metricUnit}>kg/m²</Text>
          </View>
          <Text style={styles.metricSub}>{metrics.category.label}</Text>
          {lastBmi ? (
            <Text style={styles.metricFoot}>
              {lastBmi.weightKg} kg · {lastBmi.heightCm} cm
            </Text>
          ) : null}
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHead}>
            <Route size={15} color={colors.primary} />
            <Text style={styles.metricLabel}>Jarak Pekan Ini</Text>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{weekKm}</Text>
            <Text style={styles.metricUnit}>km</Text>
          </View>
          <Text style={styles.metricSub}>Target {WEEK_TARGET_KM} km</Text>
          <Text style={styles.metricFoot}>{targetPercent}% tercapai</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHead}>
            <Flame size={15} color={colors.primary} />
            <Text style={styles.metricLabel}>Kalori Aktif</Text>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{weekCalories}</Text>
            <Text style={styles.metricUnit}>kkal</Text>
          </View>
          <Text style={styles.metricSub}>Rekap sesi GPS pekan ini</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHead}>
            <Timer size={15} color={colors.primary} />
            <Text style={styles.metricLabel}>Durasi Aktif</Text>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{formatDurationLong(weekDurationSeconds)}</Text>
          </View>
          <Text style={styles.metricSub}>Total latihan pekan ini</Text>
        </View>
      </View>

      {/* Saran kebugaran */}
      <View style={styles.tipCard}>
        <View style={styles.tipHead}>
          <Dumbbell size={15} color={colors.primary} />
          <Text style={styles.tipTitle}>Saran Kebugaran</Text>
        </View>
        <Text style={styles.tipBody}>
          Pertahankan aktivitas harianmu dengan target 6.000 langkah dan hidrasi{' '}
          {metrics.waterIntakeLiters}L hari ini.
        </Text>
        <View style={styles.tipChips}>
          <View style={styles.tipChip}>
            <Droplets size={13} color={colors.primary} />
            <Text style={styles.tipChipText}>{metrics.waterIntakeLiters}L target air</Text>
          </View>
          <View style={styles.tipChip}>
            <Footprints size={13} color={colors.primary} />
            <Text style={styles.tipChipText}>6.000 langkah</Text>
          </View>
        </View>
      </View>

      {/* Aktivitas terakhir */}
      <View style={styles.sectionRow}>
        <AppText variant="headlineSm">Aktivitas Terakhir</AppText>
        <TouchableOpacity style={styles.linkRow} onPress={onViewHistory} activeOpacity={0.8}>
          <Text style={styles.linkText}>Lihat Riwayat</Text>
          <ChevronRight size={15} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {lastActivity ? (
        <TouchableOpacity
          style={styles.lastCard}
          onPress={onViewHistory}
          activeOpacity={0.85}
        >
          <View style={styles.lastIcon}>
            <Route size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="headlineSm">
              {ACTIVITY_TITLES[lastActivity.activityType ?? 'lari']}
            </AppText>
            <AppText variant="bodySm" muted>
              {lastActivity.dateFormatted}, {lastActivity.timeFormatted}
            </AppText>
          </View>
          <View style={styles.lastStats}>
            <Text style={styles.lastStatMain}>
              {formatDistance(lastActivity.distanceMeters)}
            </Text>
            <Text style={styles.lastStatSub}>
              {formatDurationShort(lastActivity.durationSeconds)} ·{' '}
              {formatPace(lastActivity.distanceMeters, lastActivity.durationSeconds)}/km
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyLast}>
          <AppText variant="bodySm" muted>
            Belum ada aktivitas. Tekan “Mulai Tracking” untuk mencatat sesi pertama Anda.
          </AppText>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 12, paddingBottom: 28 },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceLow,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  dateChipText: { fontSize: 11, fontFamily: fonts.bold, color: colors.onSurfaceVariant },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { gap: 3, marginTop: 4 },
  targetCard: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  targetHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  targetIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetLabel: { fontSize: 11, fontFamily: fonts.bold, color: colors.onSurfaceVariant, letterSpacing: 0.5 },
  targetValue: { fontSize: 22, fontFamily: fonts.extraBold, color: colors.onSurface },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceHighest,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  targetSub: { fontSize: 12, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  startCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 999,
  },
  startBtnText: { fontSize: 14, fontFamily: fonts.bold, color: colors.onPrimary },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: {
    width: '47.7%',
    flexGrow: 1,
    backgroundColor: colors.surfaceLowest,
    borderRadius: 12,
    padding: 14,
    gap: 6,
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.onSurfaceVariant, flexShrink: 1 },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  metricValue: { fontSize: 24, fontFamily: fonts.extraBold, color: colors.onSurface, letterSpacing: -0.5 },
  metricUnit: { fontSize: 12, fontFamily: fonts.bold, color: colors.primaryEmphasis },
  metricSub: { fontSize: 11, fontFamily: fonts.medium, color: colors.primary },
  metricFoot: { fontSize: 11, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  tipCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.onSurface },
  tipBody: { fontSize: 13, fontFamily: fonts.regular, color: colors.onSurfaceVariant, lineHeight: 19 },
  tipChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tipChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,105,72,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tipChipText: { fontSize: 11, fontFamily: fonts.bold, color: colors.primary },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkText: { fontSize: 12, fontFamily: fonts.bold, color: colors.primary },
  lastCard: {
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
  lastIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(0,105,72,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastStats: { alignItems: 'flex-end', gap: 2 },
  lastStatMain: { fontSize: 14, fontFamily: fonts.bold, color: colors.onSurface },
  lastStatSub: { fontSize: 11, fontFamily: fonts.medium, color: colors.onSurfaceVariant },
  emptyLast: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
});
