import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Activity, Heart, X } from 'lucide-react-native';
import { Gender, HeartRateZone } from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface HeartRateZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  age: number;
  maxHeartRate: number;
  zones: HeartRateZone[];
  gender?: Gender;
  formulaName?: string;
}

export const HeartRateZonesModal: React.FC<HeartRateZonesModalProps> = ({
  isOpen,
  onClose,
  age,
  maxHeartRate,
  zones,
  gender = 'male',
  formulaName,
}) => (
  <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Heart size={17} color={colors.error} fill={colors.error} />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.title}>Zona Detak Jantung</Text>
            <Text style={styles.subtitle}>
              {age} thn · {gender === 'male' ? 'Pria' : 'Wanita'} · Maksimum {maxHeartRate} bpm
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Tutup zona detak jantung"
            style={styles.closeBtn}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <X size={16} color={colors.ink500} />
          </TouchableOpacity>
        </View>

        {/* Formula — caption tenang, tanpa banner berwarna */}
        <View style={styles.formulaBox}>
          <Activity size={12} color={colors.outline} />
          <Text style={styles.formulaText} numberOfLines={2}>
            {formulaName ||
              (gender === 'female'
                ? 'Formula Gulati · 206 − 0.88 × usia'
                : 'Formula Tanaka · 208 − 0.7 × usia')}
          </Text>
        </View>

        {/* Daftar zona */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {zones.map((zone, i) => (
            <View
              key={zone.zone}
              style={[styles.zoneRow, i === zones.length - 1 && styles.zoneRowLast]}
            >
              <View style={[styles.zoneBar, { backgroundColor: zone.color }]} />
              <View style={styles.zoneBody}>
                <View style={styles.zoneHead}>
                  <View style={[styles.zoneTag, { backgroundColor: `${zone.color}1A` }]}>
                    <Text style={[styles.zoneTagText, { color: zone.color }]}>Z{zone.zone}</Text>
                  </View>
                  <Text style={styles.zoneName} numberOfLines={1}>
                    {zone.name}
                  </Text>
                  <Text style={styles.zoneBpm} numberOfLines={1}>
                    {zone.bpmRange}
                  </Text>
                </View>
                <Text style={styles.zoneMeta}>
                  {zone.intensity} · {zone.rangePercentage}
                </Text>
                <Text style={styles.zoneDesc}>{zone.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.doneBtn} activeOpacity={0.8} onPress={onClose}>
          <Text style={styles.doneBtnText}>Tutup</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,28,48,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    height: '86%',
    maxHeight: 600,
    backgroundColor: colors.surfaceLowest,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 10,
    boxShadow: '0px 12px 40px rgba(11,28,48,0.25)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(186,26,26,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontFamily: fonts.extraBold, color: colors.onSurface },
  subtitle: { fontSize: 12, fontFamily: fonts.regular, color: colors.ink500 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formulaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceLow,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  formulaText: {
    flex: 1,
    fontSize: 10.5,
    fontFamily: fonts.medium,
    color: colors.ink500,
    lineHeight: 14,
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 4 },
  zoneRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(188,202,192,0.4)',
  },
  zoneRowLast: { borderBottomWidth: 0 },
  zoneBar: { width: 4, borderRadius: 2 },
  zoneBody: { flex: 1, gap: 3 },
  zoneHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  zoneTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7 },
  zoneTagText: { fontSize: 10, fontFamily: fonts.extraBold },
  zoneName: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.onSurface,
  },
  zoneBpm: { fontSize: 12, fontFamily: fonts.extraBold, color: colors.onSurface },
  zoneMeta: { fontSize: 11, fontFamily: fonts.medium, color: colors.ink400 },
  zoneDesc: {
    fontSize: 11.5,
    fontFamily: fonts.regular,
    color: colors.ink500,
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  doneBtnText: { fontSize: 14, fontFamily: fonts.bold, color: colors.onPrimary },
});
