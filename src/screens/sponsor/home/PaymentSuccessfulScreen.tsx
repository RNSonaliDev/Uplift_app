import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Check } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import { formatDate, formatTime12Hour } from '../../../utils/dateFormatter';
import { authApi } from '../../../api/auth';

export default function PaymentSuccessfulScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const amount = route.params?.amount || 0;
  const donation = route.params?.donation || null;
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile();
        setProfile(data);
      } catch (e) {
        console.log('Error fetching profile in PaymentSuccessfulScreen', e);
      }
    };
    fetchProfile();
  }, []);

  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const netAmount = (numAmount * 0.95).toFixed(2);
  const firstName = profile?.profiles?.sponsor?.first_name || profile?.first_name || 'Supporter';
  const email = profile?.profiles?.sponsor?.email || profile?.email || 'your email';

  const recipientType = route.params?.recipientType || donation?.recipient_type;
  const RECIPIENT_LABELS: Record<string, string> = {
    volunteer: 'Reward the volunteers',
    beneficiary: 'Support the beneficiaries',
    split: 'volunteers and beneficiaries (split equally)',
    none: 'whoever needs it most',
  };
  const allocationPreference = RECIPIENT_LABELS[recipientType] || 'the community fund';

  const handleViewContributions = () => {
    navigation.popToTop();
    navigation.navigate('ContributionsTab', { screen: 'ContributionsList', params: { activeTab: 'Success', timestamp: Date.now() } });
  };

  const handleBackToDashboard = () => {
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Success Graphic */}
        <View style={styles.graphicContainer}>
          <View style={styles.successCircle}>
            <Check color={Colors.neutral[0]} size={48} strokeWidth={3} />
          </View>
          {/* Decorative Confetti */}
          <View style={[styles.confetti, { backgroundColor: '#FFD700', top: -10, left: -20 }]} />
          <View style={[styles.confetti, { backgroundColor: '#FF6B6B', top: 20, right: -30 }]} />
          <View style={[styles.confetti, { backgroundColor: '#4ECDC4', bottom: -10, left: 10 }]} />
          <View style={[styles.confetti, { backgroundColor: '#45B7D1', bottom: 10, right: -10 }]} />
        </View>

        <AppText variant="h3" color={Colors.neutral[900]} style={styles.title} center>
          Payment Successful!
        </AppText>
        <AppText variant="bodyLarge" color={Colors.neutral[600]} style={styles.subtitle} center>
          Thank you for your generous support.
        </AppText>

        {/* Custom Thank You Confirmation Card */}
        <View style={styles.thankYouCard}>
          <AppText variant="bodyMedium" color={Colors.neutral[800]} style={styles.thankYouText}>
            Thank you, {firstName}. 💙{'\n\n'}
            Your contribution of ${numAmount.toFixed(2)} has been added to the iUpliftU Community Fund. ${netAmount} will be distributed to {allocationPreference} in the next allocation cycle. A tax receipt has been sent to {email}. Please keep it for your records. Because of you, someone in your community gets the help they need today.
          </AppText>
        </View>

        {/* Receipt Details */}
        <View style={styles.receiptContainer}>
          <View style={styles.receiptRow}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]}>Amount Paid</AppText>
            <AppText variant="h5" color={Colors.neutral[900]}>${numAmount.toFixed(2)}</AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]}>Payment Date</AppText>
            <AppText variant="bodyMedium" weight="semiBold" color={Colors.neutral[900]}>
              {donation?.created_at ? formatDate(donation.created_at) : formatDate(new Date().toISOString())}
            </AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]}>Payment Time</AppText>
            <AppText variant="bodyMedium" weight="semiBold" color={Colors.neutral[900]}>
              {donation?.created_at ? formatTime12Hour(donation.created_at) : formatTime12Hour(new Date().toISOString())}
            </AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]}>Reference</AppText>
            <AppText variant="bodyMedium" weight="semiBold" color={Colors.neutral[900]}>
              {donation?.reference_number || `UPLIFT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`}
            </AppText>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button 
          title="View My Contributions" 
          onPress={handleViewContributions}
          style={styles.primaryBtn}
        />
        <Button 
          title="Back to Dashboard" 
          onPress={handleBackToDashboard}
          variant="outline"
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
    height: verticalScale(40),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(24),
    alignItems: 'center',
  },
  graphicContainer: {
    marginBottom: verticalScale(24),
    position: 'relative',
  },
  successCircle: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  confetti: {
    position: 'absolute',
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  title: {
    marginBottom: verticalScale(8),
  },
  subtitle: {
    marginBottom: verticalScale(24),
  },
  thankYouCard: {
    width: '100%',
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderRadius: 16,
    padding: moderateScale(18),
    marginBottom: verticalScale(24),
  },
  thankYouText: {
    lineHeight: fontScale(22),
  },
  receiptContainer: {
    width: '100%',
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 16,
    padding: moderateScale(16),
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
  },
  footer: {
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(32),
  },
  primaryBtn: {
    marginBottom: verticalScale(12),
  }
});
