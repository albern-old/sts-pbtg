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
  { id: 'sedentary', label: 'Istirahat', mult: '1.20x' },
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
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>BIOMETRIC PERFORMANCE MATRIX</Text>
          <Text style={styles.sectionSub}>Pengaruh Tingkat Aktivitas Fisiologis</Text>
        </View>
        <View style={styles.realtimeBadge}>
          <Zap size={11} color="#10B981" />
          <Text style={styles.sectionSubtitle}>Real-Time Derived</Text>
        </View>
      </View>

      {/* Quick Activity Level Selector inside Matrix */}
      {onSelectActivity && (
        <View style={styles.activitySelectorBox}>
          <Text style={styles.activitySelectorTitle}>PILIH TINGKAT AKTIVITAS HARIAN:</Text>
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
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Scale size={18} color="#10B981" />
            </View>
            <View style={styles.targetBadge}>
              <Text style={styles.targetBadgeText}>TARGET</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.metricLabel}>IDEAL EQUILIBRIUM</Text>
            <Text style={styles.metricValBig}>{metrics.idealWeightMin} kg</Text>
            <Text style={styles.metricSub}>to {metrics.idealWeightMax} kg</Text>
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
            <Text style={styles.metricLabel}>DAILY CALORIE BURN</Text>
            <Text style={styles.metricValBig}>{metrics.tdee.toLocaleString()}</Text>
            <Text style={[styles.metricSub, { color: '#10B981', fontWeight: '700' }]}>
              kcal / day
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
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Activity size={18} color="#10B981" />
            </View>
            <View style={styles.baseBadge}>
              <Text style={styles.baseBadgeText}>BASE</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.metricLabel}>BASAL METABOLIC (BMR)</Text>
            <Text style={styles.metricValBig}>{metrics.bmr.toLocaleString()}</Text>
            <Text style={styles.metricSub}>kcal idle maintenance</Text>
          </View>
        </View>

        {/* Metric 4: Body Fat Percentage */}
        <View style={styles.metricCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <Percent size={18} color="#059669" />
            </View>
            <View style={styles.bfBadge}>
              <Text style={styles.bfBadgeText}>EST. BF</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.metricLabel}>BODY FAT EST.</Text>
            <Text style={styles.metricValBig}>{metrics.bodyFatPercentage}%</Text>
            <Text style={styles.metricSub}>Deurenberg Index</Text>
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
            <Text style={styles.metricLabel}>HYDRATION NEED</Text>
            <Text style={styles.metricValBig}>{metrics.waterIntakeLiters.toFixed(1)} L</Text>
            <Text style={styles.metricSub}>
              fluid intake / day (intensitas {metrics.activityLevel})
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
              <Text style={styles.zonesBadgeText}>ZONES ›</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.metricLabel}>MAX HEART RATE</Text>
            <Text style={styles.metricValBig}>{metrics.maxHeartRate} bpm</Text>
            <View style={styles.viewZonesRow}>
              <Text style={styles.viewZonesText}>View 5 Training Zones</Text>
              <ChevronRight size={13} color="#059669" />
            </View>
          </View>
        </TouchableOpacity>
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
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  activitySelectorBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activitySelectorTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 6,
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
    backgroundColor: '#10B981',
    borderColor: '#059669',
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
    color: '#D1FAE5',
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
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
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
    borderWidth: 1,
    borderColor: '#BFDBFE',
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
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  bfBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  h2oBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  h2oBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  zonesBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  zonesBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
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
    backgroundColor: '#DCFCE7',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  gpsBonusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  viewZonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  viewZonesText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
});
