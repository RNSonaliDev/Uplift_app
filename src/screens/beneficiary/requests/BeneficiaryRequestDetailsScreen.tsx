import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {FontFamily} from '../../../theme/typography';
import {AppText} from '../../../components/AppText';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {getStatusColors, formatStatus} from '../../../utils/statusUtils';
import {Button} from '../../../components/Button';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Info,
  MessageCircle,
} from 'lucide-react-native';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {api, getFullImageUrl} from '../../../api/client';

export default function BeneficiaryRequestDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [request, setRequest] = useState<any>(route.params?.request || {});
  const [isFullScreenImageVisible, setIsFullScreenImageVisible] = useState(false);
  
  const requestId = route.params?.requestId || request.id;

  useFocusEffect(
    useCallback(() => {
      const fetchRequest = async () => {
        if (requestId) {
          try {
            const data = await api.get(`/help_requests/${requestId}`);
            if (data) {
              setRequest(data);
            }
          } catch (e) {
            console.error('Failed to fetch request details', e);
          }
        }
      };
      
      fetchRequest();
    }, [requestId])
  );
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
        
        {/* Helper Section (If assigned) */}
        {request.volunteer && (
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {request.volunteer?.profile_image_url ? (
                <TouchableOpacity onPress={() => setIsFullScreenImageVisible(true)} style={{flex: 1}}>
                  <Image 
                    source={{uri: getFullImageUrl(request.volunteer.profile_image_url) as string}} 
                    style={styles.avatar} 
                  />
                </TouchableOpacity>
              ) : (
                <View style={[styles.avatar, {justifyContent: 'center', alignItems: 'center'}]}>
                  <AppText variant="h6" color={Colors.neutral[0]}>
                    {request.volunteer?.first_name 
                      ? `${request.volunteer.first_name.charAt(0)}${request.volunteer.last_name ? request.volunteer.last_name.charAt(0) : ''}`.toUpperCase() 
                      : ''}
                  </AppText>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <AppText variant="labelLarge" color={Colors.neutral[900]} style={{marginBottom: 4}}>
                {request.volunteer?.first_name ? `${request.volunteer.first_name} ${request.volunteer.last_name || ''}` : 'Volunteer'}
              </AppText>
              <AppText variant="caption" color={getStatusColors(request.status || 'pending').text}>
                {request.status === 'on_the_way' ? 'On the way' : 
                 request.status === 'in_progress' ? 'In Progress' : 
                 request.status === 'completed' ? 'Completed' : 
                 'Assigned Volunteer'}
              </AppText>
            </View>

            {!['in_progress', 'completed'].includes((request.status || '').toLowerCase()) && (
              <TouchableOpacity 
                style={styles.messageIconContainer}
                onPress={() => {
                  const assignId = request.assignments?.[0]?.id || 0;
                  const recipientName = request.volunteer?.first_name 
                    ? `${request.volunteer.first_name} ${request.volunteer.last_name || ''}`.trim() 
                    : 'Volunteer';
                  const recipientAvatar = request.volunteer?.profile_image_url;
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

        {/* Start Code Section */}
        {request.start_code && (request.status || '').toLowerCase() === 'on_the_way' && (
          <View style={styles.startCodeCard}>
            <AppText variant="labelMedium" color={Colors.primary[900]} style={{marginBottom: 12}}>
              Start Code
            </AppText>
            <View style={styles.startCodeBox}>
              <AppText variant="h3" color={Colors.primary[900]} style={{letterSpacing: 12}}>
                {request.start_code}
              </AppText>
            </View>
            <AppText variant="caption" color={Colors.neutral[600]} style={{marginTop: 16, textAlign: 'center', lineHeight: 20}}>
              Share this 6-digit code with the volunteer when they arrive to start the request.
            </AppText>
          </View>
        )}

        {(request.volunteer) && <View style={styles.divider} />}

        {/* Request Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <FileText color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Category</AppText>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={[styles.categoryBadge, { paddingHorizontal: horizontalScale(12), paddingVertical: verticalScale(4) }]}>
                <AppText variant="labelMedium" color={Colors.primary[600]}>
                  {request.category?.title || 'Help Request'}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Info color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Status</AppText>
            </View>
            <AppText variant="bodyMedium" color={getStatusColors(request.status || 'pending').text} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
              {formatStatus(request.status || 'pending')}
            </AppText>
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
              {formatDate(request.preferred_date) || 'Date TBD'}
            </AppText>
          </View>

          {/* Time */}
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Clock color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Time</AppText>
            </View>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
              {request.preferred_start_time ? `${formatTime12Hour(request.preferred_start_time)} - ${formatTime12Hour(request.preferred_end_time)}` : 'Time TBD'}
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
              {request.location?.address || request.meeting_location || 'Location TBD'}
            </AppText>
          </View>

        </View>

        {/* Security / Cancel Note */}
        {(request.status || '').toLowerCase() === 'cancelled' && request.cancel_reason ? (
          <View style={[styles.securityNote, { backgroundColor: '#FEE2E2' }]}>
            <Info color={Colors.error} size={24} />
            <AppText variant="caption" color={Colors.error} style={styles.securityText}>
              {request.cancel_reason ? `Reason for cancellation: ${request.cancel_reason}` : 'Cancelled'}
            </AppText>
          </View>
        ) : (
          <View style={styles.securityNote}>
            <Info color={Colors.primary[500]} size={24} />
            <AppText variant="caption" color={Colors.primary[500]} style={styles.securityText}>
              For your safety, never share personal information or belongings like your SSN or bank details with anyone.
            </AppText>
          </View>
        )}
      </ScrollView>

      {(request.status || '').toLowerCase() !== 'cancelled' && (
        <View style={styles.actionContainer}>
          <Button 
            title="Track Request" 
            onPress={() => navigation.navigate('RequestTracking', { requestId: request.id || requestId })} 
            style={styles.acceptBtn} 
          />
        </View>
      )}

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
          {request.volunteer?.profile_image_url && (
            <Image 
              source={{uri: getFullImageUrl(request.volunteer.profile_image_url) as string}} 
              style={styles.fullScreenImage} 
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      </SafeAreaView>
    </>
  );
};

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
    paddingTop: verticalScale(24),
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
  messageIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: horizontalScale(12),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginBottom: verticalScale(24),
  },
  startCodeCard: {
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
    padding: 20,
    marginBottom: verticalScale(20),
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  startCodeBox: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderRadius: 12,
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(24),
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  acceptBtn: {
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
