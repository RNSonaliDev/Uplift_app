import React from 'react';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { Colors } from './colors';

const toastStyle = {
  height: 'auto' as const,
  minHeight: 70,
  paddingVertical: 12,
  borderLeftWidth: 8,
  borderRadius: 12,
  backgroundColor: Colors.neutral[0],
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 10,
  elevation: 8,
};

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={[toastStyle, { borderLeftColor: Colors.primary[500] || '#4CAF50' }]}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
      text1Style={{
        fontSize: 18,
        fontWeight: '800',
        color: Colors.neutral[900] || '#000',
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 15,
        fontWeight: '500',
        color: Colors.neutral[600] || '#444',
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={[toastStyle, { borderLeftColor: Colors.error || '#F44336' }]}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
      text1Style={{
        fontSize: 18,
        fontWeight: '800',
        color: Colors.neutral[900] || '#000',
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 15,
        fontWeight: '500',
        color: Colors.neutral[600] || '#444',
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={[toastStyle, { borderLeftColor: '#2196F3' }]}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
      text1Style={{
        fontSize: 18,
        fontWeight: '800',
        color: Colors.neutral[900] || '#000',
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 15,
        fontWeight: '500',
        color: Colors.neutral[600] || '#444',
      }}
    />
  ),
};
