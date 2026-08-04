import {ViewStyle} from 'react-native';
import {Colors} from './colors';
import {BorderRadius, Spacing} from './spacing';

/**
 * Shared shadow/elevation styles
 */

export const Shadows: Record<string, ViewStyle> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  // Colored shadows
  primary: {
    shadowColor: Colors.primary[500],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondary: {
    shadowColor: Colors.secondary[500],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  accent: {
    shadowColor: Colors.accent[500],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

/**
 * Common container styles
 */
export const CommonStyles: Record<string, ViewStyle> = {
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenPadding: {
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
} as const;
