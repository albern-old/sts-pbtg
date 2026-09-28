import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, Flame, Gauge, MoveUp, Pause, Play, RotateCcw, Square } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { formatDurationShort, formatElevation, formatPace } from '../../utils/format';
import { TrackerStatus } from '../../hooks/useActivityTracker';

interface Props {
  status: TrackerStatus;
  distanceMeters: number;
  durationSeconds: number;
  caloriesBurned: number;
  elevationGainMeters: number;
  canReset: boolean;
  canStop: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
}

// Panel statistik mengambang di atas peta (desain "Pelacak Aktivitas GPS").
export const TrackerPanel: React.FC<Props> = ({
  status,
  distanceMeters,
  durationSeconds,
  caloriesBurned,
  elevationGainMeters,
  canReset,
  canStop,
  onStart,
  onPause,
  onStop,
  onReset,
}) => {
  const pace = formatPace(distanceMeters, durationSeconds);
  const tracking = status === 'tracking';

  return (
    <View style={styles.card}>
      <View style={styles.distanceRow}>
        <Text style={styles.distanceLabel}>JARAK TEMPUH</Text>
        <View style={styles.distanceValueRow}>
          <Text style={styles.distanceValue}>{(distanceMeters / 1000).toFixed(2)}</Text>
          <Text style={styles.distanceUnit}>KM</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.cell}>
          <View style={styles.cellHead}>
            <Clock size={14} color={colors.primary} />
            <Text style={styles.cellLabel}>DURASI</Text>
          </View>
          <Text style={styles.cellValue}>{formatDurationShort(durationSeconds)}</Text>
        </View>
        <View style={styles.cell}>
          <View style={styles.cellHead}>
            <Gauge size={14} color={colors.primary} />
            <Text style={styles.cellLabel}>RATA-RATA PACE</Text>
          </View>
          <Text style={styles.cellValue}>
            {pace} <Text style={styles.cellUnit}>/km</Text>
          </Text>
        </View>
        <View style={styles.cell}>
          <View style={styles.cellHead}>
            <Flame size={14} color={colors.primary} />
            <Text style={styles.cellLabel}>KALORI</Text>
          </View>
          <Text style={styles.cellValue}>
            {caloriesBurned} <Text style={styles.cellUnit}>Kkal</Text>
          </Text>
        </View>
        <View style={styles.cell}>
          <View style={styles.cellHead}>
            <MoveUp size={14} color={colors.primary} />
            <Text style={styles.cellLabel}>ELEVASI</Text>
          </View>
          <Text style={styles.cellValue}>
            {formatElevation(elevationGainMeters)} <Text style={styles.cellUnit}>m</Text>
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          accessibilityLabel="Reset sesi"
          accessibilityRole="button"
          onPress={onReset}
          disabled={!canReset}
          activeOpacity={0.85}
          style={[styles.sideBtn, !canReset && styles.disabled]}
        >
          <RotateCcw size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        {tracking ? (
          <TouchableOpacity
            accessibilityLabel="Jeda"
            accessibilityRole="button"
            onPress={onPause}
            activeOpacity={0.85}
            style={styles.mainBtn}
          >
            <Pause size={26} color={colors.onPrimary} fill={colors.onPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            accessibilityLabel="Mulai"
            accessibilityRole="button"
            onPress={onStart}
            activeOpacity={0.85}
            style={styles.mainBtn}
          >
            <Play size={26} color={colors.onPrimary} fill={colors.onPrimary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          accessibilityLabel="Berhenti dan simpan"
          accessibilityRole="button"
          onPress={onStop}
          disabled={!canStop}
          activeOpacity={0.85}
          style={[styles.stopBtn, canStop ? null : styles.disabled]}
        >
          <Square size={15} color={colors.onPrimary} fill={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  distanceRow: { alignItems: 'center', gap: 2 },
  distanceLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  distanceValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  distanceValue: {
    fontSize: 40,
    fontFamily: fonts.extraBold,
    color: colors.onSurface,
    letterSpacing: -1,
  },
  distanceUnit: { fontSize: 16, fontFamily: fonts.bold, color: colors.primaryEmphasis },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  cell: { width: '50%', gap: 4, paddingRight: 8 },
  cellHead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cellLabel: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  cellValue: { fontSize: 17, fontFamily: fonts.extraBold, color: colors.onSurface },
  cellUnit: { fontSize: 12, fontFamily: fonts.medium, color: colors.onSurfaceVariant },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingTop: 2,
  },
  sideBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  stopBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.35 },
});
