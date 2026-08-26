import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  SectionList,
  Image,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {ArrowLeft, ShoppingCart, Pill, Soup, Car, Users, MoreHorizontal, Clock, MapPin, FileText, ShoppingBag} from 'lucide-react-native';
import {AppText} from '../../../components/AppText';
import {Colors} from '../../../theme/colors';
import {api, getFullImageUrl} from '../../../api/client';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';

type Tab = 'Upcoming' | 'In Progress' | 'Completed';

export default function MyScheduleScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<Tab>('Upcoming');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchSchedule();
    }, [])
  );

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/help_requests');
      setRequests(data || []);
    } catch (error) {
      console.error('Failed to fetch schedule', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (title: string, size = 20) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('groc') || t.includes('shop')) return <ShoppingCart color={Colors.primary[500]} size={size} />;
    if (t.includes('pharm') || t.includes('med') || t.includes('pill')) return <Pill color={Colors.primary[500]} size={size} />;
    if (t.includes('meal') || t.includes('food') || t.includes('soup')) return <Soup color={Colors.secondary[500]} size={size} />;
    if (t.includes('trans') || t.includes('drive') || t.includes('car')) return <Car color={Colors.primary[500]} size={size} />;
    if (t.includes('comp') || t.includes('people') || t.includes('user')) return <Users color={Colors.primary[500]} size={size} />;
    return <MoreHorizontal color={Colors.primary[500]} size={size} />;
  };

  // Process data for SectionList
  const getSections = () => {
    const filtered = requests.filter(req => {
      // Very basic filtering logic based on our assumptions
      if (activeTab === 'Upcoming') {
        return req.status === 'accepted' || req.status === 'pending';
      }
      if (activeTab === 'In Progress') {
        return req.status === 'in_progress';
      }
      return req.status === 'completed';
    });

    // Fallback mock data if API returns empty, just to demonstrate the UI matching the design.
    // In a real app, we'd just show an empty state.
    const displayData = filtered.length > 0 ? filtered : [];

    const grouped = displayData.reduce((acc: any, req: any) => {
      const dateStr = formatDate(req.preferred_date) || 'Upcoming';
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(req);
      return acc;
    }, {});

    return Object.keys(grouped).map(date => ({
      title: date,
      data: grouped[date],
    }));
  };

  const formatStatus = (status: string) => {
    if (!status) return 'New';
    if (status.toLowerCase() === 'in_progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const getStatusColors = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'in_progress') return { bg: Colors.primary[50], text: Colors.primary[700] };
    if (s === 'completed') return { bg: Colors.secondary[50], text: Colors.secondary[700] };
    // pending, accepted, new
    return { bg: Colors.accent[50], text: Colors.accent[700] };
  };

  const renderCard = ({item}: {item: any}) => {
    const displayStatus = formatStatus(item.status);
    const statusColors = getStatusColors(item.status);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          if (activeTab === 'Upcoming') {
            navigation.navigate('RequestDetails', { request: item, forceAction: 'start' });
          } else if (activeTab === 'In Progress') {
            navigation.navigate('RequestDetails', { request: item, forceAction: 'complete' });
          } else if (activeTab === 'Completed') {
            navigation.navigate('RequestDetails', { request: item, forceAction: 'rate' });
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.requestIconContainer}>
            {item.category?.logo_url ? (
              <Image 
                source={{ uri: getFullImageUrl(item.category.logo_url) as string }}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            ) : (
              <ShoppingBag color={Colors.primary[500]} size={20} />
            )}
          </View>
          <View style={{flex: 1}}>
            <AppText variant="labelLarge" color={Colors.neutral[900]}>
              {item.category?.title || 'Help Request'}
            </AppText>
            <AppText variant="bodySmall" color={Colors.neutral[500]} style={{marginTop: 5}}>
              #{item.reference_number || item.id}
            </AppText>
          </View>
          <View style={[styles.newBadge, { backgroundColor: statusColors.bg }]}>
            <AppText variant="labelMedium" color={statusColors.text}>
              {displayStatus}
            </AppText>
          </View>
        </View>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Clock color={Colors.neutral[400]} size={16} />
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.detailText}>
              {(item.preferred_start_time || item.start_time) ? `${formatTime12Hour(item.preferred_start_time || item.start_time)}${(item.preferred_end_time || item.end_time) ? ` - ${formatTime12Hour(item.preferred_end_time || item.end_time)}` : ''}` : (item.preferred_time || (item.hours_required ? `${item.hours_required} hours` : 'Time TBD'))}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <MapPin color={Colors.neutral[400]} size={16} />
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.detailText} numberOfLines={1}>
              {item.location?.address || item.meeting_location || 'Location TBD'}
            </AppText>
          </View>
          {item.distance_km != null && (
            <View style={styles.detailRow}>
              <MapPin color={Colors.neutral[400]} size={16} />
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.detailText}>
                {/* Treating distance_km as miles for display as per design */}
                {item.distance_km.toFixed(1)} mi
              </AppText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.backButtonPlaceholder} />
        <AppText variant="h4" color={Colors.neutral[900]} style={styles.headerTitle}>
          My Schedule
        </AppText>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'Upcoming' && styles.segmentActive]}
          onPress={() => setActiveTab('Upcoming')}
          activeOpacity={0.8}
        >
          <AppText 
            variant="bodyMedium" 
            color={activeTab === 'Upcoming' ? Colors.neutral[0] : Colors.neutral[700]}
            style={{fontWeight: activeTab === 'Upcoming' ? '400' : '400'}}
          >
            Upcoming
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'In Progress' && styles.segmentActive]}
          onPress={() => setActiveTab('In Progress')}
          activeOpacity={0.8}
        >
          <AppText 
            variant="bodyMedium" 
            color={activeTab === 'In Progress' ? Colors.neutral[0] : Colors.neutral[700]}
            style={{fontWeight: activeTab === 'In Progress' ? '400' : '400'}}
          >
            In Progress
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'Completed' && styles.segmentActive]}
          onPress={() => setActiveTab('Completed')}
          activeOpacity={0.8}
        >
          <AppText 
            variant="bodyMedium" 
            color={activeTab === 'Completed' ? Colors.neutral[0] : Colors.neutral[700]}
            style={{fontWeight: activeTab === 'Completed' ? '400' : '400'}}
          >
            Completed
          </AppText>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={getSections()}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <AppText variant="bodyLarge" color={Colors.neutral[500]} center>
              No data found
            </AppText>
          </View>
        )}
        renderItem={renderCard}
        renderSectionHeader={({section: {title}}) => (
          <AppText variant="h5" color={Colors.neutral[900]} style={styles.sectionHeader}>
            {title}
          </AppText>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: moderateScale(8),
  },
  backButtonPlaceholder: {
    width: moderateScale(40),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    padding: moderateScale(4),
    marginHorizontal: horizontalScale(24),
    marginBottom: verticalScale(24),
    marginTop: verticalScale(24),
  },
  segmentButton: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: Colors.primary[500],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(32),
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(64),
  },
  sectionHeader: {
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(20),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  requestIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 12,
  },
  newBadge: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 12,
  },
  cardDetails: {
    gap: verticalScale(8),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: horizontalScale(8),
    flex: 1,
  },
});
