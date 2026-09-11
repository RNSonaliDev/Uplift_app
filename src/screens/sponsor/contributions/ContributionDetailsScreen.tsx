import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { ChevronLeft, Calendar } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale } from '../../../utils/responsive';
import { formatDate, formatTime12Hour } from '../../../utils/dateFormatter';

export default function ContributionDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const contribution = route.params?.contribution || {};

  const normalizedStatus = (contribution.status || 'Completed').toLowerCase();
  const isSuccess = normalizedStatus === 'completed' || normalizedStatus === 'succeeded';
  const isPending = normalizedStatus === 'pending';

  const statusBgColor = isSuccess ? '#E8F5E9' : isPending ? '#FFF8E1' : '#FFEBEE';
  const statusTextColor = isSuccess ? (Colors.success || '#4CAF50') : isPending ? (Colors.warning || '#FFC107') : (Colors.error || '#F44336');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h4" color={Colors.neutral[0]}>
          Contribution Details
        </AppText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Top Icon */}
        <View style={styles.graphicContainer}>
          <View style={styles.iconCircle}>
            <Calendar color={Colors.primary[500]} size={40} />
          </View>
        </View>

        {/* Amount & Status */}
        <View style={styles.amountContainer}>
          <AppText variant="h1" color={Colors.neutral[900]}>
            ${contribution.amount || '0'}
          </AppText>
          <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
            <AppText 
              variant="caption" 
              weight="semiBold"
              color={statusTextColor}
            >
              {(contribution.status || 'Completed').charAt(0).toUpperCase() + (contribution.status || 'Completed').slice(1).toLowerCase()}
            </AppText>
          </View>
        </View>

        {/* Receipt Details */}
        <View style={styles.receiptContainer}>
          <View style={styles.receiptRow}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]}>Payment Date</AppText>
            <AppText variant="bodyMedium" weight="semiBold" color={Colors.neutral[900]}>
              {contribution.created_at ? `${formatDate(contribution.created_at)} • ${formatTime12Hour(contribution.created_at)}` : 'N/A'}
            </AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]}>Transaction ID</AppText>
            <AppText variant="bodyMedium" weight="semiBold" color={Colors.neutral[900]}>TXN_8F7J2K9L4M3N</AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]}>Payment Method</AppText>
            <AppText variant="bodyMedium" weight="semiBold" color={Colors.neutral[900]}>Visa ending in 4242</AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]}>Billing ZIP Code</AppText>
            <AppText variant="bodyMedium" weight="semiBold" color={Colors.neutral[900]}>10001</AppText>
          </View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]}>Status</AppText>
            <AppText 
              variant="bodyMedium" 
              weight="semiBold" 
              color={statusTextColor}
            >
              {(contribution.status || 'Completed').charAt(0).toUpperCase() + (contribution.status || 'Completed').slice(1).toLowerCase()}
            </AppText>
          </View>
        </View>

      </ScrollView>
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
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(40),
    alignItems: 'center',
  },
  graphicContainer: {
    marginBottom: verticalScale(24),
  },
  iconCircle: {
    width: moderateScale(88),
    height: moderateScale(88),
    borderRadius: moderateScale(44),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(16),
    marginLeft: horizontalScale(12),
  },
  receiptContainer: {
    width: '100%',
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 16,
    padding: moderateScale(20),
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
  },
});
