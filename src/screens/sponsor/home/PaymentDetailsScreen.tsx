import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { ChevronLeft, CreditCard, Lock, CheckCircle2 } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import { FontFamily } from '../../../theme/typography';

export default function PaymentDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const amount = route.params?.amount || 0;
  const recipientType = route.params?.recipientType || 'none';

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handlePayNow = () => {
    // Navigate to Processing Screen
    navigation.navigate('ProcessingPayment', { amount, recipientType });
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
                Credit Card
              </AppText>
            </View>
            <CreditCard color={Colors.neutral[400]} size={20} />
          </View>
          <AppText variant="caption" color={Colors.neutral[500]} style={styles.methodSubtitle}>
            We accept Visa, Mastercard, Amex, Discover
          </AppText>
          <View style={styles.cardLogos}>
            <AppText variant="caption" weight="bold" color={Colors.primary[700]} style={styles.cardLogoText}>VISA</AppText>
            <AppText variant="caption" weight="bold" color="#EB001B" style={styles.cardLogoText}>MC</AppText>
            <AppText variant="caption" weight="bold" color="#006FCF" style={styles.cardLogoText}>AMEX</AppText>
            <AppText variant="caption" weight="bold" color="#FF6000" style={styles.cardLogoText}>DISC</AppText>
          </View>
        </View>

        {/* Card Information */}
        <AppText variant="h5" color={Colors.neutral[900]} style={styles.sectionTitle}>
          Card Information
        </AppText>

        <View style={styles.inputContainer}>
          <AppText variant="labelMedium" color={Colors.neutral[700]} style={styles.inputLabel}>
            Card Number
          </AppText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="number-pad"
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={Colors.neutral[400]}
              maxLength={19}
            />
            {cardNumber.length > 0 && (
              <AppText variant="caption" weight="bold" color={Colors.primary[700]}>VISA</AppText>
            )}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, {flex: 1, marginRight: horizontalScale(16)}]}>
            <AppText variant="labelMedium" color={Colors.neutral[700]} style={styles.inputLabel}>
              Expiry Date
            </AppText>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={setExpiry}
                keyboardType="number-pad"
                placeholder="MM / YY"
                placeholderTextColor={Colors.neutral[400]}
                maxLength={5}
              />
            </View>
          </View>
          <View style={[styles.inputContainer, {flex: 1}]}>
            <AppText variant="labelMedium" color={Colors.neutral[700]} style={styles.inputLabel}>
              CVV
            </AppText>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="number-pad"
                placeholder="123"
                placeholderTextColor={Colors.neutral[400]}
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <AppText variant="labelMedium" color={Colors.neutral[700]} style={styles.inputLabel}>
            Billing ZIP Code
          </AppText>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="number-pad"
              placeholder="10001"
              placeholderTextColor={Colors.neutral[400]}
              maxLength={10}
            />
          </View>
        </View>

        {/* Security Alert */}
        <View style={styles.securityAlert}>
          <Lock color={Colors.primary[500]} size={20} />
          <AppText variant="caption" color={Colors.neutral[700]} style={styles.securityText}>
            Your payment information is secure and never stored on our servers.
          </AppText>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button 
          title={`Pay Now - $${amount}`} 
          onPress={handlePayNow}
          disabled={!cardNumber || !expiry || !cvv || !zipCode}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: horizontalScale(16),
    height: verticalScale(50),
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: fontScale(16),
    color: Colors.neutral[900],
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
