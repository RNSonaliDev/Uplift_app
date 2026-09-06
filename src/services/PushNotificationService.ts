import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  AuthorizationStatus
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

class PushNotificationService {
  async requestUserPermission() {
    try {
      const msg = getMessaging();
      const authStatus = await requestPermission(msg);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        await this.getFCMToken();
      } else {
        console.log('Push notification permission denied');
      }
    } catch (e) {
      console.error('Error requesting permission', e);
    }
  }

  async getFCMToken() {
    try {
      const msg = getMessaging();
      
      const fcmToken = await getToken(msg);
      if (fcmToken) {
        console.log('Your Firebase Token is:', fcmToken);
        // Here you would typically send this token to your backend
        // e.g., backendApi.registerDeviceToken(fcmToken)
      } else {
        console.log('Failed to get FCM token');
      }
    } catch (error: any) {
      if (error.code === 'messaging/unregistered' || error.code === 'messaging/registration-timeout') {
        console.log('FCM token generation failed. This is expected on iOS Simulators. Use a physical device for push notifications.');
      } else {
        console.error('Error getting FCM token:', error);
      }
    }
  }

  setupForegroundListener() {
    const msg = getMessaging();
    return onMessage(msg, async remoteMessage => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
      
      if (remoteMessage.notification) {
        // Request permissions (required for iOS)
        await notifee.requestPermission();

        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });

        // Display a system notification
        await notifee.displayNotification({
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          android: {
            channelId,
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_launcher', // Use your app's notification icon
            pressAction: {
              id: 'default',
            },
          },
        });
      }
    });
  }
}

export const pushNotificationService = new PushNotificationService();
