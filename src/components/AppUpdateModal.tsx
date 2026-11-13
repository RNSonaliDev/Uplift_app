import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { AppText } from './AppText';
import { FontFamily } from '../theme/typography';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/responsive';
import { AppUpdateService } from '../services/AppUpdateService';

export interface AppUpdateModalProps {
  /** Controls modal visibility */
  visible: boolean;
  /** The newer version available in the store (e.g. "1.1.1") */
  latestVersion?: string;
  /** Name of the store ("App Store" or "Google Play Store") */
  storeName?: string;
  /** Custom store URL to open */
  storeUrl?: string;
  /** Whether the user can dismiss the modal */
  forceUpdate?: boolean;
  /** Callback when user dismisses the modal (if allowed) */
  onDismiss?: () => void;
  /** Callback when user taps "Update Now" */
  onUpdate?: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  visible,
  latestVersion = '1.1.1',
  storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play Store',
  storeUrl,
  forceUpdate = false,
  onDismiss,
  onUpdate,
}) => {
  const handleUpdatePress = () => {
    if (onUpdate) {
      onUpdate();
    } else {
      AppUpdateService.openStore(storeUrl);
    }
  };

  const handleBackdropPress = () => {
    if (!forceUpdate && onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress} disabled={forceUpdate}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogCard}>
              {/* Title */}
              <AppText variant="h5" weight="bold" color="#1C1C1E" style={styles.title}>
                Update Available
              </AppText>

              {/* Subtitle / Description */}
              <AppText variant="bodySmall" color="#636366" style={styles.description}>
                Version {latestVersion} is available on the {storeName}. Please update for the latest features.
              </AppText>

              {/* Update Now Button */}
              <TouchableOpacity
                style={styles.updateButton}
                activeOpacity={0.8}
                onPress={handleUpdatePress}
              >
                <AppText variant="bodyMedium" weight="semiBold" color="#000000" style={styles.updateButtonText}>
                  Update Now
                </AppText>
              </TouchableOpacity>

              {/* Optional "Later" link if not mandatory */}
              {!forceUpdate && onDismiss && (
                <TouchableOpacity
                  style={styles.laterButton}
                  activeOpacity={0.7}
                  onPress={onDismiss}
                >
                  <AppText variant="caption" color="#8E8E93" style={styles.laterButtonText}>
                    Later
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(32),
  },
  dialogCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#ECECED',
    borderRadius: moderateScale(22),
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(20),
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: fontScale(18),
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: fontScale(14),
    lineHeight: fontScale(20),
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  updateButton: {
    width: '100%',
    height: verticalScale(48),
    backgroundColor: '#C5C5C9',
    borderRadius: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(16),
  },
  laterButton: {
    marginTop: verticalScale(12),
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(12),
  },
  laterButtonText: {
    fontFamily: FontFamily.regular,
    fontSize: fontScale(13),
  },
});

