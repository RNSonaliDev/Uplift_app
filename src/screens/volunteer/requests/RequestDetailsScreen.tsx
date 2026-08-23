import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Text,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {FontFamily} from '../../../theme/typography';
import {AppText} from '../../../components/AppText';
import {formatDate} from '../../../utils/dateFormatter';
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
import {api, getFullImageUrl} from '../../../api/client';

export default function RequestDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const request = route.params?.request || {};
  const [isAccepting, setIsAccepting] = useState(false);
  const [otp, setOtp] = useState('');
  const [isStarting, setIsStarting] = useState(false);

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

  const handleStartRequest = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit start code.');
      return;
    }
    if (!request.id) return;

    try {
      setIsStarting(true);
      await api.post(`/help_requests/${request.id}/start`, { start_code: otp });
      Alert.alert('Success', 'Task started successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to start request.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Badges */}
        <View style={styles.badgesRow}>
          <Text></Text>
          <View style={styles.categoryBadge}>
            <AppText variant="labelMedium" color={Colors.primary[600]}>
              {request.category?.title}
            </AppText>
          </View>
          <View style={styles.newBadge}>
            <AppText variant="labelMedium" color={Colors.warning[500]}>
              {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'New'}
            </AppText>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {request.beneficiary?.profile_image_url ? (
              <Image 
                source={{uri: getFullImageUrl(request.beneficiary.profile_image_url) as string}} 
                style={styles.avatar} 
              />
            ) : (
              <View style={[styles.avatar, {justifyContent: 'center', alignItems: 'center'}]}>
                <AppText variant="h6" color={Colors.neutral[600]}>
                  {request.beneficiary?.first_name 
                    ? `${request.beneficiary.first_name.charAt(0)}${request.beneficiary.last_name ? request.beneficiary.last_name.charAt(0) : ''}`.toUpperCase() 
                    : 'SJ'}
                </AppText>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <AppText variant="h5" color={Colors.neutral[900]} style={{marginBottom: verticalScale(4)}}>
              {request.beneficiary?.first_name ? `${request.beneficiary.first_name} ${request.beneficiary.last_name || ''}` : 'Sarah Johnson'}
            </AppText>
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
            <View style={styles.detailContentColumn}>
              <AppText variant="bodyMedium" color={Colors.neutral[600]}>Date</AppText>
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{fontFamily: FontFamily.medium, marginTop: verticalScale(4), lineHeight: 22}}>
                {formatDate(request.preferred_date)}
              </AppText>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Clock color={Colors.neutral[500]} size={24} />
            <View style={styles.detailContentColumn}>
              <AppText variant="bodyMedium" color={Colors.neutral[600]}>Time</AppText>
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{fontFamily: FontFamily.medium, marginTop: verticalScale(4), lineHeight: 22}}>
                {request.hours_required}
              </AppText>
            </View>
          </View>

          <View style={styles.detailItem}>
            <MapPin color={Colors.neutral[500]} size={24} />
            <View style={styles.detailContentColumn}>
              <AppText variant="bodyMedium" color={Colors.neutral[600]}>Location</AppText>
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{fontFamily: FontFamily.medium, marginTop: verticalScale(4), lineHeight: 22}}>
                {request.location?.address}
              </AppText>
            </View>
          </View>

          {request.notes ? (
            <View style={styles.detailItem}>
              <FileText color={Colors.neutral[500]} size={24} />
              <View style={styles.detailContentColumn}>
                <AppText variant="bodyMedium" color={Colors.neutral[600]}>Note</AppText>
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginTop: verticalScale(4), lineHeight: 22}}>
                  {request.notes}
                </AppText>
              </View>
            </View>
          ) : null}

        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!['accepted', 'in_progress', 'completed', 'cancelled'].includes(request.status?.toLowerCase()) && (
        <View style={styles.actionContainer}>
          <Button 
            title="Accept Request" 
            onPress={handleAccept} 
            loading={isAccepting}
            style={styles.acceptBtn} 
          />
        </View>
      )}

      {request.status?.toLowerCase() === 'accepted' && (
        <View style={styles.actionContainer}>
          <View style={styles.otpInputContainer}>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{marginBottom: 12}} center>
              Enter the 6-digit start code from the beneficiary
            </AppText>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder="000000"
              placeholderTextColor={Colors.neutral[300]}
              maxLength={6}
            />
          </View>
          <Button 
            title="Start Request" 
            onPress={handleStartRequest} 
            loading={isStarting}
            disabled={otp.length !== 6 || isStarting}
            style={styles.acceptBtn} 
          />
        </View>
      )}

      {request.status?.toLowerCase() === 'in_progress' && (
        <View style={styles.actionContainer}>
          <Button 
            title="Complete Request" 
            onPress={() => navigation.navigate('CompleteRequest', { request })} 
            style={styles.acceptBtn} 
          />
        </View>
      )}

      {request.status?.toLowerCase() === 'completed' && (!request.ratings || request.ratings.length === 0) && (
        <View style={styles.actionContainer}>
          <Button 
            title="Rate Experience" 
            onPress={() => navigation.navigate('RateExperience', { request })} 
            style={styles.acceptBtn} 
          />
        </View>
      )}
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
    // paddingVertical: verticalScale(16),
  },
  iconButton: {
    padding: moderateScale(8),
    marginLeft: -moderateScale(8),
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(24),
    // paddingTop: verticalScale(8),
    paddingBottom: verticalScale(40),
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
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
    marginBottom: verticalScale(20),
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
    marginBottom: verticalScale(24),
  },
  detailsSection: {
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
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
  otpInputContainer: {
    marginBottom: verticalScale(20),
    alignItems: 'center',
    width: '100%',
  },
  otpInput: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: verticalScale(12),
    width: '100%',
  },
  acceptBtn: {
    marginBottom: verticalScale(12),
  },
});
