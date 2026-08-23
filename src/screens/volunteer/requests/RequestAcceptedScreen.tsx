import React from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Check, ShoppingBag, Pill, FileText} from 'lucide-react-native';
import {AppText} from '../../../components/AppText';
import {formatDate} from '../../../utils/dateFormatter';
import {Button} from '../../../components/Button';
import {Colors} from '../../../theme/colors';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';

export default function RequestAcceptedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const request = route.params?.request || {};

  const getCategoryIcon = (title: string) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('pharmacy') || t.includes('medical') || t.includes('pill')) return <Pill color={Colors.primary[500]} size={20} />;
    if (t.includes('grocery') || t.includes('food')) return <ShoppingBag color={Colors.primary[500]} size={20} />;
    return <FileText color={Colors.primary[500]} size={20} />;
  };

  const ConfettiDots = () => {
    const dots = [
      { top: -20, left: 10, color: '#F87171', size: 6 },
      { top: -10, left: 70, color: '#FBBF24', size: 8 },
      { top: 20, left: 110, color: '#3B82F6', size: 6 },
      { top: 70, left: 110, color: '#F59E0B', size: 8 },
      { top: 110, left: 50, color: '#E0E7FF', size: 5 },
      { top: 90, left: -20, color: '#1D4ED8', size: 7 },
      { top: 30, left: -30, color: '#F87171', size: 5 },
      { top: 0, left: -10, color: '#FBBF24', size: 6 },
      { top: 110, left: 10, color: '#3B82F6', size: 6 },
      { top: 100, left: 90, color: '#F87171', size: 5 },
    ];
  
    return (
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{ width: 96, height: 96 }}>
          {dots.map((dot, i) => (
            <View 
              key={i} 
              style={{
                position: 'absolute',
                top: dot.top,
                left: dot.left,
                width: dot.size,
                height: dot.size,
                borderRadius: dot.size / 2,
                backgroundColor: dot.color,
              }}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.successIconContainer}>
          <ConfettiDots />
          <View style={styles.successIconWrapper}>
            <Check color={Colors.neutral[0]} size={48} strokeWidth={3} />
          </View>
        </View>
        
        <AppText variant="h3" color={Colors.neutral[900]} style={styles.title} center>
          Request Accepted!
        </AppText>
        
        <AppText variant="bodyLarge" color={Colors.neutral[600]} style={styles.subtitle} center>
          You have accepted the request.{'\n'}Check your schedule for details.
        </AppText>

        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              {getCategoryIcon(request.category?.title)}
            </View>
            <AppText variant="h6" color={Colors.neutral[900]}>
              {request.category?.title || 'Help Request'}
            </AppText>
          </View>
          
          <View style={styles.cardDetails}>
            <AppText variant="labelMedium" color={Colors.neutral[800]} style={styles.detailText}>
              {formatDate(request.preferred_date)}
            </AppText>
            {request.hours_required && (
              <AppText variant="labelMedium" color={Colors.neutral[800]} style={styles.detailText}>
                {request.hours_required} Hours
              </AppText>
            )}
            <AppText variant="labelMedium" color={Colors.neutral[800]} style={styles.detailText} numberOfLines={2}>
              {request.location?.address || request.meeting_location}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title="View in Schedule" 
          onPress={() => navigation.navigate('ScheduleTab')} 
          fullWidth 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: verticalScale(40),
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(160),
    width: moderateScale(160),
  },
  successIconWrapper: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary[500],
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    marginBottom: verticalScale(12),
  },
  subtitle: {
    marginBottom: verticalScale(40),
    lineHeight: 24,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: 12,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  cardDetails: {
    paddingLeft: horizontalScale(52),
    gap: verticalScale(12),
  },
  detailText: {
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(32),
  },
});
