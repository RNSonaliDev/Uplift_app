import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';
import {Spacing} from '../theme/spacing';

interface DividerProps {
  /** Divider color */
  color?: string;
  /** Vertical margin */
  spacing?: number;
  /** Thickness */
  thickness?: number;
}

export const Divider: React.FC<DividerProps> = ({
  color = Colors.neutral[200],
  spacing = Spacing.lg,
  thickness = 1,
}) => {
  return (
    <View
      style={{
        height: thickness,
        backgroundColor: color,
        marginVertical: spacing,
      }}
    />
  );
};
