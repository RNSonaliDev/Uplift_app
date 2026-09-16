import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  SectionList,
  Image,
  ScrollView,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import { ShoppingCart, Pill, Soup, Car, Users, MoreHorizontal, Clock, MapPin, FileText, Calendar} from 'lucide-react-native';
import {AppText} from '../../../components/AppText';
import {Colors} from '../../../theme/colors';
import {FontFamily} from '../../../theme/typography';
import {api, getFullImageUrl} from '../../../api/client';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {formatStatus, getStatusColors} from '../../../utils/statusUtils';
import {CategoryIcon} from '../../../components/CategoryIcon';

type Tab = 'Upcoming' | 'On the Way' | 'In Progress' | 'Completed' | 'Cancelled';

export default function MyScheduleScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<Tab>('Upcoming');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('Upcoming');
      fetchSchedule();
      fetchProfile();
    }, [])
  );

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/help_requests?scope=volunteer');
      setRequests(data || []);
    } catch (error) {
      console.error('Failed to fetch schedule', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const profileData: any = await api.get('/profile');
      const roleId = profileData?.active_profile?.id || profileData?.data?.active_profile?.id || profileData?.current_role?.id || profileData?.data?.current_role?.id;
      if (roleId) {
        setCurrentUserId(roleId);
      } else if (profileData?.id) {
        setCurrentUserId(profileData.id);
      } else if (profileData?.data?.id) {
        setCurrentUserId(profileData.data.id);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
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
      const volunteerAssignment = currentUserId ? req.assignments?.find((a: any) => a.volunteer?.id === currentUserId) : undefined;
      const status = volunteerAssignment?.status || req.status;
      // Very basic filtering logic based on our assumptions
      if (activeTab === 'Upcoming') {
        return status === 'accepted' || status === 'pending';
      }
      if (activeTab === 'On the Way') {
        return status === 'on_the_way';
      }
      if (activeTab === 'In Progress') {
        return status === 'in_progress';
      }
      if (activeTab === 'Cancelled') {
        return status === 'cancelled';
      }
      return status === 'completed';
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


  const renderCard = ({item}: {item: any}) => {
    const volunteerAssignment = currentUserId ? item.assignments?.find((a: any) => a.volunteer?.id === currentUserId) : undefined;
    const status = volunteerAssignment?.status || item.status;
    const displayStatus = formatStatus(status);
    const statusColors = getStatusColors(status);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          if (activeTab === 'Upcoming') {
            navigation.navigate('RequestDetails', { request: item, forceAction: 'start' });
          } else if (activeTab === 'On the Way') {
            navigation.navigate('RequestDetails', { request: item, forceAction: 'start_with_otp' });
          } else if (activeTab === 'In Progress') {
            navigation.navigate('RequestDetails', { request: item, forceAction: 'complete' });
          } else if (activeTab === 'Completed') {
            navigation.navigate('RequestDetails', { request: item, forceAction: 'rate' });
          } else if (activeTab === 'Cancelled') {
            navigation.navigate('RequestDetails', { request: item, forceAction: 'none' });
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
              <CategoryIcon title={item.category?.title} color={Colors.primary[500]} size={20} />
            )}
          </View>
          <View style={{flex: 1}}>
            <AppText variant="labelLarge" weight="semiBold" color={Colors.neutral[900]} style={{marginBottom: 4}}>
              {item.category?.title || 'Help Request'}
            </AppText>
          </View>
          <View style={[styles.newBadge, { backgroundColor: statusColors.bg }]}>
            <AppText variant="labelMedium" color={statusColors.text}>
              {displayStatus}
            </AppText>
          </View>
        </View>
        
        <View style={styles.cardDetails}>
          {item.title ? (
            <AppText variant="bodyMedium" color={Colors.neutral[800]} style={{marginBottom: 4, fontFamily: FontFamily.medium}}>
              {item.title}
            </AppText>
          ) : null}
          <AppText variant="caption" color={Colors.neutral[600]} style={{marginBottom: 12}}>
            #{item.reference_number || item.id}
          </AppText>
          <View style={styles.detailRow}>
            <Calendar color={Colors.neutral[500]} size={14} />
            <AppText variant="caption" color={Colors.neutral[800]} style={styles.detailText}>
              {formatDate(item.preferred_date)} • {(item.preferred_start_time || item.start_time) ? `${formatTime12Hour(item.preferred_start_time || item.start_time)}${(item.preferred_end_time || item.end_time) ? ` - ${formatTime12Hour(item.preferred_end_time || item.end_time)}` : ''}` : (item.preferred_time || 'Time TBD')}{item.hours_required ? ` (${item.hours_required} hours)` : ''}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <MapPin color={Colors.neutral[500]} size={14} />
            <AppText variant="caption" color={Colors.neutral[800]} style={styles.detailText} numberOfLines={1}>
              {item.location?.address || item.meeting_location || 'Location TBD'}
            </AppText>
          </View>
          {item.distance != null && (
            <View style={styles.distanceBadge}>
              <MapPin color={Colors.primary[600]} size={12} style={{marginRight: 4}} />
              <AppText variant="caption" color={Colors.primary[600]} style={{fontFamily: FontFamily.medium}}>
                {(parseFloat(item.distance) * 0.621371).toFixed(1)} miles
              </AppText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.backButtonPlaceholder} />
        <AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: 'center'}}>
          My Schedule
        </AppText>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentContainer}>
          {['Upcoming', 'On the Way', 'In Progress', 'Completed', 'Cancelled'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.segmentButton, activeTab === tab && styles.segmentActive]}
              onPress={() => setActiveTab(tab as Tab)}
              activeOpacity={0.8}
            >
              <AppText 
                variant="bodyMedium" 
                color={activeTab === tab ? Colors.neutral[0] : Colors.neutral[700]}
                style={{fontWeight: '400'}}
              >
                {tab}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        renderSectionHeader={() => null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
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
    gap: horizontalScale(8),
  },
  segmentButton: {
    paddingHorizontal: horizontalScale(16),
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
