import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { BMICategoryInfo, Gender } from '../types';
import { ArrowDown, ArrowUp, CheckCircle2 } from 'lucide-react-native';
interface BodyIllustrationProps {
  gender: Gender;
  category: BMICategoryInfo;
  bmi: number;
  weightKg: number;
  idealWeightMin: number;
  idealWeightMax: number;
  weightDeltaToNormal: number;
}

export const BodyIllustration: React.FC<BodyIllustrationProps> = ({
  gender,
  category,
  bmi,
  weightKg,
  idealWeightMin,
  idealWeightMax,
  weightDeltaToNormal,
}) => {

  // Scaling factors for morphing silhouette
  const getSilhouetteScale = () => {
    switch (category.type) {
      case 'underweight':
        return { torsoScaleX: 0.82, hipScaleX: 0.85, limbWidth: 5 };
      case 'normal':
        return { torsoScaleX: 1.0, hipScaleX: 1.0, limbWidth: 6.5 };
      case 'overweight':
        return { torsoScaleX: 1.18, hipScaleX: 1.15, limbWidth: 8 };
      case 'obese':
        return { torsoScaleX: 1.35, hipScaleX: 1.3, limbWidth: 9.5 };
    }
  };

  const silhouette = getSilhouetteScale();

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        {/* Left: Dynamic Morphing Body Silhouette SVG */}
        <View style={styles.silhouetteContainer}>
          <View style={styles.svgWrapper}>
            <Svg width={70} height={120} viewBox="0 0 100 160">
              {/* Head */}
              <Circle cx="50" cy="24" r="12" fill={category.color} />
              {/* Neck */}
              <Line x1="50" y1="36" x2="50" y2="44" stroke={category.color} strokeWidth="6" strokeLinecap="round" />

              {/* Torso / Chest */}
              <Path
                d={
                  gender === 'male'
                    ? `M ${50 - 18 * silhouette.torsoScaleX} 44 L ${50 + 18 * silhouette.torsoScaleX} 44 L ${50 + 14 * silhouette.hipScaleX} 90 L ${50 - 14 * silhouette.hipScaleX} 90 Z`
                    : `M ${50 - 15 * silhouette.torsoScaleX} 44 L ${50 + 15 * silhouette.torsoScaleX} 44 L ${50 + 18 * silhouette.hipScaleX} 92 L ${50 - 18 * silhouette.hipScaleX} 92 Z`
                }
                fill={category.color}
              />

              {/* Arms */}
              <Line
                x1={50 - 18 * silhouette.torsoScaleX}
                y1="46"
                x2={50 - 24 * silhouette.torsoScaleX}
                y2="88"
                stroke={category.color}
                strokeWidth={silhouette.limbWidth}
                strokeLinecap="round"
              />
              <Line
                x1={50 + 18 * silhouette.torsoScaleX}
                y1="46"
                x2={50 + 24 * silhouette.torsoScaleX}
                y2="88"
                stroke={category.color}
                strokeWidth={silhouette.limbWidth}
                strokeLinecap="round"
              />

              {/* Legs */}
              <Line
                x1={50 - 8 * silhouette.hipScaleX}
                y1="90"
                x2={50 - 10 * silhouette.hipScaleX}
                y2="148"
                stroke={category.color}
                strokeWidth={silhouette.limbWidth}
                strokeLinecap="round"
              />
              <Line
                x1={50 + 8 * silhouette.hipScaleX}
                y1="90"
                x2={50 + 10 * silhouette.hipScaleX}
                y2="148"
                stroke={category.color}
                strokeWidth={silhouette.limbWidth}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={styles.genderBadge}>
            <Text style={styles.genderBadgeText}>
              {gender === 'male' ? 'Pria' : 'Wanita'} • {category.label}
            </Text>
          </View>
        </View>

        {/* Right: Rekomendasi Berat Badan Ideal & Clinical Narrative */}
        <View style={styles.infoCol}>
          {/* Header Row */}
          <View style={styles.recHeaderRow}>
            <Text style={styles.recTag}>REKOMENDASI BERAT BADAN IDEAL</Text>
            <View style={[styles.catPill, { backgroundColor: category.lightBg }]}>
              <Text style={[styles.catPillText, { color: category.color }]}>
                {category.badge}
              </Text>
            </View>
          </View>

          {/* Target Weight Range Box */}
          <View style={styles.targetRangeBox}>
            <Text style={styles.rangeLabel}>Rentang Normal (BMI 18.5 – 24.9):</Text>
            <Text style={styles.rangeValue}>
              {idealWeightMin} – {idealWeightMax} kg
            </Text>

            {/* Delta Recommendation */}
            <View style={styles.deltaNoticeRow}>
              {weightDeltaToNormal > 0 ? (
                <>
                  <ArrowDown size={14} color="#D97706" />
                  <Text style={styles.deltaText}>
                    Rekomendasi: turunkan <Text style={{ fontWeight: '800' }}>{weightDeltaToNormal} kg</Text> untuk mencapai batas normal.
                  </Text>
                </>
              ) : weightDeltaToNormal < 0 ? (
                <>
                  <ArrowUp size={14} color="#2563EB" />
                  <Text style={styles.deltaText}>
                    Rekomendasi: naikkan <Text style={{ fontWeight: '800' }}>{Math.abs(weightDeltaToNormal)} kg</Text> untuk mencapai batas normal.
                  </Text>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} color="#3B82F6" />
                  <Text style={[styles.deltaText, { color: '#2563EB' }]}>
                    Selamat! Berat badan Anda sudah berada dalam rentang ideal prima.
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Narrative clinical summary */}
          <Text style={styles.narrativeSummary}>
            {category.summary} {category.nutritionAdvice}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginVertical: 6,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  silhouetteContainer: {
    width: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 125,
  },
  genderBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 6,
  },
  genderBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
  },
  recHeaderRow: {
    marginBottom: 8,
  },
  recTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#2563EB',
    marginBottom: 3,
  },
  catPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catPillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  targetRangeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 6,
  },
  rangeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  rangeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  deltaNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  deltaText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
    flex: 1,
    lineHeight: 14,
  },
  narrativeSummary: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 4,
  },
});
