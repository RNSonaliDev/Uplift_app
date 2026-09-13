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
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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
  Info,
  MessageCircle,
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
  const [isStarting, setIsStarting] = useState(false);

  const [requiresParentAccept, setRequiresParentAccept] = useState(false);
  const [isParentModalVisible, setIsParentModalVisible] = useState(false);
  const [parentEmail, setParentEmail] = useState('');

  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isFullScreenImageVisible, setIsFullScreenImageVisible] = useState(false);

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
          const profileData: any = await api.get('/profile');
          if (profileData?.id) setCurrentUserId(profileData.id);
          else if (profileData?.data?.id) setCurrentUserId(profileData.data.id);

          console.log('profileData', profileData);
          if (profileData?.teen_requires_parent_consent) {
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

  const isOrgRequest = request.request_type === 'organization';

  const showAcceptBtn = !forceAction && (!request.status || request.status.toLowerCase() === 'pending');
  const showStartBtn = forceAction === 'start' || request.status?.toLowerCase() === 'accepted';
  const showStartWithOtpBtn = forceAction === 'start_with_otp' || request.status?.toLowerCase() === 'on_the_way';
  const showCompleteBtn = !isOrgRequest && (forceAction === 'complete' || request.status?.toLowerCase() === 'in_progress');
  
  const hasRated = request.ratings?.some((r: any) => r.rater_id === currentUserId);
  const showRateBtn = forceAction === 'rate' || (request.status?.toLowerCase() === 'completed' && !hasRated);

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

  const handleOnTheWay = async () => {
    if (!request.id) return;

    try {
      setIsStarting(true);
      await api.post(`/help_requests/${request.id}/on_the_way`);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Status updated to On the way!',
        onHide: () => navigation.goBack()
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to update status.'
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartWithOtp = async () => {
    if (otpCode.length !== 6) {
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
      await api.post(`/help_requests/${request.id}/start`, { start_code: otpCode });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Task started successfully!',
        onHide: () => {
          setIsOtpModalVisible(false);
          navigation.goBack();
        }
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


    const handleComplete = async () => {
      if (!request.id) return;
      try {
        await api.post(`/help_requests/${request.id}/complete`);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Request marked as completed!',
          onHide: () => navigation.navigate('RateExperience', { request })
        });
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.data?.errors?.[0] || error?.message || 'Failed to complete request.'
        });
      } finally {
      }
    };

    const handleCancelRequest = () => {
      Alert.alert('Cancel Request', 'Are you sure you want to cancel this request?', [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/help_requests/${request.id}/withdraw`);
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Request cancelled successfully.',
                onHide: () => navigation.goBack()
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.data?.errors?.[0] || error?.message || 'Failed to cancel request.'
              });
            }
          }
        }
      ]);
    };
  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color={Colors.neutral[0]} size={28} strokeWidth={2} />
        </TouchableOpacity>
        <AppText variant="h5" color={Colors.neutral[0]}>Request Details</AppText>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        

        {/* Profile Section */}
        {/* Profile Section */}
        {(request.status && request.status.toLowerCase() !== 'pending') && (
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {(request.organization?.profile_image_url || request.beneficiary?.profile_image_url) ? (
                <TouchableOpacity onPress={() => setIsFullScreenImageVisible(true)} style={{flex: 1}}>
                  <Image 
                    source={{uri: getFullImageUrl(request.organization?.profile_image_url || request.beneficiary?.profile_image_url) as string}} 
                    style={styles.avatar} 
                  />
                </TouchableOpacity>
              ) : (
                <View style={[styles.avatar, {justifyContent: 'center', alignItems: 'center'}]}>
                  <AppText variant="h6" color={Colors.neutral[0]}>
                    {request.organization?.organization_name 
                      ? request.organization.organization_name.charAt(0).toUpperCase()
                      : (request.beneficiary?.first_name 
                          ? `${request.beneficiary.first_name.charAt(0)}${request.beneficiary.last_name ? request.beneficiary.last_name.charAt(0) : ''}`.toUpperCase() 
                          : 'O')}
                  </AppText>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <AppText variant="labelLarge" color={Colors.neutral[900]} style={{marginBottom: 4}}>
                {request.organization?.organization_name || (request.beneficiary?.first_name ? `${request.beneficiary?.first_name || ''} ${request.beneficiary?.last_name || ''}`.trim() : 'Organization')}
              </AppText>
              <AppText variant="caption" color={Colors.neutral[500]}>
                {request.request_type === 'organization' ? 'Organization' : 'Beneficiary'}
              </AppText>
            </View>

            {request.status?.toLowerCase() !== 'in_progress' && request.status?.toLowerCase() !== 'completed' && (
              <TouchableOpacity 
                style={styles.messageIconContainer}
                onPress={() => {
                  const assignId = request.assignments?.[0]?.id || 0;
                  const recipientName = request.organization?.organization_name || 
                    (request.beneficiary?.first_name ? `${request.beneficiary?.first_name || ''} ${request.beneficiary?.last_name || ''}`.trim() : 'User');
                  const recipientAvatar = request.organization?.profile_image_url || request.beneficiary?.profile_image_url;
                  navigation.navigate('ChatScreen', {
                    helpRequestId: request.id,
                    assignmentId: assignId,
                    recipientName,
                    recipientAvatar,
                    requestStatus: request.status,
                  });
                }}
              >
                <MessageCircle color={Colors.primary[500]} size={24} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.divider} />

        {/* Request Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <FileText color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Category</AppText>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end', paddingLeft: 16 }}>
              <View style={[styles.categoryBadge, { paddingHorizontal: horizontalScale(12), paddingVertical: verticalScale(6), borderRadius: 16 }]}>
                <AppText variant="labelMedium" color={Colors.primary[600]} style={{ textAlign: 'center' }}>
                  {request.category?.title || 'Shopping'}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <FileText color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Reference</AppText>
            </View>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
              #{request.reference_number || request.id}
            </AppText>
          </View>

          {request.title ? (
            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <FileText color={Colors.neutral[600]} size={20} />
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

          {/* Distance */}
          {request.service_radius_km != null ? (
            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <MapPin color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Distance</AppText>
              </View>
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
                {parseFloat(request.service_radius_km).toFixed(1)} km
              </AppText>
            </View>
          ) : null}

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

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Info color={Colors.primary[500]} size={24} />
          <AppText variant="caption" color={Colors.primary[500]} style={styles.securityText}>
            For your safety, never share personal information or belongings like your SSN or bank details with anyone.
          </AppText>
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
        <View style={[styles.actionContainer, { flexDirection: 'row', alignItems: 'center' }]}>
          <TouchableOpacity 
            style={[styles.cancelTextBtn, { marginTop: 0, marginRight: 16 }]} 
            onPress={handleCancelRequest}
          >
            <AppText variant="buttonMedium" style={{ color: Colors.error }}>Cancel Request</AppText>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Button 
              title="On the way" 
              onPress={handleOnTheWay} 
              loading={isStarting}
              style={styles.acceptBtn} 
              fullWidth
            />
          </View>
        </View>
      )}

      {showStartWithOtpBtn && (
        <View style={[styles.actionContainer, { flexDirection: 'row', alignItems: 'center' }]}>
          <TouchableOpacity 
            style={[
              styles.cancelTextBtn, 
              { marginTop: 0, marginRight: !isOrgRequest ? 16 : 0 },
              isOrgRequest && { flex: 1 }
            ]} 
            onPress={handleCancelRequest}
          >
            <AppText variant="buttonMedium" style={{ color: Colors.error }}>Cancel Request</AppText>
          </TouchableOpacity>
          {!isOrgRequest && (
            <View style={{ flex: 1 }}>
              <Button 
                title="Start Request" 
                onPress={() => setIsOtpModalVisible(true)} 
                style={styles.acceptBtn} 
                fullWidth
              />
            </View>
          )}
        </View>
      )}



      {showCompleteBtn && (
        <View style={styles.actionContainer}>
          <Button 
            title="Complete Request" 
            onPress={() => handleComplete()} 
            style={styles.acceptBtn} 
          />
        </View>
      )}



      {showRateBtn && !request.ratings?.some((r: any) => r.rater_id === currentUserId) && (
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

      <Modal
        visible={isOtpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOtpModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={() => setIsOtpModalVisible(false)}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <View style={{ backgroundColor: Colors.neutral[0], padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <AppText variant="h5" color={Colors.neutral[900]} center style={{ marginBottom: 12 }}>Enter Start Code</AppText>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} center style={{ marginBottom: 24 }}>
              Please enter the 6-digit start code provided by the {request.request_type === 'organization' ? 'organization' : 'beneficiary'} to begin this request.
            </AppText>
            <TextInput
              style={styles.otpInput}
              value={otpCode}
              onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder="000000"
              placeholderTextColor={Colors.neutral[300]}
              maxLength={6}
            />
            <Button 
              title="Start Job" 
              onPress={handleStartWithOtp}
              loading={isStarting}
              disabled={otpCode.length !== 6 || isStarting}
              fullWidth 
              style={{ marginTop: 24, marginBottom: Platform.OS === 'ios' ? 20 : 0 }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={isFullScreenImageVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFullScreenImageVisible(false)}
      >
        <View style={styles.fullScreenModal}>
          <TouchableOpacity 
            style={styles.fullScreenCloseBtn} 
            onPress={() => setIsFullScreenImageVisible(false)}
          >
            <AppText variant="h6" color={Colors.neutral[0]}>Close</AppText>
          </TouchableOpacity>
          {(request.organization?.profile_image_url || request.beneficiary?.profile_image_url) && (
            <Image 
              source={{uri: getFullImageUrl(request.organization?.profile_image_url || request.beneficiary?.profile_image_url) as string}} 
              style={styles.fullScreenImage} 
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
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
    padding: moderateScale(16),
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: moderateScale(16),
  },
  messageIconContainer: {
    padding: moderateScale(8),
    backgroundColor: Colors.primary[50],
    borderRadius: moderateScale(20),
    marginLeft: horizontalScale(12),
  },
  avatarContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    overflow: 'hidden',
    backgroundColor: Colors.primary[500],
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
  otpCard: {
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  otpInput: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderRadius: 12,
    fontSize: 32,
    fontFamily: FontFamily.bold,
    color: Colors.primary[900],
    textAlign: 'center',
    letterSpacing: 12,
    paddingVertical: verticalScale(16),
    width: '100%',
    shadowColor: Colors.primary[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptBtn: {
  },
  cancelTextBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.error + '1A',
    borderRadius: 12,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: Colors.primary[50],
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 16,
  },
  securityText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  fullScreenCloseBtn: {
    position: 'absolute',
    top: verticalScale(50),
    right: horizontalScale(20),
    padding: moderateScale(10),
    zIndex: 1,
  },
});
