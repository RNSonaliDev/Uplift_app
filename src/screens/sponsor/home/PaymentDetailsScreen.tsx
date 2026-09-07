import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { ChevronLeft, CreditCard, Lock, CheckCircle2 } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import { stripeApi } from '../../../api/stripe';

export default function PaymentDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  console.log("@@ route.params =====", route.params)
  const amount = route.params?.amount || 0;
  const recipientType = route.params?.recipientType || 'none';

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donationId, setDonationId] = useState<number | null>(null);

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      const { donationsApi } = await import('../../../api/donations');
      const res = await donationsApi.createDonation({
        donation: {
          amount,
          recipient_type: recipientType,
        }
      });
      if (res.donation?.id) {
        setDonationId(res.donation.id);
      } else if (res.id) {
        setDonationId(res.id as number);
      }
      const clientSecret = res.client_secret;
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Uplift',
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
      });
      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        setIsReady(true);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not initialize payment.');
    }
  };

  const handlePayNow = async () => {
    if (!isReady) return;
    
    setLoading(true);
    const { error } = await presentPaymentSheet();
    setLoading(false);

    if (error) {
      if (error.code !== 'Canceled') {
        Alert.alert(`Error`, error.message);
      }
    } else {
      // Payment was successful!
      navigation.navigate('ProcessingPayment', { amount, recipientType, donationId });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h4" color={Colors.neutral[0]}>
          Payment Details
        </AppText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Payment Method */}
        <AppText variant="h5" color={Colors.neutral[900]} style={styles.sectionTitle}>
          Payment Method
        </AppText>
        <View style={styles.methodCard}>
          <View style={styles.methodHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <CheckCircle2 color={Colors.primary[500]} size={20} style={{marginRight: 8}} />
              <AppText variant="bodyLarge" weight="semiBold" color={Colors.neutral[900]}>
                Secure Credit Card Payment
              </AppText>
            </View>
            <CreditCard color={Colors.neutral[400]} size={20} />
          </View>
          <AppText variant="caption" color={Colors.neutral[500]} style={styles.methodSubtitle}>
            Powered by Stripe. Tap 'Pay Now' to enter your card details securely.
          </AppText>
          <View style={styles.cardLogos}>
            <AppText variant="caption" weight="bold" color={Colors.primary[700]} style={styles.cardLogoText}>VISA</AppText>
            <AppText variant="caption" weight="bold" color="#EB001B" style={styles.cardLogoText}>MC</AppText>
            <AppText variant="caption" weight="bold" color="#006FCF" style={styles.cardLogoText}>AMEX</AppText>
            <AppText variant="caption" weight="bold" color="#FF6000" style={styles.cardLogoText}>DISC</AppText>
          </View>
        </View>

        {/* Security Alert */}
        <View style={styles.securityAlert}>
          <Lock color={Colors.primary[500]} size={20} />
          <AppText variant="caption" color={Colors.neutral[700]} style={styles.securityText}>
            Your payment information is handled directly by Stripe. It is never stored on our servers.
          </AppText>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button 
          title={isReady ? `Pay Now - $${amount}` : 'Loading...'} 
          onPress={handlePayNow}
          disabled={!isReady || loading}
        />
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
  },
  content: {
    padding: horizontalScale(24),
    paddingTop: verticalScale(32),
  },
  sectionTitle: {
    marginBottom: verticalScale(16),
  },
  methodCard: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderRadius: 12,
    padding: moderateScale(16),
    marginBottom: verticalScale(32),
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  methodSubtitle: {
    marginLeft: horizontalScale(28), // aligns with the text next to icon
    marginBottom: verticalScale(12),
  },
  cardLogos: {
    flexDirection: 'row',
    marginLeft: horizontalScale(28),
    gap: horizontalScale(12),
  },
  cardLogoText: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  securityAlert: {
    flexDirection: 'row',
    backgroundColor: Colors.primary[50],
    padding: moderateScale(16),
    borderRadius: 12,
    alignItems: 'center',
    marginTop: verticalScale(12),
  },
  securityText: {
    flex: 1,
    marginLeft: horizontalScale(12),
    lineHeight: fontScale(20),
  },
  footer: {
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(32),
  }
});
