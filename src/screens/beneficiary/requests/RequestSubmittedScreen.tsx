import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Info, ShieldCheck } from 'lucide-react-native';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';

export default function RequestSubmittedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { referenceNumber, startCode } = route.params || {};

  const handleViewRequests = () => {
    // Reset current stack and navigate directly to MyRequests tab
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'BeneficiaryTabs', params: { screen: 'MyRequests' } }],
      })
    );
  };

  const handleGoToDashboard = () => {
    // Reset current stack to Dashboard
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'BeneficiaryTabs', params: { screen: 'BeneficiaryDashboard' } }],
      })
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      {Platform.OS === 'ios' && <SafeAreaView />}

      <ScrollView 
        contentContainerStyle={[
          styles.content,
          { paddingTop: 24, paddingBottom: 24 }
        ]}
        showsVerticalScrollIndicator={false}
      >
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

        {/* <View style={styles.card}>
          <Text style={styles.cardLabel}>Request ID</Text>
          <Text style={styles.cardValue}>
            {referenceNumber ? `#${referenceNumber}` : '#REQ-2024-0522-001'}
          </Text>
        </View> */}

        {/* Guidance / Next Steps Card */}
        <View style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <Info color={Colors.primary[600]} size={20} />
            <Text style={styles.instructionTitle}>Next Steps</Text>
          </View>
          <Text style={styles.instructionText}>
            You can message your volunteer by clicking on the task under your active request. When you meet them, share your PIN code and tap ‘Start Request’
          </Text>
          {/* {startCode ? (
            <View style={styles.pinContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShieldCheck color={Colors.primary[600]} size={18} style={{ marginRight: 6 }} />
                <Text style={styles.pinLabel}>Your PIN Code:</Text>
              </View>
              <Text style={styles.pinValue}>{startCode}</Text>
            </View>
          ) : null} */}
        </View>

      </ScrollView>

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 36,
    marginTop: 16,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.medium,
    color: Colors.neutral[900],
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.primary[50],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
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
  instructionCard: {
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
    padding: 18,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionTitle: {
    ...Typography.labelLarge,
    fontFamily: FontFamily.semiBold,
    color: Colors.primary[900],
    marginLeft: 8,
  },
  instructionText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[700],
    lineHeight: 22,
  },
  pinContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.primary[200],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinLabel: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.medium,
    color: Colors.primary[900],
  },
  pinValue: {
    ...Typography.h4,
    fontFamily: FontFamily.bold,
    letterSpacing: 4,
    color: Colors.primary[700],
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
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
