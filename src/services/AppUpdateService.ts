import { Platform, Linking } from 'react-native';
import { APP_UPDATE_CONFIG, AppUpdateConfig } from '../config/appUpdateConfig';

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
  storeName: string;
  forceUpdate: boolean;
}

/**
 * Compare two semver-like version strings.
 * Returns true if latest > current.
 */
export const isVersionOlder = (current: string, latest: string): boolean => {
  if (!current || !latest) return false;

  const c = current
    .replace(/[^0-9.]/g, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  const l = latest
    .replace(/[^0-9.]/g, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);

  const len = Math.max(c.length, l.length);
  for (let i = 0; i < len; i++) {
    const curVal = c[i] || 0;
    const latVal = l[i] || 0;
    if (latVal > curVal) return true;
    if (latVal < curVal) return false;
  }
  return false;
};

/**
 * Fetch latest version from Apple App Store via iTunes Lookup API.
 */
async function fetchIosStoreVersion(
  config: AppUpdateConfig,
): Promise<{ version: string; storeUrl: string } | null> {
  try {
    // 1. Try lookup by track ID first
    let lookupUrl = `https://itunes.apple.com/lookup?id=${config.iosAppId}&t=${Date.now()}`;
    let res = await fetch(lookupUrl, { headers: { 'Cache-Control': 'no-cache' } });
    let data = await res.json();

    // 2. If no result, try lookup by bundle ID
    if (!data?.results || data.results.length === 0) {
      lookupUrl = `https://itunes.apple.com/lookup?bundleId=${config.bundleId}&t=${Date.now()}`;
      res = await fetch(lookupUrl, { headers: { 'Cache-Control': 'no-cache' } });
      data = await res.json();
    }

    if (data?.results && data.results.length > 0) {
      const item = data.results[0];
      return {
        version: item.version || '',
        storeUrl: item.trackViewUrl || config.iosStoreUrl,
      };
    }
  } catch (e) {
    console.warn('[AppUpdateService] Failed to check iOS App Store:', e);
  }
  return null;
}

/**
 * Fetch latest version from Google Play Store.
 */
async function fetchAndroidStoreVersion(
  config: AppUpdateConfig,
): Promise<{ version: string; storeUrl: string } | null> {
  try {
    const playUrl = `https://play.google.com/store/apps/details?id=${config.bundleId}&hl=en&gl=US`;
    const res = await fetch(playUrl, { headers: { 'Cache-Control': 'no-cache' } });

    if (res.ok) {
      const html = await res.text();
      // Google Play embeds version in script data e.g. [[["1.1.1"]]] or Current Version pattern
      const scriptMatch = html.match(/\[\[\["([0-9]+\.[0-9]+(?:\.[0-9]+)?)"\]\]/);
      if (scriptMatch && scriptMatch[1]) {
        return {
          version: scriptMatch[1],
          storeUrl: config.androidStoreUrl,
        };
      }

      const textMatch = html.match(/Current Version.*?([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);
      if (textMatch && textMatch[1]) {
        return {
          version: textMatch[1],
          storeUrl: config.androidStoreUrl,
        };
      }
    }
  } catch (e) {
    console.warn('[AppUpdateService] Failed to check Android Play Store:', e);
  }
  return null;
}

export const AppUpdateService = {
  /**
   * Check if a newer version is available on App Store or Google Play Store.
   */
  async checkForUpdate(customConfig?: Partial<AppUpdateConfig>): Promise<UpdateCheckResult> {
    const config: AppUpdateConfig = { ...APP_UPDATE_CONFIG, ...customConfig };
    const isIos = Platform.OS === 'ios';
    const storeName = isIos ? 'App Store' : 'Google Play Store';
    const defaultStoreUrl = isIos ? config.iosStoreUrl : config.androidStoreUrl;

    // Support simulated preview mode for development/testing
    if (config.simulateUpdate) {
      return {
        updateAvailable: true,
        currentVersion: config.currentVersion,
        latestVersion: config.simulatedVersion || '1.1.1',
        storeUrl: defaultStoreUrl,
        storeName,
        forceUpdate: config.forceUpdate,
      };
    }

    let latestVersion = '';
    let storeUrl = defaultStoreUrl;

    if (isIos) {
      const storeData = await fetchIosStoreVersion(config);
      if (storeData) {
        latestVersion = storeData.version;
        if (storeData.storeUrl) storeUrl = storeData.storeUrl;
      }
    } else {
      const storeData = await fetchAndroidStoreVersion(config);
      if (storeData) {
        latestVersion = storeData.version;
        if (storeData.storeUrl) storeUrl = storeData.storeUrl;
      }
    }

    const updateAvailable = latestVersion
      ? isVersionOlder(config.currentVersion, latestVersion)
      : false;

    return {
      updateAvailable,
      currentVersion: config.currentVersion,
      latestVersion,
      storeUrl,
      storeName,
      forceUpdate: config.forceUpdate,
    };
  },

  /**
   * Open the native store app or web store URL.
   */
  async openStore(customStoreUrl?: string): Promise<void> {
    const isIos = Platform.OS === 'ios';
    const deepLink = isIos
      ? APP_UPDATE_CONFIG.iosStoreDeepLink
      : APP_UPDATE_CONFIG.androidStoreDeepLink;
    const webUrl =
      customStoreUrl ||
      (isIos ? APP_UPDATE_CONFIG.iosStoreUrl : APP_UPDATE_CONFIG.androidStoreUrl);

    try {
      const canOpenDeep = await Linking.canOpenURL(deepLink);
      if (canOpenDeep) {
        await Linking.openURL(deepLink);
        return;
      }
    } catch {
      // Fall through to web URL
    }

    try {
      await Linking.openURL(webUrl);
    } catch (e) {
      console.warn('[AppUpdateService] Failed to open store URL:', e);
    }
  },
};
