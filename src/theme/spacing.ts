/**
 * Spacing & Layout constants
 * Based on an 4px grid system
 */
import {horizontalScale, moderateScale} from '../utils/responsive';

export const Spacing = {
  none: 0,
  '2xs': horizontalScale(2),
  xs: horizontalScale(4),
  sm: horizontalScale(8),
  md: horizontalScale(12),
  lg: horizontalScale(16),
  xl: horizontalScale(20),
  '2xl': horizontalScale(24),
  '3xl': horizontalScale(32),
  '4xl': horizontalScale(40),
  '5xl': horizontalScale(48),
  '6xl': horizontalScale(64),
  '7xl': horizontalScale(80),
} as const;

export const BorderRadius = {
  none: 0,
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  '2xl': moderateScale(24),
  '3xl': moderateScale(32),
  full: 9999,
} as const;

export const IconSize = {
  xs: moderateScale(16),
  sm: moderateScale(20),
  md: moderateScale(24),
  lg: moderateScale(28),
  xl: moderateScale(32),
  '2xl': moderateScale(40),
  '3xl': moderateScale(48),
} as const;

export const HitSlop = {
  small: {top: 8, bottom: 8, left: 8, right: 8},
  medium: {top: 12, bottom: 12, left: 12, right: 12},
  large: {top: 16, bottom: 16, left: 16, right: 16},
} as const;
