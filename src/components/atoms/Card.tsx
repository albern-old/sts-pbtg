import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

interface Props extends ViewProps {
  tone?: 'default' | 'low';
}

// Kartu putih dengan radius 12 & shadow halus (shadow-sm) sesuai design.
export const Card: React.FC<Props> = ({ style, tone = 'default', children, ...rest }) => (
  <View style={[styles.card, tone === 'low' && styles.cardLow, style as ViewStyle]} {...rest}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.xl,
    padding: spacing.md,
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLow: {
    backgroundColor: colors.surfaceLow,
    shadowOpacity: 0,
    elevation: 0,
  },
});
