import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {api, getFullImageUrl} from '../../../api/client';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {horizontalScale, verticalScale, moderateScale} from '../../../utils/responsive';
import {
  ChevronLeft,
  ShoppingCart,
  Pill,
  Car,
  Plus,
  Calendar,
  MapPin
} from 'lucide-react-native';

export default function MyRequestsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
    }, [])
  );

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/help_requests');
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const activeRequests = requests.filter(r => r.status === 'pending' || r.status === 'accepted' || r.status === 'assigned');
  const historyRequests = requests.filter(r => r.status === 'completed' || r.status === 'cancelled');
  const displayRequests = activeTab === 'Active' ? activeRequests : historyRequests;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <View style={{width: 28}} />
      </View>

      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
            onPress={() => setActiveTab('Active')}
          >
            <Text style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'History' && styles.activeTab]}
            onPress={() => setActiveTab('History')}
          >
            <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading...</Text>
            </View>
          ) : displayRequests.length > 0 ? (
            displayRequests.map((req: any) => (
              <RequestCard 
                key={req.id.toString()}
                icon={<ShoppingCart color={Colors.primary[500]} size={24} />}
                title={req.category?.title || 'Help Request'}
                referenceNumber={req.reference_number || req.id}
                date={formatDate(req.preferred_date)}
                time={req.preferred_start_time && req.preferred_end_time ? `${formatTime12Hour(req.preferred_start_time)} - ${formatTime12Hour(req.preferred_end_time)}` : ''}
                location={req.location?.address || req.meeting_location}
                status={req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                statusColor={req.status === 'pending' ? Colors.warning : Colors.info}
                helperImage={getFullImageUrl(req.volunteer?.profile_image_url) || undefined}
                onPress={() => navigation.navigate('RequestTracking', { requestId: req.id })}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No requests found.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const RequestCard = ({
  icon, title, referenceNumber, date, time, location, status, statusColor, helperImage, onPress
}: {
  icon: React.ReactNode, title: string, referenceNumber: string, date: string, time: string, location: string, status: string, statusColor: string, helperImage?: string, onPress: () => void
}) => {
  const getBadgeColors = () => {
    const s = status.toLowerCase();
    if (s === 'confirmed' || s === 'completed' || s === 'accepted') return { bg: '#DCFCE7', text: '#16A34A' }; // Green
    if (s === 'pending') return { bg: '#FEF3C7', text: '#D97706' }; // Orange
    return { bg: '#E0DEFF', text: '#6D5DF6' }; // Primary
  };
  const badge = getBadgeColors();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardTopRow}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          {referenceNumber ? (
            <Text style={[styles.infoText, { marginBottom: 6 }]}>#{referenceNumber}</Text>
          ) : null}
          
          <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
            <Calendar color={Colors.neutral[400]} size={14} style={[styles.infoIcon, { marginTop: 2 }]} />
            <Text style={[styles.infoText, { flex: 1, lineHeight: 18 }]}>
              {date}
              {time ? <Text style={styles.infoDot}> • {time}</Text> : null}
            </Text>
          </View>
          
          <View style={[styles.infoRow, { alignItems: 'flex-start', marginTop: 6 }]}>
            <MapPin color={Colors.neutral[400]} size={14} style={[styles.infoIcon, { marginTop: 2 }]} />
            <Text style={[styles.infoText, { flex: 1, lineHeight: 18 }]}>{location}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooterAligned}>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusBadgeText, { color: badge.text }]}>{status}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  backBtn: {
    padding: moderateScale(4),
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary[500],
  },
  tabText: {
    ...Typography.labelMedium,
    color: Colors.neutral[500],
  },
  activeTabText: {
    color: Colors.primary[500],
  },
  content: {
    padding: horizontalScale(24),
    paddingBottom: verticalScale(40),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(2)},
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.labelLarge,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: verticalScale(4),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: horizontalScale(6),
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.neutral[600],
  },
  infoDot: {
    ...Typography.bodySmall,
    color: Colors.neutral[400],
    marginHorizontal: horizontalScale(6),
  },
  cardFooterAligned: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: verticalScale(8),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  statusBadgeText: {
    ...Typography.labelSmall,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  emptyState: {
    padding: moderateScale(40),
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
  },
  fab: {
    position: 'absolute',
    bottom: verticalScale(24),
    right: horizontalScale(24),
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(4)},
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(12),
    elevation: 4,
  },
});
