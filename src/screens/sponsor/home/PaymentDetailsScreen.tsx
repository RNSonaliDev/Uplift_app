import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStripe, LinkDisplay } from '@stripe/stripe-react-native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { ChevronLeft, CreditCard, Lock, CheckCircle2 } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import { FontFamily } from '../../../theme/typography';
import {
  StripeConfig,
  DEFAULT_STRIPE_CONFIG,
  getStripeConfig,
  saveStripeConfig,
  calculateStripeFee,
} from '../../../api/stripe';
import { authApi } from '../../../api/auth';

const RECIPIENT_LABELS: Record<string, string> = {
  volunteer: 'Reward the volunteers',
  beneficiary: 'Support the beneficiaries',
  split: 'Split equally',
  none: 'Whoever needs it most',
};

export default function PaymentDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const amount = Number(route.params?.amount) || 0;
  const recipientType = route.params?.recipientType || 'none';

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donationId, setDonationId] = useState<number | null>(null);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig>(DEFAULT_STRIPE_CONFIG);
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [serverFee, setServerFee] = useState<number | null>(null);

  useEffect(() => {
    fetchStripeConfig();
    initializePaymentSheet();
  }, []);

  const fetchStripeConfig = async () => {
    try {
      const cached = await getStripeConfig();
      if (cached) {
        setStripeConfig(cached);
      }
      const profileRes = await authApi.getProfile() as any;
      const remoteConfig =
        profileRes?.sponsor?.stripe_config ||
        profileRes?.active_profile?.stripe_config ||
        profileRes?.profiles?.sponsor?.stripe_config ||
        profileRes?.stripe_config;
      if (remoteConfig) {
        const saved = await saveStripeConfig(remoteConfig);
        if (saved) {
          setStripeConfig(saved);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const initializePaymentSheet = async () => {
    try {
      const { donationsApi } = await import('../../../api/donations');
      const res = await donationsApi.createDonation({
        donation: {
          amount,
          recipient_type: recipientType,
        }
      });
      const resAny = res as any;
      if (resAny.stripe_config) {
        const saved = await saveStripeConfig(resAny.stripe_config);
        if (saved) setStripeConfig(saved);
      }
      if (resAny.donation?.id) {
        setDonationId(resAny.donation.id);
      } else if (resAny.id) {
        setDonationId(resAny.id as number);
      }
      if (resAny.total_amount) {
        setServerTotal(Number(resAny.total_amount));
      } else if (resAny.donation?.total_amount) {
        setServerTotal(Number(resAny.donation.total_amount));
      }
      if (resAny.fee) {
        setServerFee(Number(resAny.fee));
      } else if (resAny.donation?.fee) {
        setServerFee(Number(resAny.donation.fee));
      }
      const clientSecret = res.client_secret;
      if (!clientSecret) {
        Alert.alert('Error', 'Could not initialize payment.');
        return;
      }
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Uplift',
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        paymentMethodOrder: ['card', 'us_bank_account'],
        link: {
          display: LinkDisplay.NEVER,
        },
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
    if (!isReady || loading) return;
    
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

  const calculated = calculateStripeFee(amount, stripeConfig);
  const displayFee = serverFee !== null ? serverFee : calculated.fee;
  const displayTotal = serverTotal !== null ? serverTotal : calculated.total;
  const recipientLabel = RECIPIENT_LABELS[recipientType] || 'Community Fund';

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
        
        {/* Contribution Summary Card */}
        <AppText variant="h5" color={Colors.neutral[900]} style={styles.sectionTitle}>
          Contribution Summary
        </AppText>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]}>Contribution Amount</AppText>
            <AppText variant="bodyMedium" weight="semiBold" color={Colors.neutral[900]}>${amount.toFixed(2)}</AppText>
          </View>

          <View style={[styles.summaryRow, { marginTop: verticalScale(10) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="bodyMedium" color={Colors.neutral[600]}>Processing Fee</AppText>
              <View style={styles.feeBadge}>
                <AppText variant="caption" color={Colors.primary[700]} style={styles.feeBadgeText}>
                  {stripeConfig.processing_fee_percent}% + ${stripeConfig.fixed_charge.toFixed(2)}
                </AppText>
              </View>
            </View>
            <AppText variant="bodyMedium" weight="semiBold" color={Colors.neutral[900]}>
              ${displayFee.toFixed(2)}
            </AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <View>
              <AppText variant="h5" weight="semiBold" color={Colors.neutral[900]}>Total Charged</AppText>
              <AppText variant="caption" color={Colors.neutral[500]}>Includes Stripe processing fee</AppText>
            </View>
            <AppText variant="h4" weight="semiBold" color={Colors.primary[600]}>${displayTotal.toFixed(2)}</AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <AppText variant="caption" color={Colors.neutral[500]}>Designation</AppText>
            <AppText variant="caption" weight="semiBold" color={Colors.neutral[700]}>
              {recipientLabel}
            </AppText>
          </View>
        </View>

        {/* Payment Method */}
        <AppText variant="h5" color={Colors.neutral[900]} style={styles.sectionTitle}>
          Payment Method
        </AppText>
        <View style={styles.methodCard}>
          <View style={styles.methodHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <CheckCircle2 color={Colors.primary[500]} size={20} style={{marginRight: 8}} />
              <AppText variant="bodyLarge" weight="semiBold" color={Colors.neutral[900]}>
                Credit / Debit Card
              </AppText>
            </View>
            <CreditCard color={Colors.neutral[400]} size={20} />
          </View>
          <View style={styles.cardLogos}>
            <AppText variant="caption" weight="bold" color={Colors.primary[700]} style={styles.cardLogoText}>VISA</AppText>
            <AppText variant="caption" weight="bold" color="#EB001B" style={styles.cardLogoText}>MC</AppText>
            <AppText variant="caption" weight="bold" color="#006FCF" style={styles.cardLogoText}>AMEX</AppText>
            <AppText variant="caption" weight="bold" color="#FF6000" style={styles.cardLogoText}>DISC</AppText>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button 
          title={isReady ? (loading ? 'Opening Checkout...' : `Pay $${displayTotal.toFixed(2)}`) : 'Initializing...'} 
          size="lg"
          fullWidth
          onPress={handlePayNow}
          disabled={!isReady || loading}
        />
        <View style={styles.footerBadgeRow}>
          <Lock color={Colors.neutral[500]} size={14} />
          <AppText variant="caption" color={Colors.neutral[500]} style={styles.footerBadgeText}>
            Powered by Stripe · Guaranteed 100% Secure
          </AppText>
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
  },
  content: {
    padding: horizontalScale(20),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(24),
  },
  sectionTitle: {
    marginBottom: verticalScale(12),
  },
  summaryCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 14,
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(2),
    borderRadius: 4,
    marginLeft: horizontalScale(6),
  },
  feeBadgeText: {
    fontSize: fontScale(10),
    fontFamily: FontFamily.medium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginVertical: verticalScale(12),
  },
  methodCard: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1.5,
    borderColor: Colors.primary[500],
    borderRadius: 14,
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  cardLogos: {
    flexDirection: 'row',
    marginLeft: horizontalScale(28),
    gap: horizontalScale(8),
  },
  cardLogoText: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: fontScale(11),
    overflow: 'hidden',
  },
  footer: {
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
  },
  footerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10),
  },
  footerBadgeText: {
    marginLeft: horizontalScale(6),
    fontFamily: FontFamily.medium,
  },
});
