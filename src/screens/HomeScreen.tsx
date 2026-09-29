import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import {
  Bell,
  ChevronRight,
  Droplets,
  Flag,
  Flame,
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
  const [hadBreakfast, setHadBreakfast] = React.useState(true);
  const weekKm = Math.round((weekDistanceMeters / 1000) * 10) / 10;
  const targetPercent = Math.min(100, Math.round((weekKm / WEEK_TARGET_KM) * 100));
  const remainingKm = Math.max(0, Math.round((WEEK_TARGET_KM - weekKm) * 10) / 10);
  const lastBmi = bmiHistory[0] ?? null;
  const now = new Date();
  const dateLabel = now.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <BrandHeader
        right={
          <>
            <Text style={styles.headerDate}>{dateLabel}</Text>
            <View style={styles.iconCircle}>
              <Bell size={17} color={colors.onSurface} />
            </View>
          </>
        }
      />

      <View style={styles.greeting}>
        <AppText variant="headlineLg">Selamat Beraktivitas</AppText>
      </View>

      {/* Target mingguan + progress (label + % sebaris) */}
      <View style={styles.targetCard}>
        <View style={styles.targetHead}>
          <View style={styles.targetIcon}>
            <Trophy size={15} color={colors.onPrimary} />
          </View>
          <Text style={styles.targetLabel}>Target Mingguan</Text>
          <View style={{ flex: 1 }} />
          <Text style={styles.targetValue}>{targetPercent}%</Text>
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

      {/* Mulai tracking — kartu gelap sesuai desain */}
      <View style={styles.startCard}>
        <AppText variant="headlineSm" style={{ color: colors.surfaceLowest }}>
          Mulai Lari / Jalan
        </AppText>
        <AppText variant="bodySm" style={{ color: '#9DB0C7' }}>
          Pantau rute, pace, dan durasi secara real-time.
        </AppText>
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
          <View style={styles.metricHeadRow}>
            <Text style={styles.metricLabel}>Berat Badan</Text>
            <View style={styles.metricIcon}>
              <HeartPulse size={13} color={colors.primary} />
            </View>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{lastBmi ? lastBmi.weightKg : '--'}</Text>
            <Text style={styles.metricUnit}>kg</Text>
          </View>
          <Text style={styles.metricSub}>{metrics.category.label}</Text>
          <Text style={styles.metricFoot}>Dari riwayat pantauan</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeadRow}>
            <Text style={styles.metricLabel}>Tinggi Badan</Text>
            <View style={styles.metricIcon}>
              <Flag size={13} color={colors.primary} />
            </View>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{lastBmi ? lastBmi.heightCm : '--'}</Text>
            <Text style={styles.metricUnit}>cm</Text>
          </View>
          <Text style={styles.metricSub}>Target {WEEK_TARGET_KM} km</Text>
          <Text style={styles.metricFoot}>{weekKm} km pekan ini</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeadRow}>
            <Text style={styles.metricLabel}>Kalori Aktif</Text>
            <View style={styles.metricIcon}>
              <Flame size={13} color={colors.primary} />
            </View>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{weekCalories}</Text>
            <Text style={styles.metricUnit}>kkal</Text>
          </View>
          <Text style={styles.metricSub}>Rekap sesi GPS pekan ini</Text>
          <Text style={styles.metricFoot}>Terbakar saat beraktivitas</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeadRow}>
            <Text style={styles.metricLabel}>Durasi Aktif</Text>
            <View style={styles.metricIcon}>
              <Timer size={13} color={colors.primary} />
            </View>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{formatDurationLong(weekDurationSeconds)}</Text>
          </View>
          <Text style={styles.metricSub}>Waktu aktif minggu ini</Text>
          <Text style={styles.metricFoot}>Total latihan pekan ini</Text>
        </View>
      </View>

      {/* Saran kebugaran — judul + toggle + kotak highlight */}
      <View style={styles.tipCard}>
        <View style={styles.tipHead}>
          <Text style={styles.tipTitle}>Sudah Sarapan</Text>
          <Switch
            value={hadBreakfast}
            onValueChange={setHadBreakfast}
            trackColor={{ false: colors.outlineVariant, true: 'rgba(0,105,72,0.35)' }}
            thumbColor={hadBreakfast ? colors.primary : '#f4f3f4'}
          />
        </View>
        <Text style={styles.tipBody}>
          {hadBreakfast
            ? `Pertahankan aktivitas harianmu dengan target 6.000 langkah dan hidrasi ${metrics.waterIntakeLiters}L hari ini.`
            : 'Mulai dengan sarapan bergizi sebelum aktivitas hari ini.'}
        </Text>
        <View style={styles.tipHighlight}>
          <Droplets size={15} color={colors.primary} />
          <Text style={styles.tipHighlightText}>
            {metrics.waterIntakeLiters}L target air · 6.000 langkah hari ini
          </Text>
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
          <View style={styles.lastTop}>
            <View style={styles.lastIcon}>
              <Route size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="headlineSm">
                {ACTIVITY_TITLES[lastActivity.activityType ?? 'lari']}
              </AppText>
              <AppText variant="bodySm" muted>
                {lastActivity.dateFormatted} • {lastActivity.timeFormatted}
              </AppText>
            </View>
          </View>
          <View style={styles.lastStatsRow}>
            <View style={styles.lastStatCol}>
              <Text style={styles.lastStatLabel}>Jarak</Text>
              <Text style={styles.lastStatValue}>{formatDistance(lastActivity.distanceMeters)}</Text>
            </View>
            <View style={styles.lastStatCol}>
              <Text style={styles.lastStatLabel}>Durasi</Text>
              <Text style={styles.lastStatValue}>
                {formatDurationShort(lastActivity.durationSeconds)}
              </Text>
            </View>
            <View style={styles.lastStatCol}>
              <Text style={styles.lastStatLabel}>Pace</Text>
              <Text style={styles.lastStatValue}>
                {formatPace(lastActivity.distanceMeters, lastActivity.durationSeconds)}/km
              </Text>
            </View>
            <View style={styles.lastStatCol}>
              <Text style={styles.lastStatLabel}>Energi</Text>
              <Text style={styles.lastStatValue}>{lastActivity.caloriesBurned} kkal</Text>
            </View>
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
  headerDate: { fontSize: 12, fontFamily: fonts.bold, color: colors.onSurfaceVariant },
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
  greeting: { gap: 3, marginTop: 2, marginBottom: -2 },
  targetCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 14,
    padding: 14,
    gap: 9,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  targetHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  targetIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetLabel: { fontSize: 14, fontFamily: fonts.bold, color: colors.onSurface },
  targetValue: { fontSize: 17, fontFamily: fonts.extraBold, color: colors.onSurface },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceHighest,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  targetSub: { fontSize: 11.5, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  startCard: {
    backgroundColor: colors.dark800,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    boxShadow: '0px 4px 20px rgba(11,28,48,0.18)',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 999,
    marginTop: 8,
  },
  startBtnText: { fontSize: 14, fontFamily: fonts.bold, color: colors.onPrimary },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: {
    width: '47.7%',
    flexGrow: 1,
    backgroundColor: colors.surfaceLowest,
    borderRadius: 14,
    padding: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  metricHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
  metricIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(0,105,72,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  metricValue: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  metricUnit: { fontSize: 12, fontFamily: fonts.bold, color: colors.primaryEmphasis },
  metricSub: { fontSize: 11, fontFamily: fonts.medium, color: colors.primary },
  metricFoot: { fontSize: 10.5, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  tipCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tipHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipTitle: { fontSize: 14, fontFamily: fonts.bold, color: colors.onSurface },
  tipBody: { fontSize: 13, fontFamily: fonts.regular, color: colors.onSurfaceVariant, lineHeight: 19 },
  tipHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,105,72,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tipHighlightText: { fontSize: 12, fontFamily: fonts.bold, color: colors.primary, flexShrink: 1 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkText: { fontSize: 12, fontFamily: fonts.bold, color: colors.primary },
  lastCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  lastTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lastIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(0,105,72,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: 10,
  },
  lastStatCol: { flex: 1, minWidth: 0, gap: 2 },
  lastStatLabel: { fontSize: 10, fontFamily: fonts.medium, color: colors.onSurfaceVariant },
  lastStatValue: { fontSize: 13, fontFamily: fonts.bold, color: colors.onSurface },
  emptyLast: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
});
