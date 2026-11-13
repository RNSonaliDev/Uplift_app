import { Platform } from 'react-native';

export interface AppUpdateConfig {
  /** Current installed version of the app */
  currentVersion: string;
  /** iOS App Store Track ID (numeric ID from App Store URL) */
  iosAppId: string;
  /** Bundle Identifier / Android Package Name */
  bundleId: string;
  /** iOS App Store web link */
  iosStoreUrl: string;
  /** iOS App Store native deep link */
  iosStoreDeepLink: string;
  /** Android Play Store web link */
  androidStoreUrl: string;
  /** Android Play Store native deep link */
  androidStoreDeepLink: string;
  /** Whether the update modal is mandatory (cannot be dismissed) */
  forceUpdate: boolean;
  /** Set to true to preview/test the update dialog in development */
  simulateUpdate?: boolean;
  /** Version to show when simulated */
  simulatedVersion?: string;
}

export const APP_UPDATE_CONFIG: AppUpdateConfig = {
  // Current installed app version
  currentVersion: '1.0.0',

  // iUpliftU App Store ID & Bundle ID
  iosAppId: '6742761821',
  bundleId: 'com.iupliftu',

  // Store URLs
  iosStoreUrl: 'https://apps.apple.com/us/app/iupliftu/id6742761821',
  iosStoreDeepLink: 'itms-apps://apps.apple.com/app/id6742761821',

  androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.iupliftu',
  androidStoreDeepLink: 'market://details?id=com.iupliftu',

  // Set to true to make update mandatory, or false to allow dismissal
  forceUpdate: false,

  // Set to true to test/preview the popup immediately
  simulateUpdate: false,
  simulatedVersion: '1.1.1',
};
