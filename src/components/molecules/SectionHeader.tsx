import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../atoms/AppText';
import { Badge } from '../atoms/Badge';

export const SectionHeader: React.FC<{
  eyebrow?: string;
  title: string;
  badge?: string;
  subtitle?: string;
  right?: React.ReactNode;
}> = ({ eyebrow, title, badge, subtitle, right }) => (
  <View style={styles.wrap}>
    <View style={styles.row}>
      <View style={styles.titleCol}>
        {eyebrow ? <AppText variant="labelSm" accent>{eyebrow}</AppText> : null}
        <AppText variant="headlineLg">{title}</AppText>
      </View>
      {right ?? (badge ? <Badge label={badge} /> : null)}
    </View>
    {subtitle ? (
      <AppText variant="bodyMd" muted>
        {subtitle}
      </AppText>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleCol: { flex: 1, gap: 2 },
});
