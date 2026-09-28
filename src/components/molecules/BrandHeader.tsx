import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppText } from '../atoms/AppText';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

// Header global tiap layar: wordmark "Langkah" + titik hijau + aksi kanan.
export const BrandHeader: React.FC<{ right?: React.ReactNode }> = ({ right }) => (
  <View style={styles.row}>
    <AppText style={styles.brand}>
      Langkah<Text style={styles.dot}>.</Text>
    </AppText>
    {right ? <View style={styles.right}>{right}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    minHeight: 44,
  },
  brand: { fontSize: 24, fontFamily: fonts.extraBold, color: colors.onSurface },
  dot: { color: colors.primaryEmphasis },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
