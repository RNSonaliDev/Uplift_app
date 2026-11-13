import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStripe, LinkDisplay } from '@stripe/stripe-react-native';
import { Heart, ShieldCheck, X, CheckCircle2, Clock, ChevronLeft, Award } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Colors } from '../../../theme/colors';
import { FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import { formatDate } from '../../../utils/dateFormatter';
import { organizationDonationsApi, OrganizationDonation } from '../../../api/donations';
import { authApi } from '../../../api/auth';
import {
  StripeConfig,
  DEFAULT_STRIPE_CONFIG,
  getStripeConfig,
  saveStripeConfig,
  calculateStripeFee,
} from '../../../api/stripe';

const PREDEFINED_AMOUNTS = [100, 250, 500];
const MIN_CONTRIBUTION_AMOUNT = 100;

export const OrgDonationScreen = () => {
  const navigation = useNavigation<any>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [stripeConfig, setStripeConfig] = useState<StripeConfig>(DEFAULT_STRIPE_CONFIG);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<OrganizationDonation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load Stripe configuration
  const loadConfig = useCallback(async () => {
    try {
      const cached = await getStripeConfig();
      if (cached) setStripeConfig(cached);

      const profileRes = (await authApi.getProfile()) as any;
      const remoteConfig =
        profileRes?.organization?.stripe_config ||
        profileRes?.active_profile?.stripe_config ||
        profileRes?.profiles?.organization?.stripe_config ||
        profileRes?.stripe_config;

      if (remoteConfig) {
        const saved = await saveStripeConfig(remoteConfig);
        if (saved) setStripeConfig(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch past donations
  const fetchDonationHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await organizationDonationsApi.getDonations();
      if (Array.isArray(res)) {
        setHistory(res);
      }
    } catch (e) {
      console.warn('Failed to fetch past donations', e);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useFocusEffect(
    useCallback(() => {
      fetchDonationHistory();
    }, [fetchDonationHistory])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadConfig(), fetchDonationHistory()]);
    setRefreshing(false);
  }, [loadConfig, fetchDonationHistory]);

  const finalAmount = selectedAmount === 'custom' ? parseFloat(customAmount) : selectedAmount;
  const validAmount = !finalAmount || isNaN(finalAmount) || finalAmount <= 0 ? 0 : finalAmount;
  const feeInfo = calculateStripeFee(validAmount, stripeConfig);

  const handleSelectPredefined = (amount: number) => {
    Keyboard.dismiss();
    if (selectedAmount === amount) {
      setSelectedAmount('custom');
      setCustomAmount('');
    } else {
      setSelectedAmount(amount);
      setCustomAmount(amount.toString());
    }
  };

  const handleCustomAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
    setCustomAmount(sanitized);
    setSelectedAmount('custom');
  };

  const isBelowMinimum =
    selectedAmount === 'custom' && customAmount.trim().length > 0 && validAmount < MIN_CONTRIBUTION_AMOUNT;

  const handleContributeNow = async () => {
    if (validAmount < MIN_CONTRIBUTION_AMOUNT) {
      Toast.show({
        type: 'info',
        text1: 'Minimum Contribution',
        text2: `Minimum contribution amount is $${MIN_CONTRIBUTION_AMOUNT}.`,
      });
      return;
    }

    if (loading) return;

    try {
      Keyboard.dismiss();
      setLoading(true);

      // 1. Create donation intent on backend
      const res = await organizationDonationsApi.createDonation({
        donation: {
          amount: validAmount,
          message: 'Supporting Uplift',
        },
      });

      const resAny = res as any;
      if (resAny?.stripe_config) {
        const saved = await saveStripeConfig(resAny.stripe_config);
        if (saved) setStripeConfig(saved);
      }

      const clientSecret = res?.client_secret || resAny?.client_secret;
      const donationId = resAny?.donation?.id || resAny?.id;

      if (!clientSecret) {
        Toast.show({
          type: 'error',
          text1: 'Payment Error',
          text2: 'Could not initialize payment. Please try again.',
        });
        setLoading(false);
        return;
      }

      // 2. Initialize Stripe Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'iUpliftU',
        paymentIntentClientSecret: clientSecret,
        returnURL: 'upliftapp://stripe-redirect',
        allowsDelayedPaymentMethods: true,
        paymentMethodOrder: ['card', 'us_bank_account'],
        link: {
          display: LinkDisplay.NEVER,
        },
      });

      if (initError) {
        Toast.show({
          type: 'error',
          text1: 'Payment Setup Error',
          text2: initError.message,
        });
        setLoading(false);
        return;
      }

      // 3. Present Stripe Payment Sheet
      const { error: presentError } = await presentPaymentSheet();
      setLoading(false);

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Toast.show({
            type: 'error',
            text1: 'Payment Failed',
            text2: presentError.message,
          });
        }
      } else {
        // 4. Payment succeeded, navigate to Processing screen to verify & confirm
        navigation.navigate('ProcessingPayment', {
          amount: validAmount,
          recipientType: 'none',
          donationId,
          isOrganization: true,
        });
      }
    } catch (e: any) {
      setLoading(false);
      console.error('Error initiating contribution:', e);
      Toast.show({
        type: 'error',
        text1: 'Payment Error',
        text2: e?.data?.errors?.[0] || e?.message || 'Failed to process contribution. Please try again.',
      });
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={Colors.primary[500]} barStyle="light-content" />

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft color={Colors.neutral[0]} size={26} />
          </TouchableOpacity>
          <AppText variant="h5" color={Colors.neutral[0]} style={styles.headerTitle}>
            Partnering
          </AppText>
          <View style={{ width: 26 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Partner Perks Banner */}
            <View style={styles.infoBanner}>
              <View style={styles.perksHeaderRow}>
                <Award color={Colors.primary[600]} size={14} style={{ marginRight: horizontalScale(6) }} />
                <AppText
                  variant="caption"
                  weight="bold"
                  color={Colors.primary[700]}
                  style={styles.perksTitle}
                >
                  PARTNER RECOGNITION TIERS
                </AppText>
              </View>

              <View style={styles.tierList}>
                {/* $100+ Tier */}
                <View style={[styles.tierItem, validAmount >= 100 && validAmount < 250 && styles.tierItemActive]}>
                  <View style={[styles.tierTag, validAmount >= 100 && validAmount < 250 && styles.tierTagActive]}>
                    <AppText
                      variant="caption"
                      weight="bold"
                      color={validAmount >= 100 && validAmount < 250 ? Colors.neutral[0] : Colors.primary[700]}
                      style={styles.tierTagText}
                    >
                      $100+
                    </AppText>
                  </View>
                  <AppText
                    variant="caption"
                    weight={validAmount >= 100 && validAmount < 250 ? 'semiBold' : 'regular'}
                    color={validAmount >= 100 && validAmount < 250 ? Colors.primary[900] : Colors.neutral[700]}
                    style={styles.tierText}
                  >
                    Proud Partner badge on profile
                  </AppText>
                </View>

                {/* $250+ Tier */}
                <View style={[styles.tierItem, validAmount >= 250 && validAmount < 500 && styles.tierItemActive]}>
                  <View style={[styles.tierTag, validAmount >= 250 && validAmount < 500 && styles.tierTagActive]}>
                    <AppText
                      variant="caption"
                      weight="bold"
                      color={validAmount >= 250 && validAmount < 500 ? Colors.neutral[0] : Colors.primary[700]}
                      style={styles.tierTagText}
                    >
                      $250+
                    </AppText>
                  </View>
                  <AppText
                    variant="caption"
                    weight={validAmount >= 250 && validAmount < 500 ? 'semiBold' : 'regular'}
                    color={validAmount >= 250 && validAmount < 500 ? Colors.primary[900] : Colors.neutral[700]}
                    style={styles.tierText}
                  >
                    Proud Partner of iUpliftU badge on business profile
                  </AppText>
                </View>

                {/* $500+ Tier */}
                <View style={[styles.tierItem, validAmount >= 500 && styles.tierItemActive]}>
                  <View style={[styles.tierTag, validAmount >= 500 && styles.tierTagActive]}>
                    <AppText
                      variant="caption"
                      weight="bold"
                      color={validAmount >= 500 ? Colors.neutral[0] : Colors.primary[700]}
                      style={styles.tierTagText}
                    >
                      $500+
                    </AppText>
                  </View>
                  <AppText
                    variant="caption"
                    weight={validAmount >= 500 ? 'semiBold' : 'regular'}
                    color={validAmount >= 500 ? Colors.primary[900] : Colors.neutral[700]}
                    style={styles.tierText}
                  >
                    Everything + featured in app + social recognition
                  </AppText>
                </View>
              </View>
            </View>

            {/* Choose Amount Section */}
            <AppText variant="bodyLarge" weight="semiBold" color={Colors.neutral[900]} style={styles.sectionTitle}>
              Choose Amount
            </AppText>

            {/* Predefined Amount Pills */}
            <View style={styles.amountGrid}>
              {PREDEFINED_AMOUNTS.map((amt) => {
                const isSelected = selectedAmount === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    activeOpacity={0.8}
                    style={[styles.amountBox, isSelected && styles.amountBoxSelected]}
                    onPress={() => handleSelectPredefined(amt)}
                  >
                    <AppText
                      variant="bodyLarge"
                      weight={isSelected ? 'bold' : 'semiBold'}
                      color={isSelected ? Colors.neutral[0] : Colors.neutral[700]}
                    >
                      ${amt}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Amount Input */}
            <View style={styles.customInputContainer}>
              <View style={styles.customInputHeaderRow}>
                <AppText variant="bodyMedium" weight="semiBold" color={Colors.neutral[900]}>
                  Or Enter Custom Amount
                </AppText>
                <AppText variant="caption" weight="medium" color={Colors.neutral[500]}>
                  Min. $100
                </AppText>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  selectedAmount === 'custom' && styles.inputWrapperActive,
                  isBelowMinimum && styles.inputWrapperError,
                ]}
              >
                <AppText
                  variant="h5"
                  weight="semiBold"
                  color={
                    isBelowMinimum
                      ? Colors.error
                      : selectedAmount === 'custom'
                      ? Colors.primary[600]
                      : Colors.neutral[500]
                  }
                  style={styles.currencySymbol}
                >
                  $
                </AppText>
                <TextInput
                  style={styles.textInput}
                  value={selectedAmount === 'custom' ? customAmount : ''}
                  onChangeText={handleCustomAmountChange}
                  keyboardType="decimal-pad"
                  placeholder={selectedAmount !== 'custom' ? `${selectedAmount}` : '100'}
                  placeholderTextColor={Colors.neutral[400]}
                  onFocus={() => {
                    if (selectedAmount !== 'custom') {
                      setCustomAmount(selectedAmount ? selectedAmount.toString() : '');
                      setSelectedAmount('custom');
                    }
                  }}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                {selectedAmount === 'custom' && customAmount.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setCustomAmount('');
                    }}
                    style={styles.clearBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X color={Colors.neutral[400]} size={18} />
                  </TouchableOpacity>
                )}
              </View>
              {isBelowMinimum && (
                <AppText variant="caption" color={Colors.error} style={styles.errorText}>
                  Minimum contribution amount is $100.
                </AppText>
              )}
            </View>

            {/* Fee & Total Calculation Breakdown */}
            {validAmount >= MIN_CONTRIBUTION_AMOUNT && (
              <View style={styles.calcPreviewCard}>
                <View style={styles.calcRow}>
                  <AppText variant="bodySmall" color={Colors.neutral[600]}>
                    Contribution Amount:
                  </AppText>
                  <AppText variant="bodySmall" weight="semiBold" color={Colors.neutral[900]}>
                    ${validAmount.toFixed(2)}
                  </AppText>
                </View>

                <View style={[styles.calcRow, { marginTop: verticalScale(6) }]}>
                  <AppText variant="caption" color={Colors.neutral[600]}>
                    Processing Fee:
                  </AppText>
                  <AppText variant="caption" weight="semiBold" color={Colors.neutral[900]}>
                    +${feeInfo.fee.toFixed(2)}
                  </AppText>
                </View>

                <View style={styles.calcDivider} />

                <View style={styles.calcRow}>
                  <AppText variant="bodyMedium" weight="bold" color={Colors.neutral[900]}>
                    Estimated Total:
                  </AppText>
                  <AppText variant="h5" weight="bold" color={Colors.primary[600]}>
                    ${feeInfo.total.toFixed(2)}
                  </AppText>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Fixed Bottom Action Button */}
          <View style={styles.fixedBottomContainer}>
            <Button
              title="Confirm Contribution"
              size="lg"
              fullWidth
              onPress={handleContributeNow}
              disabled={validAmount < MIN_CONTRIBUTION_AMOUNT || loading}
              loading={loading}
            />
            <View style={styles.bottomNoteRow}>
              <ShieldCheck
                color={Colors.primary[500]}
                size={16}
                style={styles.bottomNoteIcon}
              />
              <AppText
                variant="caption"
                color={Colors.neutral[600]}
                style={styles.bottomNoteText}
              >
                Your contribution supports iUpliftU platform operations and community growth.
              </AppText>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(14),
  },
  backButton: {
    padding: moderateScale(4),
  },
  headerTitle: {
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
  },
  infoBanner: {
    backgroundColor: '#F8F6FF',
    borderWidth: 1,
    borderColor: '#E2DCFE',
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    marginBottom: verticalScale(18),
  },
  perksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  perksTitle: {
    fontSize: fontScale(11),
    letterSpacing: 0.5,
  },
  tierList: {
    gap: verticalScale(6),
  },
  tierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(6),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tierItemActive: {
    backgroundColor: '#EFEAFF',
    borderColor: '#C7B9FE',
  },
  tierTag: {
    backgroundColor: '#E8E1FF',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(6),
    marginRight: horizontalScale(8),
    minWidth: horizontalScale(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierTagActive: {
    backgroundColor: Colors.primary[500],
  },
  tierTagText: {
    fontSize: fontScale(11),
    fontFamily: FontFamily.bold,
  },
  tierText: {
    flex: 1,
    flexShrink: 1,
    fontSize: fontScale(12),
    lineHeight: fontScale(16),
  },
  sectionTitle: {
    marginBottom: verticalScale(10),
  },
  amountGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  amountBox: {
    flex: 1,
    marginHorizontal: horizontalScale(4),
    backgroundColor: Colors.neutral[0],
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  amountBoxSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  customInputContainer: {
    marginBottom: verticalScale(20),
  },
  customInputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(14),
    height: verticalScale(52),
  },
  inputWrapperActive: {
    borderColor: Colors.primary[500],
    borderWidth: 2,
  },
  inputWrapperError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  errorText: {
    marginTop: verticalScale(6),
    fontFamily: FontFamily.medium,
    marginLeft: horizontalScale(2),
  },
  currencySymbol: {
    marginRight: horizontalScale(6),
  },
  textInput: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(18),
    color: Colors.neutral[900],
    paddingVertical: 0,
  },
  clearBtn: {
    padding: moderateScale(4),
  },
  calcPreviewCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(14),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: verticalScale(10),
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  securityText: {
    marginLeft: horizontalScale(6),
  },
  fixedBottomContainer: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(12),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(14) : verticalScale(14),
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 6,
  },
  bottomNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: verticalScale(10),
    paddingHorizontal: horizontalScale(2),
  },
  bottomNoteIcon: {
    marginRight: horizontalScale(6),
    marginTop: verticalScale(1.5),
  },
  bottomNoteText: {
    flex: 1,
    fontSize: fontScale(11.5),
    lineHeight: fontScale(16),
    textAlign: 'left',
  },
  historyContainer: {
    marginTop: verticalScale(8),
  },
  historyTitle: {
    marginBottom: verticalScale(12),
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  historyLeft: {
    flex: 1,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyStatusBadge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(6),
    marginTop: verticalScale(4),
  },
});

