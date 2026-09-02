import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {FontFamily} from '../../../theme/typography';
import {AppText} from '../../../components/AppText';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {Button} from '../../../components/Button';
import {TaskParentConfirmationModal} from '../../../components';
import {
  ChevronLeft,
  MoreHorizontal,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Star,
  Type,
} from 'lucide-react-native';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {api, getFullImageUrl} from '../../../api/client';

export default function RequestDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [request, setRequest] = useState<any>(route.params?.request || {});
  const forceAction = route.params?.forceAction;

  const [isAccepting, setIsAccepting] = useState(false);
  const [otp, setOtp] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const [requiresParentAccept, setRequiresParentAccept] = useState(false);
  const [isParentModalVisible, setIsParentModalVisible] = useState(false);
  const [parentEmail, setParentEmail] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchRequest = async () => {
        if (request.id) {
          try {
            const data = await api.get(`/help_requests/${request.id}`);
            if (data) {
              setRequest(data);
            }
          } catch (e) {
            console.error('Failed to fetch request details', e);
          }
        }
      };
      const fetchProfile = async () => {
        try {
          const profileData = await api.get('/profile');
          console.log('profileData', profileData);
          if ((profileData as any)?.teen_requires_parent_consent) {
             setRequiresParentAccept(true);
             setParentEmail((profileData as any)?.parent_email || '');
          }
        } catch (e) {
          console.error('Failed to fetch profile', e);
        }
      };
      fetchRequest();
      fetchProfile();
    }, [request.id])
  );

  const showAcceptBtn = !forceAction && (!request.status || request.status.toLowerCase() === 'pending');
  const showStartBtn = forceAction === 'start' || request.status?.toLowerCase() === 'accepted';
  const showCompleteBtn = forceAction === 'complete' || request.status?.toLowerCase() === 'in_progress';
  const showRateBtn = forceAction === 'rate' || (request.status?.toLowerCase() === 'completed' && (!request.ratings || request.ratings.length === 0));

  const handleAcceptClick = async () => {
    if (!request.id) return;
    if (requiresParentAccept) {
      setIsParentModalVisible(true);
    } else {
      try {
        setIsAccepting(true);
        await api.post(`/help_requests/${request.id}/accept`);
        navigation.navigate('RequestAccepted', { request });
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.data?.errors?.[0] || error?.message || 'Failed to accept request.'
        });
      } finally {
        setIsAccepting(false);
      }
    }
  };

  const handleConfirmAccept = async () => {
    if (!request.id) return;
    try {
      setIsAccepting(true);
      await api.post(`/help_requests/${request.id}/send_parent_accept_code`);
      Toast.show({
        type: 'info',
        text1: 'Approval Required',
        text2: 'An email has been sent to your parent.',
      });
      navigation.navigate('ParentTaskVerification', { request, parentEmail });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to send parent approval code.'
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleStartRequest = async () => {
    if (otp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter a valid 6-digit start code.'
      });
      return;
    }
    if (!request.id) return;

    try {
      setIsStarting(true);
      await api.post(`/help_requests/${request.id}/start`, { start_code: otp });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Task started successfully!',
        onHide: () => navigation.goBack()
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to start request.'
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color={Colors.neutral[900]} size={28} strokeWidth={2} />
        </TouchableOpacity>
        {/* <AppText variant="h6" color={Colors.neutral[900]}>Request Details</AppText> */}
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        

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
                    : ''}
                </AppText>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <AppText variant="labelLarge" color={Colors.neutral[900]} style={{marginBottom: 4}}>
              {request.beneficiary?.first_name ? `${request.beneficiary.first_name} ${request.beneficiary.last_name || ''}` : ''}
            </AppText>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Request Details Section */}
        <View style={styles.detailsSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: verticalScale(16)}}>
            <View>
              <AppText variant="labelLarge" color={Colors.neutral[900]}>
                Request Details
              </AppText>
              <AppText variant="bodySmall" color={Colors.neutral[500]} style={{ marginTop: 2 }}>
                #{request.reference_number || request.id}
              </AppText>
            </View>
            <View style={[styles.categoryBadge, { paddingHorizontal: horizontalScale(16), paddingVertical: verticalScale(6) }]}>
              <AppText variant="labelMedium" color={Colors.primary[600]}>
                {request.category?.title || 'Shopping'}
              </AppText>
            </View>
          </View>

          {request.title ? (
            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <Type color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Title</AppText>
              </View>
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
                {request.title}
              </AppText>
            </View>
          ) : null}

          {/* Date */}
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Calendar color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Date</AppText>
            </View>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
              {formatDate(request.preferred_date) || 'May 22, 2024'}
            </AppText>
          </View>

          {/* Time */}
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Clock color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Time</AppText>
            </View>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
              {request.preferred_start_time ? `${formatTime12Hour(request.preferred_start_time)} - ${formatTime12Hour(request.preferred_end_time)}` : '2:00 PM - 3:00 PM'}
            </AppText>
          </View>

          {/* Description */}
          {request.description ? (
            <View style={styles.detailColumnItem}>
              <View style={styles.detailLabelRow}>
                <FileText color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Description</AppText>
              </View>
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{marginLeft: 28, marginTop: 4, lineHeight: 22}}>
                {request.description}
              </AppText>
            </View>
          ) : null}

          {/* Location */}
          <View style={styles.detailColumnItem}>
            <View style={styles.detailLabelRow}>
              <MapPin color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Location</AppText>
            </View>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{marginLeft: 28, marginTop: 4, lineHeight: 22}}>
              {request.location?.address}
            </AppText>
          </View>

          {/* Notes */}
          {request.notes ? (
            <View style={styles.detailColumnItem}>
              <View style={styles.detailLabelRow}>
                <FileText color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Notes</AppText>
              </View>
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{marginLeft: 28, marginTop: 4, lineHeight: 22}}>
                {request.notes}
              </AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {showAcceptBtn && (
        <View style={styles.actionContainer}>
          <Button 
            title="Accept Request" 
            onPress={handleAcceptClick} 
            loading={isAccepting}
            style={styles.acceptBtn} 
          />
        </View>
      )}

      {showStartBtn && (
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

      {showCompleteBtn && (
        <View style={styles.actionContainer}>
          <Button 
            title="Complete Request" 
            onPress={() => navigation.navigate('CompleteRequest', { request })} 
            style={styles.acceptBtn} 
          />
        </View>
      )}

      {showRateBtn && (
        <View style={styles.actionContainer}>
          <Button 
            title="Rate Experience" 
            onPress={() => navigation.navigate('RateExperience', { request })} 
            style={styles.acceptBtn} 
          />
        </View>
      )}

      <TaskParentConfirmationModal 
        visible={isParentModalVisible}
        onClose={() => setIsParentModalVisible(false)}
        onConfirm={handleConfirmAccept}
      />
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
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
  },
  iconButton: {
    padding: moderateScale(8),
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(40),
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(10),
    borderRadius: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    marginTop: verticalScale(8),
  },
  avatarContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
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
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginBottom: verticalScale(24),
  },
  detailsSection: {
    flex: 1,
  },
  detailRowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  detailColumnItem: {
    marginBottom: verticalScale(20),
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionContainer: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(32), 
    backgroundColor: Colors.neutral[0],
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
  },
});
