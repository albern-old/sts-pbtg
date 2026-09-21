import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AlertCircle, CheckCircle2, Dumbbell, ShieldAlert, Utensils } from 'lucide-react-native';
import { BMICategoryInfo } from '../types';

interface StatusCardProps {
  category: BMICategoryInfo;
  weightDelta: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  category,
  weightDelta,
}) => {
  const deltaFormatted = `${Math.abs(weightDelta).toFixed(1)} kg`;

  let deltaNotice = 'Massa tubuh berada dalam rentang keseimbangan klinis optimal.';
  if (weightDelta > 0) {
    deltaNotice = `Telemetri mencatat selisih +${deltaFormatted} di atas batas yang disarankan.`;
  } else if (weightDelta < 0) {
    deltaNotice = `Telemetri mencatat selisih -${deltaFormatted} di bawah batas minimum ideal.`;
  }

  return (
    <View style={[styles.card, { borderLeftColor: category.color }]}>
      {/* Header with Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconCircle, { backgroundColor: category.lightBg }]}>
            {category.type === 'normal' ? (
              <CheckCircle2 size={18} color={category.color} />
            ) : category.type === 'obese' ? (
              <ShieldAlert size={18} color={category.color} />
            ) : (
              <AlertCircle size={18} color={category.color} />
            )}
          </View>
          <View>
            <Text style={styles.subtitle}>STATUS FISIOLOGIS</Text>
            <Text style={styles.title}>Analisis Kategori: {category.label}</Text>
          </View>
        </View>

        <View style={[styles.rangeBadge, { backgroundColor: category.lightBg }]}>
          <Text style={[styles.rangeBadgeText, { color: category.color }]}>
            RENTANG: {category.range} BMI
          </Text>
        </View>
      </View>

      {/* Summary Message */}
      <Text style={styles.summaryText}>{category.summary}</Text>

      {/* Delta Telemetry Note */}
      <View style={styles.deltaNoticeBox}>
        <View style={[styles.deltaDot, { backgroundColor: category.color }]} />
        <Text style={styles.deltaNoticeText}>{deltaNotice}</Text>
      </View>

      {/* Dual Athletic & Nutrition Recommendation Grid */}
      <View style={styles.dualCardRow}>
        {/* Rekomendasi Aktivitas Fisik */}
        <View style={styles.recCard}>
          <View style={styles.recCardHeader}>
            <Dumbbell size={14} color="#10B981" />
            <Text style={[styles.recCardTitle, { color: '#059669' }]}>
              REKOMENDASI AKTIVITAS FISIK
            </Text>
          </View>
          <Text style={styles.recCardBody}>{category.athleticAdvice}</Text>
        </View>

        {/* Rekomendasi Pola Nutrisi */}
        <View style={styles.recCard}>
          <View style={styles.recCardHeader}>
            <Utensils size={14} color="#F59E0B" />
            <Text style={[styles.recCardTitle, { color: '#D97706' }]}>
              REKOMENDASI POLA NUTRISI
            </Text>
          </View>
          <Text style={styles.recCardBody}>{category.nutritionAdvice}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  rangeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  rangeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  summaryText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 8,
  },
  deltaNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  deltaDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  deltaNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  dualCardRow: {
    gap: 8,
  },
  recCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  recCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recCardBody: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
});
