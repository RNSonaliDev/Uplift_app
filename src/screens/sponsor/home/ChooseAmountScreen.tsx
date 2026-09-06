import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { ChevronLeft, Heart } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import { FontFamily } from '../../../theme/typography';

const predefinedAmounts = [25, 50, 100, 250];

export default function ChooseAmountScreen() {
  const navigation = useNavigation<any>();
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recipientType, setRecipientType] = useState<string>('none');

  const handleContinue = () => {
    const finalAmount = selectedAmount === 'custom' ? parseFloat(customAmount) : selectedAmount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      // Could show a toast here
      return;
    }
    navigation.navigate('PaymentDetails', { amount: finalAmount, recipientType });
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
        <AppText variant="h3" color={Colors.neutral[900]} style={styles.title}>
          Choose Amount
        </AppText>
        <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.subtitle}>
          Your support helps us make a real difference.
        </AppText>

        {/* Recipient Type Selection */}
        <AppText variant="labelLarge" color={Colors.neutral[700]} style={{marginBottom: 8}}>
          Where should this go?
        </AppText>
        <View style={styles.recipientGrid}>
          {[
            { id: 'none', label: 'General Fund' },
            { id: 'volunteer', label: 'Support Volunteers' },
            { id: 'beneficiary', label: 'Direct to Beneficiaries' },
          ].map(type => {
            const isSelected = recipientType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[styles.recipientBox, isSelected && styles.recipientBoxSelected]}
                onPress={() => setRecipientType(type.id)}
              >
                <AppText 
                  variant="bodyMedium" 
                  color={isSelected ? Colors.neutral[0] : Colors.neutral[800]}
                  weight={isSelected ? 'semiBold' : 'regular'}
                >
                  {type.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        <AppText variant="labelLarge" color={Colors.neutral[700]} style={{marginTop: verticalScale(8), marginBottom: verticalScale(4)}}>
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
                    setCustomAmount('');
                  }
                }}
              >
                <AppText 
                  variant="h5" 
                  color={isSelected ? Colors.neutral[0] : Colors.neutral[800]}
                >
                  ${amount}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Amount Input */}
        <View style={styles.customInputContainer}>
          <AppText variant="labelLarge" color={Colors.neutral[700]} style={{marginBottom: 8}}>
            Or Enter Custom Amount
          </AppText>
          <View style={[styles.inputWrapper, selectedAmount === 'custom' && { borderColor: Colors.primary[500], borderWidth: 2 }]}>
            <AppText variant="h4" color={Colors.neutral[900]} style={styles.currencySymbol}>$</AppText>
            <TextInput
              style={styles.input}
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                if (text.length > 0) {
                  setSelectedAmount('custom');
                } else {
                  setSelectedAmount(100); // Default fallback when empty
                }
              }}
              keyboardType="decimal-pad"
              placeholder="Enter amount"
              placeholderTextColor={Colors.neutral[400]}
              onFocus={() => setSelectedAmount('custom')}
            />
          </View>
        </View>

        {/* Thank You Card */}
        <View style={styles.thankYouCard}>
          <View style={styles.heartContainer}>
            <Heart color={Colors.primary[500]} size={24} fill={Colors.primary[500]} />
          </View>
          <View style={{flex: 1}}>
            <AppText variant="h5" color={Colors.neutral[900]} style={{marginBottom: 4}}>
              Thank you!
            </AppText>
            <AppText variant="caption" color={Colors.neutral[600]}>
              Your contribution helps us continue our mission and create change.
            </AppText>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button 
          title="Continue" 
          onPress={handleContinue}
          disabled={selectedAmount === 'custom' && (!customAmount || isNaN(parseFloat(customAmount)) || parseFloat(customAmount) <= 0)}
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
  recipientGrid: {
    gap: verticalScale(12),
    marginBottom: verticalScale(15),
  },
  recipientBox: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
  },
  recipientBoxSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
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
    color: Colors.neutral[900],
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
  }
});
