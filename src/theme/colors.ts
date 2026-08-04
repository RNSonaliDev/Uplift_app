/**
 * UpliftApp Color Palette
 *
 * Primary: Purple (#6D5DF6)
 * Secondary: Green (#22C55E)
 * Accent: Orange (#F59E0B)
 */

export const Colors = {
  // Primary - Purple
  primary: {
    50: '#F3F1FE',
    100: '#E8E4FD',
    200: '#D1CAFB',
    300: '#B9AFF9',
    400: '#9389F7',
    500: '#6D5DF6', // Main
    600: '#5A48E5',
    700: '#4735C9',
    800: '#3727A3',
    900: '#2A1D7D',
  },

  // Secondary - Green
  secondary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#22C55E', // Main
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Accent - Orange
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Neutrals
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Semantic
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Background
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    dark: '#111827',
    darkSecondary: '#1F2937',
  },

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
} as const;

export type ColorToken = typeof Colors;
