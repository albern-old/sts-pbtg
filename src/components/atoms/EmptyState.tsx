import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

export const EmptyState: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <View style={styles.box}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    backgroundColor: colors.surfaceLowest,
  },
  title: { fontSize: 13, fontFamily: fonts.bold, color: colors.onSurface },
  sub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
  },
});
