import React, {useState} from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import {AppText} from './AppText';
import {Colors} from '../theme/colors';
import {FontFamily, FontSize} from '../theme/typography';
import {Spacing, BorderRadius} from '../theme/spacing';

interface InputProps extends TextInputProps {
  /** Input label */
  label?: string;
  /** Is input required? Adds red asterisk. Defaults to true unless label contains "Optional" */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Right aligned content below input */
  bottomRight?: React.ReactNode;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Container style override */
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  bottomRight,
  error,
  helperText,
  leftIcon,
  rightIcon,
  required,
  disabled = false,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) {
      return Colors.error;
    }
    if (isFocused) {
      return Colors.primary[500];
    }
    return Colors.neutral[300];
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={{ marginBottom: Spacing.xs }}>
          <AppText
            variant="labelMedium"
            color={Colors.neutral[700]}>
            {label}
            {(required || (required === undefined && !label.toLowerCase().includes('optional'))) && (
              <AppText variant="labelMedium" color={Colors.error}>
                {' *'}
              </AppText>
            )}
          </AppText>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 1.5 : 1,
            backgroundColor: disabled
              ? Colors.neutral[100]
              : Colors.neutral[0],
          },
        ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? {paddingLeft: 0} : null,
            rightIcon ? {paddingRight: 0} : null,
            style,
          ]}
          placeholderTextColor={Colors.neutral[400]}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          {(error || helperText) && (
            <AppText
              variant="bodySmall"
              color={error ? Colors.error : Colors.neutral[500]}>
              {error || helperText}
            </AppText>
          )}
        </View>
        {bottomRight && (
          <View style={styles.footerRight}>
            {bottomRight}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.neutral[0],
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    letterSpacing: 0,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.xs,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    marginLeft: Spacing.sm,
  },
});
