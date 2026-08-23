import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {Button} from '../../../components/Button';
import {
  ArrowLeft,
  MoreHorizontal,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Star,
} from 'lucide-react-native';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {api} from '../../../api/client';

export default function RequestDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const request = route.params?.request || {};
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleAccept = async () => {
    if (!request.id) return;
    try {
      setIsAccepting(true);
      await api.post(`/help_requests/${request.id}/accept`);
      navigation.navigate('RequestAccepted', { request });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to accept request.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!request.id) return;
    try {
      setIsDeclining(true);
      await api.post(`/help_requests/${request.id}/cancel`);
      Alert.alert('Success', 'Request declined.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to decline request.');
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MoreHorizontal color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Badges */}
        <View style={styles.badgesRow}>
          <View style={styles.categoryBadge}>
            <AppText variant="caption" color={Colors.primary[600]} style={{fontWeight: '600'}}>
              {request.category?.title || 'Help Request'}
            </AppText>
          </View>
          <View style={styles.newBadge}>
            <AppText variant="caption" color={Colors.warning[500]} style={{fontWeight: '600'}}>
              {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'New'}
            </AppText>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{uri: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=F3F4F6&color=4B5563'}} 
              style={styles.avatar} 
            />
          </View>
          <View style={styles.profileInfo}>
            <AppText variant="h5" color={Colors.neutral[900]} style={{marginBottom: verticalScale(4)}}>
              {request.beneficiary?.first_name ? `${request.beneficiary.first_name} ${request.beneficiary.last_name || ''}` : 'Sarah Johnson'}
            </AppText>
            <View style={styles.ratingRow}>
              <Star color={Colors.warning[500]} size={16} fill={Colors.warning[500]} />
              <AppText variant="bodyMedium" color={Colors.neutral[700]} style={{marginLeft: horizontalScale(4)}}>
                4.8 (32)
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Request Details Section */}
        <View style={styles.detailsSection}>
          <AppText variant="h5" color={Colors.neutral[900]} style={{marginBottom: verticalScale(20)}}>
            Request Details
          </AppText>

          <View style={styles.detailItem}>
            <Calendar color={Colors.neutral[500]} size={24} />
            <View style={styles.detailContentRow}>
              <AppText variant="bodyMedium" color={Colors.neutral[600]}>Date</AppText>
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{fontWeight: '500'}}>
                {request.preferred_date || 'May 22, 2024'}
              </AppText>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Clock color={Colors.neutral[500]} size={24} />
            <View style={styles.detailContentRow}>
              <AppText variant="bodyMedium" color={Colors.neutral[600]}>Time</AppText>
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{fontWeight: '500'}}>
                {request.preferred_time || '2:00 PM - 3:00 PM'}
              </AppText>
            </View>
          </View>

          <View style={styles.detailItem}>
            <MapPin color={Colors.neutral[500]} size={24} />
            <View style={styles.detailContentColumn}>
              <AppText variant="bodyMedium" color={Colors.neutral[600]}>Location</AppText>
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{fontWeight: '500', marginTop: verticalScale(4), lineHeight: 22}}>
                {request.location?.address || request.meeting_location || 'Central Park • Main Entrance\nNew York, NY 10022'}
              </AppText>
            </View>
          </View>

          <View style={styles.detailItem}>
            <FileText color={Colors.neutral[500]} size={24} />
            <View style={styles.detailContentColumn}>
              <AppText variant="bodyMedium" color={Colors.neutral[600]}>Note</AppText>
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginTop: verticalScale(4), lineHeight: 22}}>
                {request.notes || 'Need help with weekly grocery shopping.'}
              </AppText>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button 
          title="Accept Request" 
          onPress={handleAccept} 
          loading={isAccepting}
          disabled={isDeclining}
          style={styles.acceptBtn} 
        />
        <Button 
          title="Decline" 
          onPress={handleDecline} 
          loading={isDeclining}
          disabled={isAccepting}
          variant="outline" 
          style={styles.declineBtn} 
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(16),
  },
  iconButton: {
    padding: moderateScale(8),
    marginLeft: -moderateScale(8),
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(40),
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(24),
    gap: horizontalScale(12),
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(6),
    borderRadius: 20,
  },
  newBadge: {
    backgroundColor: Colors.warning[50],
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  avatarContainer: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    overflow: 'hidden',
    backgroundColor: Colors.neutral[100],
    marginRight: horizontalScale(16),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginBottom: verticalScale(32),
  },
  detailsSection: {
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(24),
  },
  detailContentRow: {
    flex: 1,
    marginLeft: horizontalScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailContentColumn: {
    flex: 1,
    marginLeft: horizontalScale(16),
  },
  actionContainer: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(32), // Accounts for bottom safe area
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  acceptBtn: {
    marginBottom: verticalScale(12),
  },
  declineBtn: {
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
});
