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
import {Button} from '../../../components/Button';
import {
  ChevronLeft,
  MessageCircle,
  Users,
  X,
  MapPin,
} from 'lucide-react-native';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {api, getFullImageUrl} from '../../../api/client';

export const AllVolunteersScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [request, setRequest] = useState<any>(route.params?.request || {});
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const requestId = route.params?.requestId || request.id;

  const handleCheckIn = async (vol: any) => {
    console.log("@@@ bnnbnbnbnb=====", vol)
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

  const volunteersList = request.volunteers?.length > 0 
    ? request.volunteers 
    : (request.volunteer ? [request.volunteer] : []);

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ChevronLeft color={Colors.neutral[0]} size={28} strokeWidth={2} />
          </TouchableOpacity>
          <AppText variant="bodyLarge" color={Colors.neutral[0]}>Assigned Volunteers</AppText>
          <View style={{width: 40}} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <AppText variant="h4" color={Colors.primary[500]}>{volunteersList.length}</AppText>
              <AppText variant="caption" color={Colors.neutral[500]} center>Total Assigned</AppText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <AppText variant="h4" color={Colors.primary[500]}>{request.volunteers_needed || 0}</AppText>
              <AppText variant="caption" color={Colors.neutral[500]} center>Needed</AppText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <AppText variant="h4" color={Colors.primary[500]}>
                {request.volunteers_remaining !== undefined 
                  ? request.volunteers_remaining 
                  : Math.max(0, (request.volunteers_needed || 0) - volunteersList.length)}
              </AppText>
              <AppText variant="caption" color={Colors.neutral[500]} center>Remaining</AppText>
            </View>
          </View>

          {volunteersList.length === 0 ? (
            <View style={styles.emptyState}>
              <Users color={Colors.neutral[300]} size={48} />
              <AppText variant="bodyLarge" color={Colors.neutral[500]} style={{marginTop: 16}} center>
                No volunteers assigned yet
              </AppText>
            </View>
          ) : (
            volunteersList.map((vol: any, index: number) => {
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
              <View key={index} style={styles.volunteerCard}>
                <View style={styles.volunteerRow}>
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
                    <AppText variant="labelLarge" color={Colors.neutral[900]} style={{marginBottom: 2}}>
                      {vol.first_name ? `${vol.first_name} ${vol.last_name || ''}` : 'Volunteer'}
                    </AppText>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                      <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor}} />
                      <AppText variant="caption" color={statusColor}>{statusLabel}</AppText>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(
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
                  <View style={styles.actionRow}>
                    {volStatus.toLowerCase() === 'on_the_way' && (
                      <Button 
                        title="Check In"
                        onPress={() => handleCheckIn(vol)}
                        variant="outline"
                        style={{ flex: 1 }}
                        loading={false}
                      />
                    )}
                    {volStatus.toLowerCase() === 'in_progress' && (
                      <Button 
                        title="Check Out"
                        onPress={() => handleCheckOut(vol)}
                        style={{ flex: 1 }}
                        loading={false}
                      />
                    )}
                  </View>
                )}
              </View>
            );
          })
          )}
        </ScrollView>
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
    backgroundColor: Colors.neutral[50],
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
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(20),
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral[200],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },
  volunteerCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  volunteerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    backgroundColor: Colors.neutral[100],
    marginRight: horizontalScale(12),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
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
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
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
