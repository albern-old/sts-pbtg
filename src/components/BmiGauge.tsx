import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BMICategoryInfo } from '../types';

interface BmiGaugeProps {
  bmi: number;
  category: BMICategoryInfo;
}

export const BmiGauge: React.FC<BmiGaugeProps> = ({ bmi, category }) => {
  // SVG circular progress halo geometry
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  // Normalizing BMI for circular ring: 14 BMI = 0%, 40 BMI = 100%
  const minBmi = 14;
  const maxBmi = 40;
  const clampedBmi = Math.max(minBmi, Math.min(maxBmi, bmi));
  const progressRatio = (clampedBmi - minBmi) / (maxBmi - minBmi);
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Piecewise linear interpolation for the horizontal spectrum bar (0% to 100%)
  const calculateHorizontalPercent = (val: number) => {
    if (val <= 14) return 0;
    if (val < 18.5) {
      return ((val - 14) / (18.5 - 14)) * 25;
    }
    if (val < 25.0) {
      return 25 + ((val - 18.5) / (25.0 - 18.5)) * 25;
    }
    if (val < 30.0) {
      return 50 + ((val - 25.0) / (30.0 - 25.0)) * 25;
    }
    if (val < 40.0) {
      return 75 + ((val - 30.0) / (40.0 - 30.0)) * 25;
    }
    return 100;
  };

  const horizontalPercent = Math.max(4, Math.min(94, calculateHorizontalPercent(bmi)));

  return (
    <View style={styles.card}>
      {/* Header Telemetry Subtitle */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerDot, { backgroundColor: category.color }]} />
          <Text style={styles.headerTitle}>BIOMETRIC TELEMETRY INDEX</Text>
        </View>
        <View style={[styles.badgeContainer, { backgroundColor: category.lightBg }]}>
          <Text style={[styles.badgeText, { color: category.color }]}>{category.badge}</Text>
        </View>
      </View>

      {/* Circular Progress Halo & Score Display */}
      <View style={styles.gaugeContainer}>
        <Svg width={160} height={160} viewBox="0 0 160 160">
          <Defs>
            <LinearGradient id="normalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#10B981" />
              <Stop offset="100%" stopColor="#84CC16" />
            </LinearGradient>
          </Defs>

          {/* Background Track */}
          <Circle
            cx={80}
            cy={80}
            r={radius}
            fill="transparent"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />

          {/* Foreground Dynamic Progress Stroke */}
          <Circle
            cx={80}
            cy={80}
            r={radius}
            fill="transparent"
            stroke={category.type === 'normal' ? 'url(#normalGradient)' : category.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
          />
        </Svg>

        {/* Center Telemetry Text Container */}
        <View style={styles.centerTextOverlay}>
          <Text style={styles.bodyMassLabel}>BODY MASS</Text>
          <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
          <Text style={[styles.categoryLabel, { color: category.color }]}>{category.label}</Text>
        </View>
      </View>

      {/* Spektrum Formula Subtitle */}
      <View style={styles.spectrumHeader}>
        <Text style={styles.spectrumFormula}>SPEKTRUM BMI: BERAT ÷ [TINGGI (M)]²</Text>
        <Text style={styles.spectrumIdeal}>IDEAL: 18.5 – 24.9</Text>
      </View>

      {/* Interactive Horizontal Color Spectrum Bar */}
      <View style={styles.spectrumContainer}>
        {/* Pointer Pin Indicator */}
        <View style={[styles.pinIndicator, { left: `${horizontalPercent}%` }]}>
          <View style={styles.pinBubble}>
            <Text style={styles.pinBubbleText}>{bmi.toFixed(1)} BMI</Text>
          </View>
          <View style={styles.pinArrow} />
        </View>

        {/* The 4 Spectrum Segment Bars */}
        <View style={styles.barsRow}>
          <View style={[styles.barSegment, { backgroundColor: '#3B82F6', borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]} />
          <View style={[styles.barSegment, { backgroundColor: '#10B981' }]} />
          <View style={[styles.barSegment, { backgroundColor: '#F59E0B' }]} />
          <View style={[styles.barSegment, { backgroundColor: '#EF4444', borderTopRightRadius: 6, borderBottomRightRadius: 6 }]} />
        </View>

        {/* Spectrum Numbers and Labels */}
        <View style={styles.labelsRow}>
          <View style={styles.labelCol}>
            <Text style={styles.labelTextNum}>18.5</Text>
            <Text style={[styles.labelTextCategory, { color: '#3B82F6' }]}>KURUS</Text>
          </View>
          <View style={styles.labelCol}>
            <Text style={styles.labelTextNum}>24.9</Text>
            <Text style={[styles.labelTextCategory, { color: '#10B981' }]}>NORMAL</Text>
          </View>
          <View style={styles.labelCol}>
            <Text style={styles.labelTextNum}>29.9</Text>
            <Text style={[styles.labelTextCategory, { color: '#F59E0B' }]}>GEMUK</Text>
          </View>
          <View style={styles.labelCol}>
            <Text style={styles.labelTextNum}>30+</Text>
            <Text style={[styles.labelTextCategory, { color: '#EF4444' }]}>OBESITAS</Text>
          </View>
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
    marginVertical: 6,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#64748B',
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gaugeContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  centerTextOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyMassLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  bmiValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  spectrumHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 16,
  },
  spectrumFormula: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  spectrumIdeal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  spectrumContainer: {
    width: '100%',
    position: 'relative',
    paddingTop: 18,
    marginBottom: 6,
  },
  pinIndicator: {
    position: 'absolute',
    top: -4,
    transform: [{ translateX: -28 }],
    alignItems: 'center',
    zIndex: 10,
  },
  pinBubble: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  pinBubbleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  pinArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
  },
  barsRow: {
    flexDirection: 'row',
    height: 8,
    width: '100%',
    gap: 3,
  },
  barSegment: {
    flex: 1,
    height: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  labelCol: {
    alignItems: 'center',
  },
  labelTextNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  labelTextCategory: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
