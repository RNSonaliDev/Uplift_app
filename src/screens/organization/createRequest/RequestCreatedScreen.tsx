import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';

export const RequestCreatedScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { referenceNumber } = route.params || {};

  const handleViewRequests = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ 
          name: 'OrganizationTabs', 
          params: { screen: 'RequestsTab' }
        }],
      })
    );
  };

  const handleGoToDashboard = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ 
          name: 'OrganizationTabs',
          params: { screen: 'HomeTab' }
        }],
      })
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      {Platform.OS === 'ios' && <SafeAreaView />}

      <View style={styles.content}>
        
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          {/* Confetti simulation dots around */}
          <View style={[styles.dot, { top: -20, left: 20, backgroundColor: Colors.error }]} />
          <View style={[styles.dot, { top: 10, left: -30, backgroundColor: Colors.success }]} />
          <View style={[styles.dot, { bottom: -10, left: 10, backgroundColor: Colors.warning }]} />
          <View style={[styles.dot, { top: -10, right: -20, backgroundColor: Colors.primary[300] }]} />
          <View style={[styles.dot, { bottom: 20, right: -30, backgroundColor: Colors.secondary[400] }]} />
          
          <View style={styles.circle}>
            <Check color={Colors.neutral[0]} size={48} strokeWidth={3} />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>Request Created!</Text>
        <Text style={styles.subtitle}>Your request has been submitted successfully.</Text>
        <Text style={styles.description}>
          Volunteers within the selected radius can now view and accept your request.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Request ID</Text>
          <Text style={styles.cardValue}>
            {referenceNumber ? `#${referenceNumber}` : '#REQ-2024-0522-001'}
          </Text>
        </View>

      </View>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewRequests}
        >
          <Text style={styles.primaryButtonText}>View My Requests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoToDashboard}
        >
          <Text style={styles.secondaryButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 48,
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    ...Typography.h3,
    color: Colors.neutral[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.medium,
    color: Colors.neutral[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.primary[50],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  cardLabel: {
    ...Typography.labelMedium,
    color: Colors.primary[900],
    marginBottom: 4,
  },
  cardValue: {
    ...Typography.bodyLarge,
    fontFamily: FontFamily.semiBold,
    color: Colors.neutral[900],
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.neutral[0],
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    ...Typography.buttonLarge,
    color: Colors.neutral[0],
  },
  secondaryButton: {
    backgroundColor: Colors.neutral[0],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  secondaryButtonText: {
    ...Typography.buttonLarge,
    color: Colors.primary[500],
  },
});
