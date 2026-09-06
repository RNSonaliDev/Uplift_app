/**
 * @format
 */

import { AppRegistry } from 'react-native';
import '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Register background handler
try {
  const msg = getMessaging();
  setBackgroundMessageHandler(msg, async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
} catch (e) {
  console.error('Error setting background message handler', e);
}

AppRegistry.registerComponent(appName, () => App);
