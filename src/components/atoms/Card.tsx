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
    boxShadow: '0px 1px 8px rgba(11,28,48,0.06)',
  },
  cardLow: {
    backgroundColor: colors.surfaceLow,
    boxShadow: '0px 0px 0px rgba(0,0,0,0)',
  },
});
