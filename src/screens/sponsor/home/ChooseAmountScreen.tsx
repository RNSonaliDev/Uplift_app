import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { ChevronLeft, Heart, ChevronDown, X, ShieldCheck } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import { FontFamily } from '../../../theme/typography';

const predefinedAmounts = [25, 50, 100, 250];

const RECIPIENT_OPTIONS = [
  { id: 'volunteer', label: 'Reward the volunteers' },
  { id: 'beneficiary', label: 'Support the beneficiaries' },
  { id: 'split', label: 'Split equally' },
  { id: 'none', label: 'Whoever needs it most' },
];

export default function ChooseAmountScreen() {
  const navigation = useNavigation<any>();
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [recipientType, setRecipientType] = useState<string>('');
  const [isRecipientModalVisible, setIsRecipientModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleContinue = async () => {
    const finalAmount = selectedAmount === 'custom' ? parseFloat(customAmount) : selectedAmount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      return;
    }
    if (!recipientType) {
      return;
    }
    
    setLoading(true);
    try {
      const { donationsApi } = await import('../../../api/donations');
      const res = await donationsApi.createDonation({
        donation: {
          amount: finalAmount,
          recipient_type: recipientType,
        }
      });
      
      let newDonationId = null;
      const resAny = res as any;
      if (resAny.donation?.id) {
        newDonationId = resAny.donation.id;
      } else if (resAny.id) {
        newDonationId = resAny.id as number;
      }
      
      const clientSecret = res.client_secret;
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Uplift',
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
      });
      
      if (initError) {
        Alert.alert(`Error code: ${initError.code}`, initError.message);
        setLoading(false);
        return;
      }
      
      const { error: presentError } = await presentPaymentSheet();
      
      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert(`Error`, presentError.message);
        }
      } else {
        // Payment was successful!
        navigation.navigate('ProcessingPayment', { amount: finalAmount, recipientType, donationId: newDonationId });
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not process payment.');
    } finally {
      setLoading(false);
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
          Make a Contribution
        </AppText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Non-Profit Information Banner */}
        <View style={styles.infoBanner}>
          <ShieldCheck color={Colors.primary[500]} size={22} style={{ marginRight: 10, marginTop: 2 }} />
          <AppText variant="caption" color={Colors.neutral[700]} style={styles.infoBannerText}>
            Donations are processed by iUpliftU Foundation, Inc., a 501(c)(3) nonprofit. Tax-deductible to the extent permitted by law.{'\n\n'}
            <AppText variant="caption" weight="semiBold" color={Colors.primary[700]}>
              95% of your contribution goes directly to the community fund. A 5% platform fee keeps the platform running.
            </AppText>
          </AppText>
        </View>

        {/* Recipient Type Selection */}
        <AppText variant="h5" color={Colors.neutral[900]} style={{marginBottom: 8}}>
          Where should this go?
        </AppText>
        <TouchableOpacity 
          style={styles.dropdownTrigger}
          onPress={() => setIsRecipientModalVisible(true)}
        >
          <AppText variant="bodyMedium" color={recipientType ? Colors.neutral[900] : Colors.neutral[400]}>
            {recipientType ? RECIPIENT_OPTIONS.find(o => o.id === recipientType)?.label : 'Select recipient'}
          </AppText>
          <ChevronDown color={Colors.neutral[500]} size={20} />
        </TouchableOpacity>

        <AppText variant="h5" color={Colors.neutral[900]} style={{marginTop: verticalScale(8), marginBottom: verticalScale(4)}}>
          Choose Amount
        </AppText>
        {/* Amount Grid */}
        <View style={styles.amountGrid}>
          {predefinedAmounts.map((amount) => {
            const isSelected = selectedAmount === amount;
            return (
              <TouchableOpacity
                key={amount}
                style={[styles.amountBox, isSelected && styles.amountBoxSelected]}
                onPress={() => {
                  if (isSelected) {
                    setSelectedAmount('custom');
                    setCustomAmount('');
                  } else {
                    setSelectedAmount(amount);
                    setCustomAmount(amount.toString());
                  }
                }}
              >
                <AppText 
                  variant="h5" 
                  color={isSelected ? Colors.neutral[0] : Colors.neutral[600]}
                >
                  ${amount}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Amount Input */}
        <View style={styles.customInputContainer}>
          <AppText variant="h5" color={Colors.neutral[900]} style={{marginBottom: 8}}>
            Or Enter Custom Amount
          </AppText>
          <View style={[styles.inputWrapper, selectedAmount === 'custom' && { borderColor: Colors.primary[500], borderWidth: 2 }]}>
            <AppText variant="h5" color={Colors.neutral[600]} style={styles.currencySymbol}>$</AppText>
            <TextInput
              style={styles.input}
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedAmount('custom');
              }}
              keyboardType="decimal-pad"
              placeholder="Enter amount"
              placeholderTextColor={Colors.neutral[400]}
              onFocus={() => setSelectedAmount('custom')}
            />
          </View>
        </View>

        {/* Legal Disclaimer Footer */}
        <View style={styles.legalFooter}>
          <AppText variant="caption" color={Colors.neutral[500]} center style={styles.legalFooterText}>
            iUpliftU Foundation, Inc. · 501(c)(3) · EIN: [FOUNDATION EIN] · No goods or services provided in exchange for this contribution.
          </AppText>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button 
          title={loading ? 'Loading...' : 'Continue'} 
          size="lg"
          fullWidth
          onPress={handleContinue}
          disabled={(selectedAmount === 'custom' && (!customAmount || isNaN(parseFloat(customAmount)) || parseFloat(customAmount) <= 0)) || !recipientType || loading}
        />
      </View>

      <Modal visible={isRecipientModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="h5" style={{ color: Colors.neutral[900] }}>Where should this go?</AppText>
              <TouchableOpacity onPress={() => setIsRecipientModalVisible(false)} style={{ padding: 4 }}>
                <X color={Colors.neutral[500]} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {RECIPIENT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setRecipientType(option.id);
                    setIsRecipientModalVisible(false);
                  }}
                >
                  <AppText 
                    variant="bodyMedium" 
                    color={recipientType === option.id ? Colors.primary[500] : Colors.neutral[800]}
                    weight={recipientType === option.id ? 'semiBold' : 'regular'}
                  >
                    {option.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  title: {
    marginBottom: verticalScale(8),
  },
  subtitle: {
    marginBottom: verticalScale(15),
  },
  amountGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  amountBox: {
    flex: 1,
    marginHorizontal: horizontalScale(4),
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountBoxSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  customInputContainer: {
    marginBottom: verticalScale(16),
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(15),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: horizontalScale(0),
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: horizontalScale(24),
    paddingVertical: verticalScale(24),
    paddingBottom: verticalScale(40),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  modalOption: {
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: horizontalScale(16),
    height: verticalScale(56),
  },
  currencySymbol: {
    marginRight: horizontalScale(8),
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: fontScale(18),
    color: Colors.neutral[600]
  },
  thankYouCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
    padding: moderateScale(16),
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  heartContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: 24,
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  footer: {
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(32),
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderRadius: 14,
    padding: moderateScale(14),
    marginBottom: verticalScale(20),
    alignItems: 'flex-start',
  },
  infoBannerText: {
    flex: 1,
    lineHeight: fontScale(18),
  },
  legalFooter: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(12),
    paddingHorizontal: horizontalScale(4),
  },
  legalFooterText: {
    lineHeight: fontScale(16),
    fontSize: fontScale(11),
  },
});
