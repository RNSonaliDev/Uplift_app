import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {Colors} from '../../../theme/colors';
import {FontFamily} from '../../../theme/typography';
import {AppText} from '../../../components/AppText';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {Button} from '../../../components/Button';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ShieldAlert,
  MessageCircle,
  Users,
  X,
} from 'lucide-react-native';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {api, getFullImageUrl} from '../../../api/client';

export const OrgRequestDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [request, setRequest] = useState<any>(route.params?.request || {});
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  const requestId = route.params?.requestId || request.id;

  const handleCheckIn = async (vol: any) => {
    if (!requestId) return;
    try {
      setIsProcessing(true);
      const assignment = request.assignments?.find((a: any) => a.volunteer?.id === vol.id || a.volunteer_id === vol.id);
      const assignId = assignment?.id || vol.pivot?.id || vol.assignment?.id || 0;
      await api.post(`/help_requests/${requestId}/check_in`, {
        assignment_id: assignId,
        volunteer_id: vol.id || 0
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Volunteer checked in successfully!',
      });
      const data = await api.get(`/help_requests/${requestId}`);
      if (data) setRequest(data);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to check in.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async (vol: any) => {
    if (!requestId) return;
    try {
      setIsProcessing(true);
      const assignment = request.assignments?.find((a: any) => a.volunteer?.id === vol.id || a.volunteer_id === vol.id);
      const assignId = assignment?.id || vol.pivot?.id || vol.assignment?.id || 0;
      await api.post(`/help_requests/${requestId}/check_out`, {
        assignment_id: assignId,
        volunteer_id: vol.id || 0
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Volunteer checked out successfully!',
      });
      const data = await api.get(`/help_requests/${requestId}`);
      if (data) setRequest(data);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to check out.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
        <AppText variant="bodyLarge" color={Colors.neutral[0]}>Request Details</AppText>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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
                  {request.category?.title || 'Help Request'}
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

          {/* Volunteer Stats */}
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Users color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Volunteers Needed</AppText>
            </View>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
              {request.volunteers_needed || 0}
            </AppText>
          </View>

          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Users color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Volunteers Accepted</AppText>
            </View>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
              {request.volunteers_accepted !== undefined ? request.volunteers_accepted : (request.volunteers?.length || 0)}
            </AppText>
          </View>

          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Users color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Volunteers Remaining</AppText>
            </View>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
              {request.volunteers_remaining !== undefined ? request.volunteers_remaining : Math.max(0, (request.volunteers_needed || 0) - (request.volunteers_accepted !== undefined ? request.volunteers_accepted : (request.volunteers?.length || 0)))}
            </AppText>
          </View>

          {/* Date */}
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Calendar color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Date</AppText>
            </View>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
              {formatDate(request.preferred_date || request.preferred_start_date) || 'Date TBD'}
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
              {request.location?.address || request.address || request.meeting_location || 'Location TBD'}
            </AppText>
          </View>

        </View>

        {/* Assigned Volunteers Section - moved to bottom, show max 2 */}
        {(() => {
          const volunteersList = request.volunteers?.length > 0 
            ? request.volunteers 
            : (request.volunteer ? [request.volunteer] : []);
            
          if (volunteersList.length > 0) {
            const displayedVolunteers = volunteersList.slice(0, 2);
            return (
              <View style={styles.volunteersSection}>
                <View style={styles.volunteersSectionHeader}>
                  <AppText variant="labelLarge" color={Colors.neutral[900]}>
                    Assigned Volunteers ({volunteersList.length})
                  </AppText>
                  {volunteersList.length > 2 && (
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('AllVolunteers', { request, requestId })}
                    >
                      <AppText variant="labelMedium" color={Colors.primary[500]}>View All</AppText>
                    </TouchableOpacity>
                  )}
                </View>
                {displayedVolunteers.map((vol: any, index: number) => {
                  const assignment = request.assignments?.find((a: any) => a.volunteer?.id === vol.id || a.volunteer_id === vol.id);
                  const volStatus = assignment?.status || vol.pivot?.status || vol.assignment?.status || request.status || '';
                  const statusLabel = volStatus === 'on_the_way' ? 'On the Way' 
                    : volStatus === 'in_progress' ? 'In Progress'
                    : volStatus === 'completed' ? 'Completed'
                    : volStatus === 'accepted' || volStatus === 'assigned' ? 'Accepted'
                    : 'Assigned';
                  const statusColor = volStatus === 'on_the_way' ? Colors.warning 
                    : volStatus === 'in_progress' ? Colors.primary[500]
                    : volStatus === 'completed' ? Colors.success
                    : Colors.neutral[500];

                  return (
                  <View key={index} style={[styles.profileSection, { flexDirection: 'column', alignItems: 'stretch' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity 
                        style={styles.avatarContainer}
                        onPress={() => vol.profile_image_url && setFullScreenImage(getFullImageUrl(vol.profile_image_url) as string)}
                        activeOpacity={vol.profile_image_url ? 0.7 : 1}
                      >
                        {vol.profile_image_url ? (
                          <Image 
                            source={{uri: getFullImageUrl(vol.profile_image_url) as string}} 
                            style={styles.avatar} 
                          />
                        ) : (
                          <View style={[styles.avatar, {justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary[500]}]}>
                            <AppText variant="h6" color={Colors.neutral[0]}>
                              {vol.first_name 
                                ? `${vol.first_name.charAt(0)}${vol.last_name ? vol.last_name.charAt(0) : ''}`.toUpperCase() 
                                : ''}
                            </AppText>
                          </View>
                        )}
                      </TouchableOpacity>
                      <View style={styles.profileInfo}>
                        <AppText variant="labelLarge" color={Colors.neutral[900]} style={{marginBottom: 4}}>
                          {vol.first_name ? `${vol.first_name} ${vol.last_name || ''}` : 'Volunteer'}
                        </AppText>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                          <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor}} />
                          <AppText variant="caption" color={statusColor}>{statusLabel}</AppText>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {volStatus.toLowerCase() !== 'in_progress' && (
                          <TouchableOpacity 
                            style={styles.msgBtn}
                            onPress={() => {
                              navigation.navigate('OrgRequestTracking', { request, volunteerId: vol.id });
                            }}
                          >
                            <MapPin color={Colors.primary[500]} size={20} />
                          </TouchableOpacity>
                        )}
                        {volStatus.toLowerCase() !== 'in_progress' && volStatus.toLowerCase() !== 'completed' && (
                          <TouchableOpacity 
                            style={styles.msgBtn}
                            onPress={() => {
                              const assignment = request.assignments?.find((a: any) => a.volunteer?.id === vol.id || a.volunteer_id === vol.id);
                              const assignId = assignment?.id || vol.pivot?.id || vol.assignment?.id || 0;
                              const recipientName = vol.first_name 
                                ? `${vol.first_name} ${vol.last_name || ''}`.trim() 
                                : 'Volunteer';
                              const recipientAvatar = vol.profile_image_url;
                              navigation.navigate('ChatScreen', {
                                helpRequestId: request.id,
                                assignmentId: assignId,
                                recipientName,
                                recipientAvatar,
                                requestStatus: request.status,
                              });
                            }}
                          >
                            <MessageCircle color={Colors.primary[500]} size={20} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Action Buttons */}
                    {['on_the_way', 'in_progress'].includes(volStatus.toLowerCase()) && (
                      <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
                        {volStatus.toLowerCase() === 'on_the_way' && (
                          <Button 
                            title="Check In"
                            onPress={() => handleCheckIn(vol)}
                            variant="outline"
                            style={{ flex: 1 }}
                            loading={isProcessing}
                          />
                        )}
                        {volStatus.toLowerCase() === 'in_progress' && (
                          <Button 
                            title="Check Out"
                            onPress={() => handleCheckOut(vol)}
                            style={{ flex: 1 }}
                            loading={isProcessing}
                          />
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
              </View>
            );
          }
          return null;
        })()}

      </ScrollView>

      {/* <View style={styles.actionContainer}>
        <Button 
          title="Track Request" 
          onPress={() => navigation.navigate('OrgRequestTracking', { request: request })} 
          style={styles.acceptBtn} 
        />
      </View> */}
      </SafeAreaView>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setFullScreenImage(null)}
            >
              <X color={Colors.neutral[0]} size={28} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalImageContainer}>
            {fullScreenImage && (
              <Image 
                source={{uri: fullScreenImage}} 
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
  },
  iconButton: {
    padding: moderateScale(8),
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(40),
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(10),
    borderRadius: 24,
  },
  volunteersSection: {
    marginBottom: verticalScale(8),
    marginTop: verticalScale(8),
  },
  volunteersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    backgroundColor: Colors.neutral[0],
    padding: moderateScale(16),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
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
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  acceptBtn: {
  },
  msgBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary[50],
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
  },
  closeButton: {
    padding: moderateScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(20),
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(16),
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
});
