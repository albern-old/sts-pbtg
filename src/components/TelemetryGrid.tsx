import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  Flame,
  Heart,
  Droplets,
  Scale,
  Activity,
  Percent,
  ChevronRight,
  Zap,
  Dumbbell,
  Utensils,
  ShieldAlert,
} from 'lucide-react-native';
import { ActivityLevel, TelemetryMetrics } from '../types';
interface TelemetryGridProps {
  metrics: TelemetryMetrics;
  currentActivity?: ActivityLevel;
  onSelectActivity?: (level: ActivityLevel) => void;
  gpsCaloriesBurned?: number;
  onOpenHeartZones: () => void;
}

const ACTIVITY_QUICK_TABS: { id: ActivityLevel; label: string; mult: string }[] = [
  { id: 'sedentary', label: 'Santai', mult: '1.20x' },
  { id: 'light', label: 'Ringan', mult: '1.37x' },
  { id: 'moderate', label: 'Sedang', mult: '1.55x' },
  { id: 'active', label: 'Aktif', mult: '1.72x' },
  { id: 'athlete', label: 'Atlet', mult: '1.90x' },
];

export const TelemetryGrid: React.FC<TelemetryGridProps> = ({
  metrics,
  currentActivity = 'moderate',
  onSelectActivity,
  gpsCaloriesBurned = 0,
  onOpenHeartZones,
}) => {

  const isFemale = metrics.genderPhysiology.gender === 'female';

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>BIOMETRIC PERFORMANCE MATRIX</Text>
          <Text style={styles.sectionSub}>
            Pengaruh Fisiologi {metrics.genderPhysiology.genderLabel} &amp; Tingkat Aktivitas
          </Text>
        </View>
        <View style={styles.genderMatrixBadge}>
          <Text style={styles.genderMatrixBadgeText}>
            {isFemale ? '♀ PROFIL WANITA' : '♂ PROFIL PRIA'}
          </Text>
        </View>
      </View>

      {/* Quick Activity Level Selector inside Matrix */}
      {onSelectActivity && (
        <View style={styles.activitySelectorBox}>
          <View style={styles.activitySelectorHeader}>
            <Text style={styles.activitySelectorTitle}>PILIH TINGKAT AKTIVITAS HARIAN:</Text>
            <View style={styles.activitySelectorBadge}>
              <Text style={styles.activitySelectorBadgeText}>
                {(ACTIVITY_QUICK_TABS.find((t) => t.id === currentActivity)?.label || currentActivity).toUpperCase()}
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activityTabsRow}
          >
            {ACTIVITY_QUICK_TABS.map((tab) => {
              const isSelected = currentActivity === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.activityTabBtn,
                    isSelected && styles.activityTabBtnActive,
                  ]}
                  onPress={() => onSelectActivity(tab.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.activityTabLabel,
                      isSelected && styles.activityTabLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  <Text
                    style={[
                      styles.activityTabMult,
                      isSelected && styles.activityTabMultActive,
                    ]}
                  >
                    {tab.mult}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 2-Column Grid */}
      <View style={styles.grid}>
        {/* Metric 1: Ideal Mass Equilibrium */}
        <View style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Scale size={18} color="#3B82F6" />
            </View>
            <View style={styles.targetBadge}>
              <Text style={styles.targetBadgeText}>IDEAL {isFemale ? '♀' : '♂'}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.metricLabel}>RENTANG BERAT IDEAL</Text>
            <Text style={styles.metricValBig}>{metrics.idealWeightMin} kg</Text>
            <Text style={styles.metricSub}>hingga {metrics.idealWeightMax} kg ({isFemale ? 'BMI 18.5–23.5' : 'BMI 19.5–24.5'})</Text>
          </View>
        </View>

        {/* Metric 2: Daily Calorie Burn (TDEE) */}
        <View style={[styles.metricCard, styles.metricCardHighlight]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
              <Flame size={18} color="#F59E0B" />
            </View>
            <View style={styles.tdeeBadge}>
              <Text style={styles.tdeeBadgeText}>
                TDEE x{metrics.activityMultiplier}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.metricLabel}>PENGELUARAN KALORI</Text>
            <Text style={styles.metricValBig}>{metrics.tdee.toLocaleString()}</Text>
            <Text style={[styles.metricSub, { color: '#3B82F6', fontWeight: '700' }]}>
              kkal / hari
            </Text>

            {/* Rincian BMR + Kalori Aktivitas */}
            <View style={styles.breakdownBox}>
              <Text style={styles.breakdownText}>
                BMR: {metrics.bmr} + Aktif: +{metrics.activityCalories}
              </Text>
            </View>

            {/* Kalori tambahan dari Pelacak GPS bila ada */}
            {gpsCaloriesBurned > 0 && (
              <View style={styles.gpsBonusBadge}>
                <Text style={styles.gpsBonusText}>
                  +{gpsCaloriesBurned} kcal dari GPS hari ini
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Metric 3: Basal Metabolic Rate (BMR) */}
        <View style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Activity size={18} color="#3B82F6" />
            </View>
            <View style={styles.baseBadge}>
              <Text style={styles.baseBadgeText}>BMR {isFemale ? '♀' : '♂'}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.metricLabel}>METABOLISME BASAL</Text>
            <Text style={styles.metricValBig}>{metrics.bmr.toLocaleString()}</Text>
            <Text style={styles.metricSub}>
              Mifflin-St Jeor ({isFemale ? 'Wanita -161 kkal' : 'Pria +5 kkal'})
            </Text>
          </View>
        </View>

        {/* Metric 4: Body Fat Percentage & Gender Status */}
        <View style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Percent size={18} color="#2563EB" />
            </View>
            <View
              style={[
                styles.bfBadge,
                { backgroundColor: `${metrics.bodyFatCategory.color}15`, borderColor: `${metrics.bodyFatCategory.color}40` },
              ]}
            >
              <Text style={[styles.bfBadgeText, { color: metrics.bodyFatCategory.color }]}>
                {metrics.bodyFatCategory.label}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.metricLabel}>ESTIMASI LEMAK TUBUH</Text>
            <Text style={styles.metricValBig}>{metrics.bodyFatPercentage}%</Text>
            <Text style={[styles.metricSub, { color: metrics.bodyFatCategory.color, fontWeight: '700' }]}>
              {metrics.bodyFatCategory.badge}
            </Text>
            <Text style={[styles.metricSub, { fontSize: 9, marginTop: 2 }]}>
              {metrics.genderPhysiology.bodyFatThresholds}
            </Text>
          </View>
        </View>

        {/* Metric 5: Hydration Need (Terpengaruh Aktivitas) */}
        <View style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Droplets size={18} color="#3B82F6" />
            </View>
            <View style={styles.h2oBadge}>
              <Text style={styles.h2oBadgeText}>
                H2O (+{metrics.hydrationActivityBonus}L)
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.metricLabel}>KEBUTUHAN HIDRASI</Text>
            <Text style={styles.metricValBig}>{metrics.waterIntakeLiters.toFixed(1)} L</Text>
            <Text style={styles.metricSub}>
              cairan harian (intensitas {metrics.activityLevel})
            </Text>
          </View>
        </View>

        {/* Metric 6: Max Heart Rate & Interactive Zones Modal Button */}
        <TouchableOpacity
          style={[styles.metricCard, styles.metricCardTouchable]}
          onPress={onOpenHeartZones}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
              <Heart size={18} color="#EF4444" fill="#EF4444" />
            </View>
            <View style={styles.zonesBadge}>
              <Text style={styles.zonesBadgeText}>ZONA HR ›</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.metricLabel}>DENYUT JANTUNG MAKS</Text>
            <Text style={styles.metricValBig}>{metrics.maxHeartRate} bpm</Text>
            <Text style={[styles.metricSub, { color: '#6366F1', fontWeight: '700', fontSize: 9.5 }]}>
              {isFemale ? 'Formula Klinis Gulati' : 'Formula Tanaka'}
            </Text>
            <View style={styles.viewZonesRow}>
              <Text style={styles.viewZonesText}>5 Zona Latihan Fisiologis</Text>
              <ChevronRight size={13} color="#2563EB" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Box Protokol Latihan & Obesitas Khusus Gender */}
      <View style={styles.physiologyOverviewCard}>
        <View style={styles.overviewHeaderRow}>
          <View style={styles.overviewTitleGroup}>
            <Dumbbell size={15} color="#3B82F6" />
            <Text style={styles.overviewTitle}>
              {metrics.genderPhysiology.trainingFocusTitle.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.overviewDesc}>{metrics.genderPhysiology.trainingFocusDesc}</Text>

        <View style={styles.overviewDivider} />

        <View style={styles.overviewHeaderRow}>
          <View style={styles.overviewTitleGroup}>
            <Utensils size={15} color="#F59E0B" />
            <Text style={[styles.overviewTitle, { color: '#B45309' }]}>
              {metrics.genderPhysiology.nutritionFocusTitle.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.overviewDesc}>{metrics.genderPhysiology.nutritionFocusDesc}</Text>

        <View style={styles.obesityCriteriaRow}>
          <ShieldAlert size={14} color="#EF4444" />
          <Text style={styles.obesityCriteriaText}>
            {metrics.genderPhysiology.obesityStandardNotice}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#64748B',
  },
  sectionSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  genderMatrixBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genderMatrixBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activitySelectorBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  activitySelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 6,
  },
  activitySelectorTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    flex: 1,
  },
  activitySelectorBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1, borderColor: '#3B82F6',
  },
  activitySelectorBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  activityTabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  activityTabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  activityTabBtnActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  activityTabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  activityTabLabelActive: {
    color: '#FFFFFF',
  },
  activityTabMult: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 1,
  },
  activityTabMultActive: {
    color: '#DBEAFE',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48.3%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 130,
  },
  metricCardHighlight: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF5',
  },
  metricCardTouchable: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1, borderColor: '#3B82F6',
  },
  targetBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  tdeeBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tdeeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  baseBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  baseBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  bfBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  bfBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  h2oBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1, borderColor: '#3B82F6',
  },
  h2oBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  zonesBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1, borderColor: '#3B82F6',
  },
  zonesBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  cardBody: {
    marginTop: 10,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#64748B',
    marginBottom: 2,
  },
  metricValBig: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  metricSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  breakdownBox: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 5,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  breakdownText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
  },
  gpsBonusBadge: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 5,
    backgroundColor: '#DBEAFE',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  gpsBonusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  viewZonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  viewZonesText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  physiologyOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  overviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  overviewTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  overviewTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.3,
  },
  overviewDesc: {
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 15,
  },
  overviewDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  obesityCriteriaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 10,
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  obesityCriteriaText: {
    fontSize: 10,
    color: '#991B1B',
    lineHeight: 14,
    flex: 1,
    fontWeight: '600',
  },
});
