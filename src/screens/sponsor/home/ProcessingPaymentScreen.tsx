import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { ChevronLeft, CreditCard, Lock } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale } from '../../../utils/responsive';

export default function ProcessingPaymentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const amount = route.params?.amount || 0;
  const recipientType = route.params?.recipientType || 'none';
  const donationId = route.params?.donationId;

  useEffect(() => {
    const processPayment = async () => {
      if (!donationId) {
        // Fallback if donationId is missing
        setTimeout(() => {
          navigation.replace('PaymentSuccessful', { amount });
        }, 1500);
        return;
      }

      try {
        const { donationsApi } = await import('../../../api/donations');
        const res = await donationsApi.confirmDonation(donationId);
        
        if (res.status === 'failed') {
          setTimeout(() => {
            Alert.alert("Payment Failed", "Your payment could not be processed. Please try again.");
            navigation.goBack();
          }, 1500);
        } else {
          setTimeout(() => {
            navigation.replace('PaymentSuccessful', { amount, donation: res });
          }, 1500);
        }
      } catch (error) {
        console.error('Failed to confirm donation', error);
        setTimeout(() => {
          navigation.replace('PaymentSuccessful', { amount });
        }, 1500);
      }
    };
    processPayment();
  }, [navigation, amount, recipientType, donationId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h4" color={Colors.neutral[0]}>
          Processing Payment
        </AppText>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.container}>
        
        <View style={styles.graphicContainer}>
          <View style={styles.circleBg}>
            <CreditCard color={Colors.primary[500]} size={48} fill={Colors.primary[500]} />
            <View style={styles.lockBadge}>
              <Lock color={Colors.neutral[900]} size={16} />
            </View>
          </View>
        </View>

        <AppText variant="h3" color={Colors.neutral[900]} style={styles.title} center>
          Processing Your Payment
        </AppText>
        <AppText variant="bodyLarge" color={Colors.neutral[600]} style={styles.subtitle} center>
          Please wait while we securely process your payment.
        </AppText>

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[500],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  backButton: {
    padding: moderateScale(4),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    paddingHorizontal: horizontalScale(32),
    paddingTop: verticalScale(80),
  },
  graphicContainer: {
    marginBottom: verticalScale(40),
  },
  circleBg: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: moderateScale(20),
    right: moderateScale(15),
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    width: moderateScale(32),
    height: moderateScale(32),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    marginBottom: verticalScale(12),
  },
  subtitle: {
    marginBottom: verticalScale(40),
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
