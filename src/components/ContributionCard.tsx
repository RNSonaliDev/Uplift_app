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

export default function ContributionCard({ item, onPress, style }: ContributionCardProps) {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Calendar color={Colors.primary[500]} size={24} />
        <View style={styles.statusBadgeIcon}>
          {(item.status || 'Completed') === 'Completed' ? (
            <CheckCircle2 color={Colors.success || '#4CAF50'} size={14} fill={Colors.neutral[0]} />
          ) : (item.status || 'Completed') === 'Pending' ? (
            <Clock color={Colors.warning || '#FFC107'} size={14} fill={Colors.neutral[0]} />
          ) : (
            <XCircle color={Colors.error || '#F44336'} size={14} fill={Colors.neutral[0]} />
          )}
        </View>
      </View>
      
      <View style={styles.cardInfo}>
        <AppText variant="bodyLarge" weight="semiBold" color={Colors.neutral[900]} numberOfLines={1}>
          {item.reference_number || `#${item.id}`}
        </AppText>
        <AppText variant="caption" color={Colors.neutral[500]}>
          {item.created_at ? formatDate(item.created_at) : 'N/A'}
        </AppText>
      </View>
      
      <View style={styles.cardAmount}>
        <AppText variant="h5" color={Colors.neutral[900]} style={{marginBottom: verticalScale(4)}}>
          ${item.amount}
        </AppText>
        <View style={[styles.statusBadge, {
          backgroundColor: (item.status || 'Completed').toLowerCase() === 'completed' ? '#E8F5E9' : 
                           (item.status || 'Completed').toLowerCase() === 'pending' ? '#FFF8E1' : 
                           '#FFEBEE'
        }]}>
          <AppText 
            variant="caption" 
            weight="semiBold"
            color={(item.status || 'Completed').toLowerCase() === 'completed' ? (Colors.success || '#4CAF50') : 
                   (item.status || 'Completed').toLowerCase() === 'pending' ? (Colors.warning || '#FFC107') : 
                   (Colors.error || '#F44336')}
          >
            {(item.status || 'Completed').charAt(0).toUpperCase() + (item.status || 'Completed').slice(1).toLowerCase()}
          </AppText>
        </View>
      </View>
      
      <ChevronRight color={Colors.neutral[400]} size={20} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(16),
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
