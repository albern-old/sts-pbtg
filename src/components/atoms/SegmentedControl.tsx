import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';
import { fonts } from '../../theme/typography';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  // 'pill' = aktif putih dengan bayangan (filter/gender tab)
  // 'emph' = aktif hijau penuh teks putih (jenis kelamin)
  variant?: 'pill' | 'emph';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'pill',
}: Props<T>) {
  const emph = variant === 'emph';
  return (
    <View style={[styles.track, emph && styles.trackEmph]}>
      {options.map((opt) => {
        const active = opt.value === value;
        const activeStyle = emph ? styles.itemEmph : styles.itemActive;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.item, active && activeStyle]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.label,
                active && (emph ? styles.labelEmph : styles.labelActive),
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.xl,
    padding: 4,
    gap: 4,
  },
  trackEmph: { backgroundColor: colors.surfaceLow },
  item: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 11,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  itemActive: {
    backgroundColor: colors.surfaceLowest,
    boxShadow: '0px 1px 6px rgba(11,28,48,0.1)',
  },
  itemEmph: { backgroundColor: colors.primary },
  label: { fontSize: 13, fontFamily: fonts.medium, color: colors.onSurfaceVariant },
  labelActive: { fontFamily: fonts.bold, color: colors.onSurface },
  labelEmph: { fontFamily: fonts.bold, color: colors.onPrimary },
});
