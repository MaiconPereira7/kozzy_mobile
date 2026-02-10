// src/theme/index.ts

export * from './colors';
export * from './typography';
export * from './spacing';

import { COLORS } from './colors';
import { TYPOGRAPHY } from './typography';
import { SPACING, BORDER_RADIUS, SHADOWS } from './spacing';

export const theme = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
} as const;

export default theme;
