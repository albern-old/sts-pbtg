// Token warna dari design system Stitch "FitTrack Mobile / Langkah."
export const colors = {
  // Brand
  primary: '#006948',
  primaryEmphasis: '#059669',
  accent: '#10b981',
  onPrimary: '#FFFFFF',
  primaryContainer: '#00855D',
  onPrimaryContainer: '#F5FFF7',
  secondary: '#006C46',
  secondaryContainer: '#43FCAE',

  // Background & surface (Material-3 container)
  background: '#F8F9FF',
  surface: '#F8F9FF',
  surfaceLowest: '#FFFFFF',
  surfaceLow: '#EFF4FF',
  surfaceContainer: '#E5EEFF',
  surfaceHigh: '#DCE9FF',
  surfaceHighest: '#D3E4FE',

  // Ink
  onSurface: '#0B1C30',
  onSurfaceVariant: '#3D4A42',
  ink900: '#0B1C30',
  ink700: '#3D4A42',
  ink500: '#545C72',
  ink400: '#6D7A72',

  // Outline
  outline: '#6D7A72',
  outlineVariant: '#BCCAC0',

  // Semantic
  success: '#059669',
  successSoft: '#ECFDF5',
  warning: '#D97706',
  warningSoft: '#FFFBEB',
  danger: '#BA1A1A',
  dangerSoft: '#FFDAD6',
  onDangerContainer: '#93000A',
  error: '#BA1A1A',

  // Legacy aliases (komponen lama)
  white: '#FFFFFF',
  dark900: '#0B1C30',
  dark800: '#0B1C30',
  dark700: '#213145',
} as const;

export type AppColors = typeof colors;
