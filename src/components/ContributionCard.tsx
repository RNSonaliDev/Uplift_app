import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { AppText } from './AppText';
import { Calendar, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';
import { formatDate } from '../utils/dateFormatter';
import { Donation } from '../api/donations';

interface ContributionCardProps {
  item: Donation;
  onPress: () => void;
  style?: any;
}

const RECIPIENT_OPTIONS = [
  { id: 'volunteer', label: 'Reward the volunteers' },
  { id: 'beneficiary', label: 'Support the beneficiaries' },
  { id: 'split', label: 'Split equally' },
  { id: 'none', label: 'Whoever needs it most' },
];

const getRecipientLabel = (type?: string | null): string => {
  if (!type) return 'Whoever needs it most';
  const key = type.toLowerCase();
  const found = RECIPIENT_OPTIONS.find((r) => r.id === key);
  if (found) return found.label;
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
};

export default function ContributionCard({ item, onPress, style }: ContributionCardProps) {
  const normalizedStatus = (item.status || 'Completed').toLowerCase();
  const isSuccess = normalizedStatus === 'completed' || normalizedStatus === 'success';
  const isPending = normalizedStatus === 'pending';

  const statusBgColor = isSuccess ? '#E8F5E9' : isPending ? '#FFF8E1' : '#FFEBEE';
  const statusTextColor = isSuccess ? (Colors.success || '#4CAF50') : isPending ? (Colors.warning || '#FFC107') : (Colors.error || '#F44336');

  return (
    <TouchableOpacity style={[styles.card, style]} activeOpacity={1}>
      <View style={styles.cardInfo}>
        <AppText variant="bodyLarge" weight="semiBold" color={Colors.neutral[900]} numberOfLines={1}>
          {item.reference_number || `#${item.id}`}
        </AppText>
        <AppText variant="caption" color={Colors.neutral[500]}>
          {item.created_at ? formatDate(item.created_at) : 'N/A'}
        </AppText>
        <AppText variant="caption" weight="semiBold" color={Colors.primary[500]} style={{marginTop: verticalScale(2)}}>
          {getRecipientLabel(item.recipient_type)}
        </AppText>
      </View>
      
      <View style={styles.cardAmount}>
        <AppText variant="h5" color={Colors.neutral[900]} style={{marginBottom: verticalScale(4)}}>
          ${item.amount}
        </AppText>
        <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
          <AppText 
            variant="caption" 
            // weight="semiBold"
            color={statusTextColor}
          >
            {(item.status || 'Completed').charAt(0).toUpperCase() + (item.status || 'Completed').slice(1).toLowerCase()}
          </AppText>
        </View>
      </View>
    
      {/* <ChevronRight color={Colors.neutral[400]} size={20} /> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(14),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: 24,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
    position: 'relative',
  },
  statusBadgeIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.neutral[0],
    borderRadius: 10,
  },
  cardInfo: {
    flex: 1,
    marginRight: horizontalScale(8),
  },
  cardAmount: {
    alignItems: 'flex-end',
    marginRight: horizontalScale(8),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  }
});
