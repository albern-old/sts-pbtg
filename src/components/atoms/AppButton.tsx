import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';
import { fonts } from '../../theme/typography';

type Variant = 'primary' | 'soft' | 'ghost' | 'danger';

interface Props extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  icon?: React.ReactNode;
}

const stylesByVariant: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary },
  soft: { bg: colors.surfaceLow, fg: colors.onSurfaceVariant, border: colors.outlineVariant },
  ghost: { bg: 'transparent', fg: colors.onSurfaceVariant },
  danger: { bg: colors.danger, fg: '#FFFFFF' },
};

export const AppButton: React.FC<Props> = ({
  label,
  variant = 'primary',
  icon,
  style,
  disabled,
  ...rest
}) => {
  const v = stylesByVariant[variant];
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: v.bg },
        v.border ? { borderWidth: 1, borderColor: v.border } : null,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      activeOpacity={0.85}
      {...rest}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.label, { color: v.fg }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: radius.xl,
  },
  label: { fontSize: 14, fontFamily: fonts.bold },
  icon: { alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
});
