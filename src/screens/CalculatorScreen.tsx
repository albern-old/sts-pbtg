import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Bookmark,
  Calculator,
  CalendarDays,
  Droplets,
  HeartPulse,
  Minus,
  Plus,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { AppText } from '../components/atoms/AppText';
import { Badge } from '../components/atoms/Badge';
import { BrandHeader } from '../components/molecules/BrandHeader';
import { SectionHeader } from '../components/molecules/SectionHeader';
import { ActivityLevelSelector } from '../components/molecules/ActivityLevelSelector';
import { SegmentedControl } from '../components/atoms/SegmentedControl';
import { HeartRateZonesModal } from '../components/HeartRateZonesModal';
import type { useBmiCalculator } from '../hooks/useBmiCalculator';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Calculator = ReturnType<typeof useBmiCalculator>;

const SPECTRUM = [
  { label: 'Kurus', range: '<18.5', color: '#93C5FD' },
  { label: 'Normal', range: '18.5–24.9', color: colors.primaryEmphasis },
  { label: 'Gemuk', range: '25–29.9', color: '#F59E0B' },
  { label: 'Obesitas', range: '≥30', color: colors.error },
];

// Posisi continuous 0..1 pada spektrum BMI (14 → 40)
function spectrumPosition(bmi: number): number {
  const clamp = Math.max(14, Math.min(40, bmi));
  const segments: [number, number][] = [
    [14, 18.5],
    [18.5, 25],
    [25, 30],
    [30, 40],
  ];
  for (let i = 0; i < segments.length; i += 1) {
    const [lo, hi] = segments[i];
    if (clamp <= hi || i === segments.length - 1) {
      const t = Math.max(0, Math.min(1, (clamp - lo) / (hi - lo)));
      return (i + t) / segments.length;
    }
  }
  return 0.5;
}

function riskLabel(type: string): string {
  if (type === 'normal') return 'Sangat Rendah';
  if (type === 'obese') return 'Tinggi';
  return 'Sedang';
}

export const CalculatorScreen: React.FC<{ calculator: Calculator }> = ({ calculator }) => {
  const [zonesOpen, setZonesOpen] = useState(false);
  const internalGender = calculator.gender === 'pria' ? 'male' : 'female';
  const { metrics } = calculator;
  const markerPos = spectrumPosition(metrics.bmi);

  const weightIdealText = () => {
    const ideal = `${metrics.idealWeightMin} kg – ${metrics.idealWeightMax} kg`;
    if (metrics.weightDeltaToNormal === 0) {
      return `Untuk tinggi ${calculator.heightCm} cm, rentang ideal Anda adalah ${ideal}. Berat badan Anda saat ini ideal, pertahankan gaya hidup sehat!`;
    }
    const delta = Math.abs(metrics.weightDeltaToNormal).toFixed(1);
    if (metrics.weightDeltaToNormal > 0) {
      return `Untuk tinggi ${calculator.heightCm} cm, rentang ideal Anda adalah ${ideal}. Turunkan sekitar ${delta} kg secara bertahap lewat defisit kalori ringan dan latihan rutin.`;
    }
    return `Untuk tinggi ${calculator.heightCm} cm, rentang ideal Anda adalah ${ideal}. Tambah sekitar ${delta} kg dengan pola makan bergizi dan latihan kekuatan.`;
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BrandHeader
          right={
            <View style={styles.whoChip}>
              <ShieldCheck size={13} color={colors.primary} />
              <Text style={styles.whoChipText}>Standar WHO</Text>
            </View>
          }
        />

        <SectionHeader
          title="Kalkulator BMI"
          subtitle="Hitung indeks massa tubuhmu dan lihat rentang ideal berdasarkan profilmu."
        />

        {/* Jenis kelamin */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <User size={16} color={colors.primary} />
            <Text style={styles.fieldLabel}>JENIS KELAMIN</Text>
          </View>
          <SegmentedControl
            variant="emph"
            options={[
              { value: 'pria', label: 'Pria' },
              { value: 'wanita', label: 'Wanita' },
            ]}
            value={calculator.gender}
            onChange={calculator.setGender}
          />
        </View>

        {/* Usia */}
        <View style={styles.card}>
          <View style={styles.valueRow}>
            <View style={styles.iconCircle}>
              <CalendarDays size={17} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>USIA</Text>
              <Text style={styles.valueText}>{calculator.age} Tahun</Text>
            </View>
            <TouchableOpacity
              accessibilityLabel="Kurangi usia"
              style={styles.stepBtn}
              onPress={() => calculator.setAge(Math.max(10, calculator.age - 1))}
              activeOpacity={0.85}
            >
              <Minus size={17} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Tambah usia"
              style={styles.stepBtn}
              onPress={() => calculator.setAge(Math.min(110, calculator.age + 1))}
              activeOpacity={0.85}
            >
              <Plus size={17} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tinggi badan */}
        <View style={styles.card}>
          <View style={styles.valueRow}>
            <View style={styles.iconCircle}>
              <Calculator size={17} color={colors.primary} />
            </View>
            <Text style={[styles.fieldLabel, { flex: 1 }]}>TINGGI BADAN</Text>
            <Text style={styles.valueGreen}>{calculator.heightCm} cm</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={120}
            maximumValue={210}
            step={1}
            value={calculator.heightCm}
            onValueChange={calculator.setHeightCm}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceHighest}
            thumbTintColor={colors.primary}
          />
          <View style={styles.ruler}>
            <Text style={styles.rulerText}>120 cm</Text>
            <Text style={styles.rulerText}>165 cm</Text>
            <Text style={styles.rulerText}>210 cm</Text>
          </View>
        </View>

        {/* Berat badan */}
        <View style={styles.card}>
          <View style={styles.valueRow}>
            <View style={styles.iconCircle}>
              <HeartPulse size={17} color={colors.primary} />
            </View>
            <Text style={[styles.fieldLabel, { flex: 1 }]}>BERAT BADAN</Text>
            <Text style={styles.valueGreen}>
              {calculator.weightKg.toFixed(1).replace('.', ',')} kg
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={35}
            maximumValue={130}
            step={0.5}
            value={calculator.weightKg}
            onValueChange={calculator.setWeightKg}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceHighest}
            thumbTintColor={colors.primary}
          />
          <View style={styles.ruler}>
            <Text style={styles.rulerText}>35 kg</Text>
            <Text style={styles.rulerText}>82 kg</Text>
            <Text style={styles.rulerText}>130 kg</Text>
          </View>
        </View>

        {/* Tingkat aktivitas (dipertahankan untuk TDEE & hidrasi) */}
        <View style={styles.card}>
          <ActivityLevelSelector
            value={calculator.activity}
            onChange={calculator.setActivity}
          />
        </View>

        {/* Hasil BMI (selalu live saat slider/dropdown berubah — tanpa tombol hitung) */}
        <View style={styles.card}>
          <Text style={styles.resultEyebrow}>HASIL BMI</Text>
          <View style={styles.resultRow}>
            <View style={styles.resultValueRow}>
              <Text style={styles.resultValue}>{metrics.bmi}</Text>
              <Text style={styles.resultUnit}>kg/m²</Text>
            </View>
            <Badge label={metrics.category.label} tone="primary" />
          </View>

          {/* Spektrum kategori */}
          <View style={styles.spectrumWrap}>
            <View style={styles.spectrumBar}>
              {SPECTRUM.map((seg, i) => (
                <View
                  key={seg.label}
                  style={[
                    styles.spectrumSeg,
                    { backgroundColor: seg.color },
                    i === 0 && styles.spectrumSegLeft,
                    i === SPECTRUM.length - 1 && styles.spectrumSegRight,
                    metrics.category.label.toLowerCase().startsWith(seg.label.toLowerCase().slice(0, 4)) ||
                    (seg.label === 'Gemuk' && metrics.category.label === 'Gemuk')
                      ? null
                      : { opacity: 0.35 },
                  ]}
                />
              ))}
              <View style={[styles.marker, { left: `${markerPos * 100}%` }]} />
            </View>
            <View style={styles.spectrumLabels}>
              {SPECTRUM.map((seg) => (
                <View key={seg.label} style={styles.spectrumLabelCell}>
                  <Text style={styles.spectrumLabel}>{seg.label}</Text>
                  <Text style={styles.spectrumRange}>{seg.range}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Rentang berat ideal */}
          <View style={styles.idealBox}>
            <Text style={styles.idealTitle}>Rentang Berat Badan Ideal</Text>
            <Text style={styles.idealBody}>{weightIdealText()}</Text>
          </View>

          {/* BMR + Risiko */}
          <View style={styles.duoRow}>
            <View style={styles.duoCard}>
              <Text style={styles.duoLabel}>ESTIMASI BMR</Text>
              <Text style={styles.duoValue}>~{metrics.bmr.toLocaleString('id-ID')}</Text>
              <Text style={styles.duoUnit}>kkal / hari</Text>
            </View>
            <View style={styles.duoCard}>
              <Text style={styles.duoLabel}>KATEGORI RISIKO</Text>
              <Text
                style={[
                  styles.duoValue,
                  {
                    color:
                      riskLabel(metrics.category.type) === 'Tinggi'
                        ? colors.error
                        : riskLabel(metrics.category.type) === 'Sedang'
                          ? colors.warning
                          : colors.primary,
                  },
                ]}
              >
                {riskLabel(metrics.category.type)}
              </Text>
            </View>
          </View>
        </View>

        {/* Analisis tambahan (fitur lama yang dipertahankan) */}
        <View style={styles.card}>
          <Text style={styles.resultEyebrow}>ANALISIS TAMBAHAN</Text>
          <View style={styles.chipsWrap}>
            <View style={styles.infoChip}>
              <HeartPulse size={13} color={colors.primary} />
              <Text style={styles.infoChipText}>
                Lemak {metrics.bodyFatPercentage}% · {metrics.bodyFatCategory.label}
              </Text>
            </View>
            <View style={styles.infoChip}>
              <Droplets size={13} color={colors.primary} />
              <Text style={styles.infoChipText}>Hidrasi {metrics.waterIntakeLiters}L/hari</Text>
            </View>
            <View style={styles.infoChip}>
              <Calculator size={13} color={colors.primary} />
              <Text style={styles.infoChipText}>TDEE {metrics.tdee.toLocaleString('id-ID')} kkal</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.zonesBtn}
            onPress={() => setZonesOpen(true)}
            activeOpacity={0.85}
          >
            <HeartPulse size={15} color={colors.primary} />
            <Text style={styles.zonesBtnText}>Zona Denyut Jantung Latihan</Text>
            <Badge label={`Max ${metrics.maxHeartRate} bpm`} tone="gray" />
          </TouchableOpacity>
        </View>

        {/* Simpan */}
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={calculator.save}>
          <Bookmark size={16} color={colors.onPrimary} />
          <Text style={styles.saveBtnText}>Simpan ke Riwayat</Text>
        </TouchableOpacity>

        <AppText variant="labelSm" muted style={styles.savedNote}>
          Data berhasil disimpan ke riwayat setelah diketuk
        </AppText>
      </ScrollView>

      <HeartRateZonesModal
        isOpen={zonesOpen}
        onClose={() => setZonesOpen(false)}
        age={calculator.age}
        gender={internalGender}
        maxHeartRate={metrics.maxHeartRate}
        zones={metrics.heartRateZones}
        formulaName={metrics.genderPhysiology.hrFormulaName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 12, paddingBottom: 28 },
  whoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,105,72,0.08)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  whoChipText: { fontSize: 11, fontFamily: fonts.bold, color: colors.primary },
  card: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    boxShadow: '0px 1px 8px rgba(11,28,48,0.06)',
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  fieldLabel: { fontSize: 11, fontFamily: fonts.bold, color: colors.onSurfaceVariant, letterSpacing: 0.5 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: { fontSize: 17, fontFamily: fonts.extraBold, color: colors.onSurface, marginTop: 2 },
  valueGreen: { fontSize: 20, fontFamily: fonts.extraBold, color: colors.primaryEmphasis },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider: { width: '100%', height: 34 },
  ruler: { flexDirection: 'row', justifyContent: 'space-between' },
  rulerText: { fontSize: 11, fontFamily: fonts.bold, color: colors.onSurfaceVariant },
  resultEyebrow: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  resultValue: { fontSize: 40, fontFamily: fonts.extraBold, color: colors.onSurface, letterSpacing: -1 },
  resultUnit: { fontSize: 13, fontFamily: fonts.bold, color: colors.onSurfaceVariant },
  spectrumWrap: { gap: 6, marginTop: 4 },
  spectrumBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 999,
    overflow: 'visible',
    position: 'relative',
  },
  spectrumSeg: { flex: 1, height: '100%' },
  spectrumSegLeft: { borderTopLeftRadius: 999, borderBottomLeftRadius: 999 },
  spectrumSegRight: { borderTopRightRadius: 999, borderBottomRightRadius: 999 },
  marker: {
    position: 'absolute',
    top: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 4,
    borderColor: colors.onSurface,
    marginLeft: -9,
    boxShadow: '0px 1px 4px rgba(0,0,0,0.2)',
  },
  spectrumLabels: { flexDirection: 'row' },
  spectrumLabelCell: { flex: 1, alignItems: 'center', gap: 1 },
  spectrumLabel: { fontSize: 11, fontFamily: fonts.bold, color: colors.onSurface },
  spectrumRange: { fontSize: 10, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  idealBox: {
    backgroundColor: 'rgba(0,105,72,0.06)',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  idealTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.primary },
  idealBody: { fontSize: 13, fontFamily: fonts.regular, color: colors.onSurfaceVariant, lineHeight: 19 },
  duoRow: { flexDirection: 'row', gap: 10 },
  duoCard: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
    borderRadius: 10,
    padding: 12,
    gap: 3,
  },
  duoLabel: { fontSize: 10, fontFamily: fonts.bold, color: colors.onSurfaceVariant, letterSpacing: 0.5 },
  duoValue: { fontSize: 18, fontFamily: fonts.extraBold, color: colors.onSurface },
  duoUnit: { fontSize: 11, fontFamily: fonts.regular, color: colors.onSurfaceVariant },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceLow,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  infoChipText: { fontSize: 11, fontFamily: fonts.bold, color: colors.onSurfaceVariant },
  zonesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,105,72,0.06)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,105,72,0.2)',
  },
  zonesBtnText: { flex: 1, fontSize: 13, fontFamily: fonts.bold, color: colors.primary },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
  },
  saveBtnText: { fontSize: 15, fontFamily: fonts.bold, color: colors.onPrimary },
  savedNote: { textAlign: 'center' },
});
