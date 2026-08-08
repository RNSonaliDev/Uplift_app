import {Dimensions, PixelRatio, Platform} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Base design dimensions (iPhone 14 / standard design)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Width percentage - converts design percentage to actual pixels
 */
export const wp = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100);
};

/**
 * Height percentage - converts design percentage to actual pixels
 */
export const hp = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100);
};

/**
 * Horizontal scale - scales a design value based on screen width
 */
export const horizontalScale = (size: number): number => {
  return PixelRatio.roundToNearestPixel((size / BASE_WIDTH) * SCREEN_WIDTH);
};

/**
 * Vertical scale - scales a design value based on screen height
 */
export const verticalScale = (size: number): number => {
  return PixelRatio.roundToNearestPixel((size / BASE_HEIGHT) * SCREEN_HEIGHT);
};

/**
 * Moderate scale - applies a moderate scaling factor
 * Good for font sizes that shouldn't scale as aggressively
 * @param size - design size
 * @param factor - scaling factor (0 = no scaling, 1 = full scaling). Default 0.5
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return PixelRatio.roundToNearestPixel(
    size + (horizontalScale(size) - size) * factor,
  );
};

/**
 * Moderate vertical scale
 */
export const moderateVerticalScale = (
  size: number,
  factor: number = 0.5,
): number => {
  return PixelRatio.roundToNearestPixel(
    size + (verticalScale(size) - size) * factor,
  );
};

/**
 * Font scale - uses moderate scale for fonts (less aggressive)
 */
export const fontScale = (size: number): number => {
  return moderateScale(size, 0.4);
};

/**
 * Check if device is a small screen (SE, older devices)
 */
export const isSmallDevice = SCREEN_WIDTH < 375;

/**
 * Check if device is a large screen (tablets, plus-size phones)
 */
export const isLargeDevice = SCREEN_WIDTH >= 414;

/**
 * Check if device is a tablet
 */
export const isTablet = SCREEN_WIDTH >= 768;

/**
 * Screen dimensions
 */
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

/**
 * Platform helpers
 */
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
