import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { AppText } from './AppText';
import { Button } from './Button';
import { Colors } from '../theme/colors';
import { BorderRadius } from '../theme/spacing';
import { horizontalScale, moderateScale, verticalScale } from '../utils/responsive';
import { Shadows } from '../theme/common';

export type PopupType = 'success' | 'error' | 'info';

export interface PopupProps {
  visible: boolean;
  type: PopupType;
  title: string;
  message: string;
  onClose: () => void;
}

const SuccessIcon: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="32" r="32" fill={Colors.success} opacity={0.1} />
    <Circle cx="32" cy="32" r="24" fill={Colors.success} />
    <Path
      d="M24 32L29.5 37.5L41 26"
      stroke={Colors.neutral[0]}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ErrorIcon: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="32" r="32" fill={Colors.error} opacity={0.1} />
    <Circle cx="32" cy="32" r="24" fill={Colors.error} />
    <Path
      d="M26 26L38 38M38 26L26 38"
      stroke={Colors.neutral[0]}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoIcon: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="32" r="32" fill={Colors.primary[500]} opacity={0.1} />
    <Circle cx="32" cy="32" r="24" fill={Colors.primary[500]} />
    <Path
      d="M32 22V24M32 30V42"
      stroke={Colors.neutral[0]}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const Popup: React.FC<PopupProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isInfo = type === 'info';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.popupContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            {isSuccess && <SuccessIcon />}
            {isError && <ErrorIcon />}
            {isInfo && <InfoIcon />}
          </View>

          <AppText
            variant="h3"
            color={Colors.neutral[900]}
            style={styles.title}
          >
            {title}
          </AppText>

          <AppText
            variant="bodyMedium"
            color={Colors.neutral[600]}
            style={styles.message}
          >
            {message}
          </AppText>

          <View style={styles.buttonContainer}>
            <Button
              title="OK"
              onPress={onClose}
              style={styles.button}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: horizontalScale(24),
  },
  popupContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: moderateScale(24),
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconContainer: {
    marginBottom: verticalScale(16),
  },
  title: {
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  message: {
    textAlign: 'center',
    marginBottom: verticalScale(24),
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
});
