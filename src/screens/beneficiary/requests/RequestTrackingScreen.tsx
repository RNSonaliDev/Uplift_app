import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import {api, getFullImageUrl} from '../../../api/client';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
import {
  ChevronLeft,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Car,
  Calendar,
  MapPin,
  Pill,
  Soup,
  Users,
  MoreHorizontal,
  Clock,
} from 'lucide-react-native';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';

export default function RequestTrackingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const requestId = route.params?.requestId;

  const [requestDetail, setRequestDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (requestId) {
        fetchRequestDetails();
      } else {
        setLoading(false);
      }
    }, [requestId])
  );

  const handleCancel = () => {
    Alert.alert('Cancel Request', 'Are you sure you want to cancel this request?', [
      {text: 'No', style: 'cancel'},
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await api.post(`/help_requests/${requestId}/cancel`);
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Your request has been cancelled.',
              onHide: () => navigation.goBack()
            });
          } catch (error: any) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: error?.data?.errors?.[0] || error?.message || 'Failed to cancel request'
            });
            setLoading(false);
          }
        },
      },
    ]);
  };

  const getCategoryIcon = (title: string, size = 20) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('groc') || t.includes('shop')) return <ShoppingCart color={Colors.neutral[900]} size={size} />;
    if (t.includes('pharm') || t.includes('med') || t.includes('pill')) return <Pill color={Colors.neutral[900]} size={size} />;
    if (t.includes('meal') || t.includes('food') || t.includes('soup')) return <Soup color={Colors.neutral[900]} size={size} />;
    if (t.includes('trans') || t.includes('drive') || t.includes('car')) return <Car color={Colors.neutral[900]} size={size} />;
    if (t.includes('comp') || t.includes('people') || t.includes('user')) return <Users color={Colors.neutral[900]} size={size} />;
    return <MoreHorizontal color={Colors.neutral[900]} size={size} />;
  };

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>(`/help_requests/${requestId}`);
      setRequestDetail(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Tracking</Text>
        <View style={{width: 28}} />
      </View>

      {loading ? (
        <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      ) : requestDetail ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.categoryIconCircle}>
                {requestDetail.category?.logo_url ? (
                  <Image 
                    source={{ uri: getFullImageUrl(requestDetail.category.logo_url) as string }}
                    style={{ width: 32, height: 32 }}
                    resizeMode="contain"
                  />
                ) : (
                  getCategoryIcon(requestDetail.category?.title, 24)
                )}
              </View>
              <View style={styles.cardHeaderRight}>
                <Text style={styles.cardTitle}>{requestDetail.category?.title || 'Help Request'}</Text>
                <Text style={styles.cardId}>#{requestDetail.reference_number || requestDetail.id}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardDetails}>
              <View style={[styles.detailRow, { alignItems: 'flex-start' }]}>
                <View style={{ marginTop: 2 }}>
                  <Calendar color={Colors.neutral[500]} size={20} />
                </View>
                <Text style={[styles.detailText, { flex: 1 }]}>
                  {formatDate(requestDetail.preferred_date)} • {(requestDetail.preferred_start_time || requestDetail.start_time) ? `${formatTime12Hour(requestDetail.preferred_start_time || requestDetail.start_time)}${(requestDetail.preferred_end_time || requestDetail.end_time) ? ` - ${formatTime12Hour(requestDetail.preferred_end_time || requestDetail.end_time)}` : ''}` : (requestDetail.preferred_time || (requestDetail.hours_required ? `${requestDetail.hours_required} hours` : 'Time TBD'))}
                </Text>
              </View>
              <View style={[styles.detailRow, { alignItems: 'flex-start' }]}>
                <View style={{ marginTop: 2 }}>
                  <MapPin color={Colors.neutral[500]} size={20} />
                </View>
                <Text style={[styles.detailText, { flex: 1 }]}>{requestDetail.location?.address || requestDetail.meeting_location || 'Location TBD'}</Text>
              </View>
            </View>
          </View>

          {requestDetail.status === 'cancelled' ? (
            <View style={[styles.timelineContainer, { paddingVertical: 24, paddingHorizontal: 16, backgroundColor: Colors.error + '10', borderRadius: 12, alignItems: 'center', marginTop: 16 }]}>
              <Text style={{ ...Typography.h5, color: Colors.error, marginBottom: 8 }}>Request Cancelled</Text>
              <Text style={{ ...Typography.bodyMedium, color: Colors.neutral[600], textAlign: 'center' }}>
                This request was cancelled and is no longer active.
              </Text>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              <TimelineItem 
                status="completed" 
                title="Request Submitted" 
                time={new Date(requestDetail.created_at).toLocaleString()}
              />
              <TimelineItem 
                status={['accepted', 'assigned', 'in_progress', 'completed'].includes(requestDetail.status) ? 'completed' : 'pending'} 
                title="Request Accepted" 
                description={requestDetail.volunteer ? `${requestDetail.volunteer.first_name} will help you.` : 'Waiting for a helper to accept.'}
              />
              <TimelineItem 
                status={['completed'].includes(requestDetail.status) ? 'completed' : requestDetail.status === 'in_progress' ? 'active' : 'pending'} 
                title="In Progress / Arrived" 
              />
              <TimelineItem 
                status={requestDetail.status === 'completed' ? 'completed' : 'pending'} 
                title="Completed" 
                description={requestDetail.status === 'completed' ? 'Thanks you! Your request is completed.' : 'We will notify you when completed.'}
                isLast
              />
            </View>
          )}

          <View style={styles.bottomContainer}>
            {requestDetail.volunteer && requestDetail.status !== 'completed' && (
              <TouchableOpacity style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>Contact Helper</Text>
              </TouchableOpacity>
            )}
            {requestDetail.status === 'completed' && (
              <TouchableOpacity 
                style={[styles.outlineBtn, {backgroundColor: Colors.primary[500]}]}
                onPress={() => navigation.navigate('RateHelper', {requestId})}
              >
                <Text style={[styles.outlineBtnText, {color: Colors.neutral[0]}]}>Rate Helper</Text>
              </TouchableOpacity>
            )}
            {requestDetail.status === 'pending' && (
              <TouchableOpacity 
                style={[styles.outlineBtn, {borderColor: Colors.error, marginTop: requestDetail.volunteer ? 16 : 0}]} 
                onPress={handleCancel}
              >
                <Text style={[styles.outlineBtnText, {color: Colors.error}]}>Cancel Request</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
          <Text style={{color: Colors.neutral[500]}}>Request details not found.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const TimelineItem = ({
  status, title, time, description, isLast
}: {
  status: 'completed' | 'active' | 'pending', title: string, time?: string, description?: string, isLast?: boolean
}) => {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={styles.timelineIcon}>
          {status === 'completed' && <CheckCircle2 color={Colors.success} size={24} />}
          {status === 'active' && (
            <View style={styles.activeIconContainer}>
              <Car color={Colors.neutral[0]} size={14} />
            </View>
          )}
          {status === 'pending' && <CheckCircle2 color={Colors.neutral[300]} size={24} />}
        </View>
        {!isLast && (
          <View style={[styles.timelineLine, {
            backgroundColor: status === 'completed' ? Colors.success : Colors.neutral[200]
          }]} />
        )}
      </View>
      <View style={[styles.timelineContent, isLast && {marginBottom: 0}]}>
        <Text style={[
          styles.timelineTitle, 
          status === 'pending' && {color: Colors.neutral[400]}
        ]}>{title}</Text>
        {time && <Text style={styles.timelineTime}>{time}</Text>}
        {description && <Text style={styles.timelineDesc}>{description}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardHeaderRight: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  cardId: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginBottom: 16,
  },
  cardDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...Typography.bodySmall,
    color: Colors.neutral[700],
    marginLeft: 12,
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    zIndex: 1,
  },
  activeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    marginBottom: 32,
    paddingTop: 2,
  },
  timelineTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  timelineTime: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginBottom: 4,
  },
  timelineDesc: {
    ...Typography.caption,
    color: Colors.neutral[500],
    lineHeight: 18,
  },
  bottomContainer: {
    marginTop: 40,
  },
  outlineBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderRadius: 12,
    paddingVertical: 14,
  },
  outlineBtnText: {
    ...Typography.buttonMedium,
    color: Colors.primary[500],
  },
});
