import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts, fontSize } from '../../theme/typography';

type Variant =
  | 'headlineLg'
  | 'headlineMd'
  | 'headlineSm'
  | 'labelMd'
  | 'labelSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'bodySm';

interface Props extends TextProps {
  variant?: Variant;
  accent?: boolean;
  muted?: boolean;
  children: React.ReactNode;
}

const spec: Record<Variant, { size: number; weight: keyof typeof fonts; color: string }> = {
  headlineLg: { size: fontSize.headlineLgMobile, weight: 'bold', color: colors.onSurface },
  headlineMd: { size: fontSize.headlineMd, weight: 'medium', color: colors.onSurface },
  headlineSm: { size: fontSize.headlineSm, weight: 'medium', color: colors.onSurface },
  labelMd: { size: fontSize.labelMd, weight: 'medium', color: colors.onSurfaceVariant },
  labelSm: { size: fontSize.labelSm, weight: 'bold', color: colors.onSurfaceVariant },
  bodyLg: { size: fontSize.bodyLg, weight: 'regular', color: colors.onSurface },
  bodyMd: { size: fontSize.bodyMd, weight: 'regular', color: colors.onSurfaceVariant },
  bodySm: { size: fontSize.bodySm, weight: 'regular', color: colors.onSurfaceVariant },
};

export const AppText: React.FC<Props> = ({
  variant = 'bodyMd',
  accent,
  muted,
  style,
  children,
  ...rest
}) => {
  const s = spec[variant];
  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: s.size,
          fontFamily: fonts[s.weight],
          color: accent
            ? colors.primaryEmphasis
            : muted
              ? colors.outline
              : s.color,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: { letterSpacing: -0.1 },
});
