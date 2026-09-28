import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

type Tone = 'primary' | 'gray' | 'green' | 'amber' | 'error';

export const Badge: React.FC<{ label: string; tone?: Tone }> = ({ label, tone = 'primary' }) => {
  const bg =
    tone === 'primary'
      ? 'rgba(0, 105, 72, 0.10)'
      : tone === 'green'
        ? colors.secondaryContainer
        : tone === 'amber'
          ? colors.warningSoft
          : tone === 'error'
            ? colors.dangerSoft
            : colors.surfaceLow;
  const fg =
    tone === 'primary'
      ? colors.primary
      : tone === 'green'
        ? colors.onSurface
        : tone === 'amber'
          ? colors.warning
          : tone === 'error'
            ? colors.onDangerContainer
            : colors.onSurfaceVariant;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  text: { fontSize: 11, fontFamily: fonts.bold, letterSpacing: 0.4 },
});
