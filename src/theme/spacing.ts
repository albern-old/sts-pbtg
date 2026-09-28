// Radius & spasi dari tailwind.config design system Stitch.
// borderRadius: xl = 0.75rem (12dp), lg = 0.5rem (8dp), full = pill
// spacing: margin = 1.25rem (20dp), space-xs 4dp … space-xl 32dp
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  screen: 20, // margin (gutter layar)
} as const;

export const radius = {
  sm: 4,
  lg: 8,
  xl: 12,
  pill: 999,
} as const;
