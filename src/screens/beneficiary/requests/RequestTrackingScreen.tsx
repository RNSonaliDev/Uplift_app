import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {api} from '../../../api/client';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
import {
  ChevronLeft,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Car,
  Calendar,
} from 'lucide-react-native';
import {formatDate} from '../../../utils/dateFormatter';

export default function RequestTrackingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const requestId = route.params?.requestId;

  const [requestDetail, setRequestDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    } else {
      setLoading(false);
    }
  }, [requestId]);

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
            Alert.alert('Success', 'Your request has been cancelled.', [
              {text: 'OK', onPress: () => navigation.goBack()}
            ]);
          } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to cancel request');
            setLoading(false);
          }
        },
      },
    ]);
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
              <View style={styles.iconContainer}>
                <ShoppingCart color={Colors.primary[500]} size={24} />
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{requestDetail.category?.title || 'Help Request'}</Text>
                <View style={styles.dateRow}>
                  <Calendar color={Colors.neutral[500]} size={16} />
                  <Text style={styles.cardDate}>{formatDate(requestDetail.preferred_date)}</Text>
                </View>
                <Text style={styles.cardId}>Request ID: {requestDetail.reference_number || `#${requestDetail.id}`}</Text>
              </View>
            </View>
          </View>

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
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.labelLarge,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  cardDate: {
    ...Typography.caption,
    color: Colors.neutral[700],
  },
  cardId: {
    ...Typography.caption,
    color: Colors.neutral[500],
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
