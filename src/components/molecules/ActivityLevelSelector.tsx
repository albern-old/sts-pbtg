import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityLevel } from '../../types';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

export interface ActivityOption {
  id: ActivityLevel;
  label: string;
  multiplier: string;
  description: string;
}

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  { id: 'sedentary', label: 'Santai', multiplier: '×1.20', description: 'Duduk dominan, tanpa olahraga rutin.' },
  { id: 'light', label: 'Ringan', multiplier: '×1.37', description: 'Jalan santai / olahraga 1–3 hari/minggu.' },
  { id: 'moderate', label: 'Sedang', multiplier: '×1.55', description: 'Jogging / gym 3–5 hari/minggu.' },
  { id: 'active', label: 'Aktif', multiplier: '×1.72', description: 'Latihan berat 6–7 hari/minggu.' },
  { id: 'athlete', label: 'Atlet', multiplier: '×1.90', description: 'Latihan kompetitif 2× sehari.' },
];

// Chip baris ringkas (varian design system) untuk pilih tingkat aktivitas.
export const ActivityLevelSelector: React.FC<{
  value: ActivityLevel;
  onChange: (v: ActivityLevel) => void;
}> = ({ value, onChange }) => {
  const selected = ACTIVITY_OPTIONS.find((o) => o.id === value);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>AKTIVITAS HARIAN • TDEE</Text>
      <View style={styles.chips}>
        {ACTIVITY_OPTIONS.map((opt) => {
          const active = opt.id === value;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(opt.id)}
              activeOpacity={0.85}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selected ? (
        <Text style={styles.detail}>
          {selected.description} Pengali {selected.multiplier} berlaku untuk TDEE & hidrasi.
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontSize: 11, fontFamily: fonts.bold, color: colors.onSurfaceVariant, letterSpacing: 0.4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontFamily: fonts.medium, color: colors.onSurfaceVariant },
  chipTextActive: { color: colors.onPrimary, fontFamily: fonts.bold },
  detail: { fontSize: 12, fontFamily: fonts.regular, color: colors.onSurfaceVariant, lineHeight: 17 },
});
