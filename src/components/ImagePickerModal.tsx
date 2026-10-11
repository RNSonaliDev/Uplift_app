import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

import { AppText } from './AppText';
import { Colors } from '../theme/colors';
import { BorderRadius } from '../theme/spacing';
import { Shadows } from '../theme/common';
import { horizontalScale, moderateScale, verticalScale } from '../utils/responsive';

export interface SelectedImage {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
}

export interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (image: SelectedImage) => void;
  title?: string;
  subtitle?: string;
  cameraType?: 'back' | 'front';
}

const CameraIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="13"
      r="4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GalleryIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
    <Path
      d="M21 15L16 10L5 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRightIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = Colors.neutral[400],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = Colors.neutral[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  title = 'Government ID Photo',
  subtitle = 'Choose how you would like to upload your document',
  cameraType = 'back',
}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      opacityAnim.setValue(0);
    }
  }, [visible, slideAnim, opacityAnim]);

  const requestAndroidCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'Uplift requires access to your camera to take a photo of your Government ID.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Camera permission request error:', err);
      return false;
    }
  };

  const handleTakePhoto = async () => {
    try {
      const hasPermission = await requestAndroidCameraPermission();
      if (!hasPermission) {
        Toast.show({
          type: 'error',
          text1: 'Camera Permission Required',
          text2: 'Please allow camera access in settings to take a photo.',
        });
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
        cameraType,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Toast.show({
          type: 'error',
          text1: 'Camera Error',
          text2: result.errorMessage || 'Unable to open camera.',
        });
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset: Asset = result.assets[0];
        if (asset.uri) {
          onImageSelected({
            uri: asset.uri,
            fileName: asset.fileName || 'government_id.jpg',
            type: asset.type || 'image/jpeg',
            fileSize: asset.fileSize,
          });
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Error launching camera:', error);
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: error?.message || 'Something went wrong while opening the camera.',
      });
    }
  };

  const handleChooseGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Toast.show({
          type: 'error',
          text1: 'Gallery Error',
          text2: result.errorMessage || 'Unable to open gallery.',
        });
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset: Asset = result.assets[0];
        if (asset.uri) {
          onImageSelected({
            uri: asset.uri,
            fileName: asset.fileName || 'government_id.jpg',
            type: asset.type || 'image/jpeg',
            fileSize: asset.fileSize,
          });
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Error launching image library:', error);
      Toast.show({
        type: 'error',
        text1: 'Gallery Error',
        text2: error?.message || 'Something went wrong while opening the gallery.',
      });
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top handle pill */}
          <View style={styles.handleContainer}>
            <View style={styles.handlePill} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <AppText variant="h4" color={Colors.neutral[900]} weight="bold">
                {title}
              </AppText>
              {subtitle ? (
                <AppText
                  variant="bodySmall"
                  color={Colors.neutral[500]}
                  style={styles.subtitle}
                >
                  {subtitle}
                </AppText>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <CloseIcon size={20} color={Colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {/* Take Photo / Camera Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleTakePhoto}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrapper, { backgroundColor: Colors.primary[50] }]}>
                <CameraIcon size={24} color={Colors.primary[500]} />
              </View>
              <View style={styles.optionContent}>
                <AppText variant="labelLarge" color={Colors.neutral[900]} weight="bold">
                  Take Photo
                </AppText>
                <AppText variant="bodySmall" color={Colors.neutral[500]}>
                  Use camera to photograph your ID
                </AppText>
              </View>
              <ChevronRightIcon size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>

            {/* Choose from Gallery Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleChooseGallery}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrapper, { backgroundColor: Colors.secondary[50] }]}>
                <GalleryIcon size={24} color={Colors.secondary[600]} />
              </View>
              <View style={styles.optionContent}>
                <AppText variant="labelLarge" color={Colors.neutral[900]} weight="bold">
                  Choose from Gallery
                </AppText>
                <AppText variant="bodySmall" color={Colors.neutral[500]}>
                  Select an existing photo from library
                </AppText>
              </View>
              <ChevronRightIcon size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <AppText variant="labelMedium" color={Colors.neutral[700]} weight="bold">
              Cancel
            </AppText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(Platform.OS === 'ios' ? 36 : 24),
    ...Shadows.xl,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  handlePill: {
    width: horizontalScale(38),
    height: verticalScale(4),
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[300],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: horizontalScale(12),
  },
  subtitle: {
    marginTop: verticalScale(4),
  },
  closeButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    marginTop: verticalScale(16),
    gap: verticalScale(12),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(16),
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  iconWrapper: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(14),
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  optionContent: {
    flex: 1,
  },
  cancelButton: {
    marginTop: verticalScale(16),
    backgroundColor: Colors.neutral[100],
    paddingVertical: verticalScale(14),
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ImagePickerModal;
