import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } else {
    const checkInterval = setInterval(() => {
      if (navigationRef.isReady()) {
        clearInterval(checkInterval);
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }, 100);
    setTimeout(() => clearInterval(checkInterval), 3000);
  }
}
