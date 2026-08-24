import {TextStyle} from 'react-native';
import {fontScale, verticalScale} from '../utils/responsive';

/**
 * Typography system using Poppins font family
 */

export const FontFamily = {
  thin: 'Poppins-Thin',
  thinItalic: 'Poppins-ThinItalic',
  extraLight: 'Poppins-ExtraLight',
  extraLightItalic: 'Poppins-ExtraLightItalic',
  light: 'Poppins-Light',
  lightItalic: 'Poppins-LightItalic',
  regular: 'Poppins-Regular',
  italic: 'Poppins-Italic',
  medium: 'Poppins-Medium',
  mediumItalic: 'Poppins-MediumItalic',
  semiBold: 'Poppins-SemiBold',
  semiBoldItalic: 'Poppins-SemiBoldItalic',
  bold: 'Poppins-Bold',
  boldItalic: 'Poppins-BoldItalic',
  extraBold: 'Poppins-ExtraBold',
  extraBoldItalic: 'Poppins-ExtraBoldItalic',
  black: 'Poppins-Black',
  blackItalic: 'Poppins-BlackItalic',
} as const;

export const FontSize = {
  xs: fontScale(10),
  sm: fontScale(12),
  md: fontScale(14),
  lg: fontScale(16),
  xl: fontScale(18),
  '2xl': fontScale(20),
  '3xl': fontScale(24),
  '4xl': fontScale(28),
  '5xl': fontScale(32),
  '6xl': fontScale(36),
  '7xl': fontScale(48),
} as const;

export const LineHeight = {
  xs: verticalScale(14),
  sm: verticalScale(16),
  md: verticalScale(20),
  lg: verticalScale(24),
  xl: verticalScale(28),
  '2xl': verticalScale(28),
  '3xl': verticalScale(32),
  '4xl': verticalScale(36),
  '5xl': verticalScale(40),
  '6xl': verticalScale(44),
  '7xl': verticalScale(56),
} as const;

export const Typography: Record<string, TextStyle> = {
  // Display
  displayLarge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['7xl'],
    lineHeight: LineHeight['7xl'],
  },
  displayMedium: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['6xl'],
    lineHeight: LineHeight['6xl'],
  },
  displaySmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize['5xl'],
    lineHeight: LineHeight['5xl'],
  },

  // Headings
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['5xl'],
    lineHeight: LineHeight['5xl'],
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['4xl'],
    lineHeight: LineHeight['4xl'],
  },
  h3: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize['3xl'],
    lineHeight: LineHeight['3xl'],
  },
  h4: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
  },
  h5: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
  },

  // Body
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
  },
  bodyMedium: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
  },

  // Labels
  labelLarge: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
  },
  labelMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
  },
  labelSmall: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
  },

  // Caption
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
  },

  // Button
  buttonLarge: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
  },
  buttonMedium: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
  },
  buttonSmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
  },
} as const;
