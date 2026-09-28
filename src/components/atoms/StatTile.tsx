import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

interface Props {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

// Tile metrik putih (desain "Metrik Vitalitas" & statistik GPS).
export const StatTile: React.FC<Props> = ({ label, value, icon }) => (
  <View style={styles.tile}>
    <View style={styles.topRow}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={styles.value} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surfaceLowest,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
  value: { fontSize: 24, fontFamily: fonts.extraBold, color: colors.onSurface, letterSpacing: -0.5 },
});
