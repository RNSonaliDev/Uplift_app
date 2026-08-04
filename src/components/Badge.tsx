import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {AppText} from './AppText';
import {Colors} from '../theme/colors';
import {Spacing, BorderRadius} from '../theme/spacing';

type BadgeVariant = 'solid' | 'subtle' | 'outline';
type BadgeSize = 'sm' | 'md';
type BadgeColor = 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'neutral';

interface BadgeProps {
  /** Badge label */
  label: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Color theme */
  color?: BadgeColor;
  /** Left icon */
  icon?: React.ReactNode;
}

const badgeColorMap = {
  primary: {
    solid: {bg: Colors.primary[500], text: Colors.neutral[0]},
    subtle: {bg: Colors.primary[50], text: Colors.primary[700]},
    outline: {bg: 'transparent', text: Colors.primary[500], border: Colors.primary[500]},
  },
  secondary: {
    solid: {bg: Colors.secondary[500], text: Colors.neutral[0]},
    subtle: {bg: Colors.secondary[50], text: Colors.secondary[700]},
    outline: {bg: 'transparent', text: Colors.secondary[500], border: Colors.secondary[500]},
  },
  accent: {
    solid: {bg: Colors.accent[500], text: Colors.neutral[0]},
    subtle: {bg: Colors.accent[50], text: Colors.accent[700]},
    outline: {bg: 'transparent', text: Colors.accent[600], border: Colors.accent[500]},
  },
  success: {
    solid: {bg: Colors.success, text: Colors.neutral[0]},
    subtle: {bg: Colors.secondary[50], text: Colors.secondary[700]},
    outline: {bg: 'transparent', text: Colors.success, border: Colors.success},
  },
  error: {
    solid: {bg: Colors.error, text: Colors.neutral[0]},
    subtle: {bg: '#FEF2F2', text: '#DC2626'},
    outline: {bg: 'transparent', text: Colors.error, border: Colors.error},
  },
  warning: {
    solid: {bg: Colors.warning, text: Colors.neutral[0]},
    subtle: {bg: Colors.accent[50], text: Colors.accent[700]},
    outline: {bg: 'transparent', text: Colors.warning, border: Colors.warning},
  },
  neutral: {
    solid: {bg: Colors.neutral[700], text: Colors.neutral[0]},
    subtle: {bg: Colors.neutral[100], text: Colors.neutral[700]},
    outline: {bg: 'transparent', text: Colors.neutral[600], border: Colors.neutral[300]},
  },
};

const sizeMap = {
  sm: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    typography: 'caption' as const,
  },
  md: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    typography: 'labelSmall' as const,
  },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'solid',
  size = 'sm',
  color = 'primary',
  icon,
}) => {
  const colorConfig = badgeColorMap[color][variant];
  const sizeConfig = sizeMap[size];

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colorConfig.bg,
    paddingVertical: sizeConfig.paddingVertical,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: BorderRadius.full,
    ...(variant === 'outline' && {
      borderWidth: 1,
      borderColor: (colorConfig as any).border,
    }),
  };

  return (
    <View style={containerStyle}>
      {icon && <View style={{marginRight: Spacing.xs}}>{icon}</View>}
      <AppText variant={sizeConfig.typography} color={colorConfig.text}>
        {label}
      </AppText>
    </View>
  );
};
