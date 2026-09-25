import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  AlertCircle,
  CheckCircle2,
  Dumbbell,
  ShieldAlert,
  Utensils,
  Zap,
  Info,
} from 'lucide-react-native';
import { BMICategoryInfo, Gender, GenderPhysiologyInfo } from '../types';
interface StatusCardProps {
  category: BMICategoryInfo;
  weightDelta: number;
  gender?: Gender;
  genderPhysiology?: GenderPhysiologyInfo;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  category,
  weightDelta,
  gender = 'male',
  genderPhysiology,
}) => {

  const deltaFormatted = `${Math.abs(weightDelta).toFixed(1)} kg`;

  let deltaNotice = 'Massa tubuh berada dalam rentang keseimbangan klinis optimal.';
  if (weightDelta > 0) {
    deltaNotice = `Telemetri mencatat selisih +${deltaFormatted} di atas batas ideal yang disarankan.`;
  } else if (weightDelta < 0) {
    deltaNotice = `Telemetri mencatat selisih -${deltaFormatted} di bawah batas minimum ideal.`;
  }

  return (
    <View style={[styles.card, { borderLeftColor: category.color }]}>
      {/* Header with Status Badge & Gender Tag */}
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
            <View style={styles.tagRow}>
              <Text style={styles.subtitle}>STATUS FISIOLOGIS</Text>
              <View style={styles.genderTag}>
                <Text style={styles.genderTagText}>
                  {gender === 'male' ? '♂ PROTOKOL PRIA' : '♀ PROTOKOL WANITA'}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>Analisis Kategori: {category.label}</Text>
          </View>
        </View>

        <View style={[styles.rangeBadge, { backgroundColor: category.lightBg }]}>
          <Text style={[styles.rangeBadgeText, { color: category.color }]}>
            {category.range} BMI
          </Text>
        </View>
      </View>

      {/* Focus Protocol Banner if available */}
      {category.genderFocusTitle && (
        <View style={styles.protocolBanner}>
          <Zap size={13} color="#3B82F6" />
          <Text style={styles.protocolBannerText}>{category.genderFocusTitle}</Text>
        </View>
      )}

      {/* Summary Message */}
      <Text style={styles.summaryText}>{category.summary}</Text>

      {/* Delta Telemetry Note */}
      <View style={styles.deltaNoticeBox}>
        <View style={[styles.deltaDot, { backgroundColor: category.color }]} />
        <Text style={styles.deltaNoticeText}>{deltaNotice}</Text>
      </View>

      {/* Obesity Standard Notice */}
      {category.obesityStandardNotice && (
        <View style={styles.standardNoticeBox}>
          <Info size={13} color="#6366F1" />
          <Text style={styles.standardNoticeText}>{category.obesityStandardNotice}</Text>
        </View>
      )}

      {/* Dual Athletic & Nutrition Recommendation Grid */}
      <View style={styles.dualCardRow}>
        {/* Rekomendasi Latihan Fisik Terpersonalisasi Gender */}
        <View style={styles.recCard}>
          <View style={styles.recCardHeader}>
            <Dumbbell size={14} color="#3B82F6" />
            <Text style={[styles.recCardTitle, { color: '#2563EB' }]}>
              REKOMENDASI LATIHAN {gender === 'male' ? 'PRIA' : 'WANITA'}
            </Text>
          </View>
          <Text style={styles.recCardBody}>{category.athleticAdvice}</Text>
        </View>

        {/* Rekomendasi Pola Nutrisi Terpersonalisasi Gender */}
        <View style={styles.recCard}>
          <View style={styles.recCardHeader}>
            <Utensils size={14} color="#F59E0B" />
            <Text style={[styles.recCardTitle, { color: '#D97706' }]}>
              REKOMENDASI NUTRISI {gender === 'male' ? 'PRIA' : 'WANITA'}
            </Text>
          </View>
          <Text style={styles.recCardBody}>{category.nutritionAdvice}</Text>
        </View>
      </View>

      {/* Profil Risiko Klinis */}
      {category.riskNotice && (
        <View style={styles.riskBox}>
          <ShieldAlert size={12} color="#EF4444" />
          <Text style={styles.riskText}>
            <Text style={{ fontWeight: '800' }}>Perhatian Klinis: </Text>
            {category.riskNotice}
          </Text>
        </View>
      )}
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
    marginBottom: 8,
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
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  genderTag: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  genderTagText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
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
  protocolBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  protocolBannerText: {
    color: '#2563EB',
    fontSize: 10.5,
    fontWeight: '800',
    flex: 1,
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
    marginBottom: 8,
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
  standardNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  standardNoticeText: {
    color: '#4338CA',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
    lineHeight: 14,
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
  riskBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  riskText: {
    color: '#991B1B',
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
});
