// src/theme/typography.ts

export const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
    xxxl: 24,
    heading: 28,
    title: 32,
  },
  
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
  
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 1,
  },
} as const;

export type TypographySizes = keyof typeof TYPOGRAPHY.sizes;
export type TypographyWeights = keyof typeof TYPOGRAPHY.weights;
