import React from 'react';
import {View, ViewProps, StyleSheet, ViewStyle} from 'react-native';
import {Colors} from '../theme/colors';
import {Spacing, BorderRadius} from '../theme/spacing';
import {Shadows} from '../theme/common';

type CardVariant = 'elevated' | 'outlined' | 'filled';
type ShadowLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends ViewProps {
  /** Card visual variant */
  variant?: CardVariant;
  /** Shadow depth (for elevated variant) */
  shadow?: ShadowLevel;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom border radius */
  borderRadius?: number;
  /** Custom padding */
  padding?: number;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  shadow = 'md',
  backgroundColor,
  borderRadius = BorderRadius.lg,
  padding = Spacing.lg,
  style,
  children,
  ...rest
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: backgroundColor || Colors.neutral[0],
          ...Shadows[shadow],
        };
      case 'outlined':
        return {
          backgroundColor: backgroundColor || Colors.neutral[0],
          borderWidth: 1,
          borderColor: Colors.neutral[200],
        };
      case 'filled':
        return {
          backgroundColor: backgroundColor || Colors.neutral[100],
        };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        {
          borderRadius,
          padding,
          overflow: 'hidden',
        },
        getVariantStyle(),
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
};
