import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import {AppText} from './AppText';
import {Colors} from '../theme/colors';
import {Typography} from '../theme/typography';
import {Spacing, BorderRadius} from '../theme/spacing';
import {Shadows} from '../theme/common';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonColor = 'primary' | 'secondary' | 'accent' | 'neutral';

interface ButtonProps extends TouchableOpacityProps {
  /** Button label */
  title: string;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Color theme */
  color?: ButtonColor;
  /** Loading state */
  loading?: boolean;
  /** Left icon render */
  leftIcon?: React.ReactNode;
  /** Right icon render */
  rightIcon?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
}

const colorMap = {
  primary: {
    bg: Colors.primary[500],
    bgPressed: Colors.primary[600],
    text: Colors.neutral[0],
    border: Colors.primary[500],
    outlineText: Colors.primary[500],
    ghostText: Colors.primary[500],
  },
  secondary: {
    bg: Colors.secondary[500],
    bgPressed: Colors.secondary[600],
    text: Colors.neutral[0],
    border: Colors.secondary[500],
    outlineText: Colors.secondary[500],
    ghostText: Colors.secondary[500],
  },
  accent: {
    bg: Colors.accent[500],
    bgPressed: Colors.accent[600],
    text: Colors.neutral[0],
    border: Colors.accent[500],
    outlineText: Colors.accent[700],
    ghostText: Colors.accent[600],
  },
  neutral: {
    bg: Colors.neutral[800],
    bgPressed: Colors.neutral[900],
    text: Colors.neutral[0],
    border: Colors.neutral[300],
    outlineText: Colors.neutral[800],
    ghostText: Colors.neutral[700],
  },
};

const sizeMap = {
  sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    typography: 'buttonSmall' as const,
    iconSpacing: Spacing.xs,
    minHeight: 36,
  },
  md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    typography: 'buttonMedium' as const,
    iconSpacing: Spacing.sm,
    minHeight: 44,
  },
  lg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
    typography: 'buttonLarge' as const,
    iconSpacing: Spacing.sm,
    minHeight: 52,
  },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'solid',
  size = 'md',
  color = 'primary',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...rest
}) => {
  const colors = colorMap[color];
  const sizeConfig = sizeMap[size];

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      minHeight: sizeConfig.minHeight,
      paddingVertical: sizeConfig.paddingVertical,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      opacity: disabled ? 0.5 : 1,
    };

    if (fullWidth) {
      base.width = '100%';
    }

    switch (variant) {
      case 'solid':
        return {
          ...base,
          backgroundColor: colors.bg,
          ...Shadows.sm,
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
        };
      default:
        return base;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'solid':
        return colors.text;
      case 'outline':
        return colors.outlineText;
      case 'ghost':
        return colors.ghostText;
      default:
        return colors.text;
    }
  };

  const textColor = getTextColor();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {leftIcon && (
            <View style={{marginRight: sizeConfig.iconSpacing}}>
              {leftIcon}
            </View>
          )}
          <AppText variant={sizeConfig.typography} color={textColor}>
            {title}
          </AppText>
          {rightIcon && (
            <View style={{marginLeft: sizeConfig.iconSpacing}}>
              {rightIcon}
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
