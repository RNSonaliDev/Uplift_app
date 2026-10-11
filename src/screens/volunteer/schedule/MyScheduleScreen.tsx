import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  SectionList,
  Image,
  TextInput,
} from 'react-native';
import {useNavigation, useFocusEffect, useRoute} from '@react-navigation/native';
import { ShoppingCart, Pill, Soup, Car, Users, MoreHorizontal, Clock, MapPin, FileText, Calendar, Search, X} from 'lucide-react-native';
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
import {formatStatus, getStatusColors, isCancelledStatus} from '../../../utils/statusUtils';
import {CategoryIcon} from '../../../components/CategoryIcon';

type Tab = 'Active' | 'History';

export default function MyScheduleScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialTab: Tab = route.params?.activeTab === 'History' || route.params?.activeTab === 'Cancelled' || route.params?.activeTab === 'Completed' ? 'History' : 'Active';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  React.useEffect(() => {
    if (route.params?.activeTab) {
      const t = route.params.activeTab;
      setActiveTab(t === 'History' || t === 'Cancelled' || t === 'Completed' ? 'History' : 'Active');
    }
  }, [route.params?.activeTab]);

  const isFirstMount = React.useRef(true);

  useFocusEffect(
    useCallback(() => {
      fetchSchedule();
      fetchProfile();
    }, [])
  );

  const fetchSchedule = async () => {
    try {
      if (isFirstMount.current) {
        setLoading(true);
      }
      const data = await api.get<any[]>('/help_requests');
      setRequests(data || []);
    } catch (error) {
      console.error('Failed to fetch schedule', error);
    } finally {
      setLoading(false);
      isFirstMount.current = false;
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
    const query = searchQuery.trim().toLowerCase();

    const filtered = requests.filter(req => {
      const volunteerAssignment = currentUserId ? req.assignments?.find((a: any) => a.volunteer?.id === currentUserId) : undefined;
      const reqStatusStr = req.status?.toLowerCase() || '';
      const assignStatusStr = volunteerAssignment?.status?.toLowerCase() || '';

      const isCancelled = isCancelledStatus(reqStatusStr) || isCancelledStatus(assignStatusStr);
      const isCompleted = reqStatusStr === 'completed' || assignStatusStr === 'completed';

      let matchesTab = false;
      if (activeTab === 'History') {
        matchesTab = isCancelled || isCompleted;
      } else {
        matchesTab = !isCancelled && !isCompleted && (
          assignStatusStr === 'accepted' ||
          assignStatusStr === 'pending' ||
          assignStatusStr === 'on_the_way' ||
          assignStatusStr === 'in_progress' ||
          assignStatusStr === 'assigned' ||
          assignStatusStr === 'confirmed' ||
          assignStatusStr.includes('parent') ||
          assignStatusStr.includes('verification') ||
          reqStatusStr === 'accepted' ||
          reqStatusStr === 'pending' ||
          reqStatusStr === 'on_the_way' ||
          reqStatusStr === 'in_progress' ||
          reqStatusStr === 'assigned' ||
          reqStatusStr === 'confirmed' ||
          !reqStatusStr
        );
      }

      if (!matchesTab) return false;
      if (!query) return true;

      const categoryTitle = req.category?.title || '';
      const reqTitle = req.title || '';
      const address = req.location?.address || req.meeting_location || '';
      const refNum = (req.reference_number || req.id || '').toString();

      return (
        categoryTitle.toLowerCase().includes(query) ||
        reqTitle.toLowerCase().includes(query) ||
        address.toLowerCase().includes(query) ||
        refNum.toLowerCase().includes(query)
      );
    });

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
    const reqStatusStr = item.status?.toLowerCase() || '';
    const assignStatusStr = volunteerAssignment?.status?.toLowerCase() || '';

    let status = item.status;
    if (isCancelledStatus(assignStatusStr)) {
      status = volunteerAssignment?.status;
    } else if (isCancelledStatus(reqStatusStr)) {
      status = item.status;
    } else {
      status = volunteerAssignment?.status || item.status;
    }

    const displayStatus = formatStatus(status);
    const statusColors = getStatusColors(status);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          if (activeTab === 'Active') {
            const s = status?.toLowerCase() || '';
            const isOrg = item.request_type === 'organization' || !!item.organization;
            let forceAction: string | undefined = undefined;
            if (!isOrg) {
              if (s === 'on_the_way') forceAction = 'start_with_otp';
              else if (s === 'in_progress') forceAction = 'complete';
              else if (s === 'accepted') forceAction = 'start';
            }
            if (s.includes('parent') || s.includes('verification')) forceAction = 'parent_verification';
            navigation.navigate('RequestDetails', { request: item, forceAction });
          } else {
            const isCancelled = isCancelledStatus(status);
            navigation.navigate('RequestDetails', { request: item, forceAction: isCancelled ? 'none' : 'rate' });
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
          <View style={styles.cardTitleContainer}>
            <AppText 
              variant="bodyLarge" 
              weight="semiBold" 
              color={Colors.neutral[900]} 
              numberOfLines={2}
            >
              {item.category?.title || 'Help Request'}
            </AppText>
          </View>
        </View>
        
        <View style={styles.cardDetails}>
          {item.title ? (
            <AppText variant="bodyMedium" color={Colors.neutral[800]} style={{marginBottom: 2, fontFamily: FontFamily.medium}}>
              {item.title}
            </AppText>
          ) : null}
          <AppText variant="caption" color={Colors.neutral[600]}>
            #{item.reference_number || item.id}
          </AppText>
          <View style={styles.detailRow}>
            <Calendar color={Colors.neutral[500]} size={14} />
            <AppText variant="caption" color={Colors.neutral[800]} style={styles.detailText}>
              {formatDate(item.preferred_date)}
            </AppText>
          </View>
          {(item.preferred_start_time || item.start_time || item.preferred_time || item.hours_required) ? (
            <View style={styles.detailRow}>
              <Clock color={Colors.neutral[500]} size={14} />
              <AppText variant="caption" color={Colors.neutral[800]} style={styles.detailText}>
                {(item.preferred_start_time || item.start_time) ? `${formatTime12Hour(item.preferred_start_time || item.start_time)}${(item.preferred_end_time || item.end_time) ? ` - ${formatTime12Hour(item.preferred_end_time || item.end_time)}` : ''}` : (item.preferred_time || 'Time TBD')}
                {(item.preferred_start_time || item.start_time || item.preferred_time) && item.hours_required ? ' ' : ''}
                {item.hours_required ? `(${item.hours_required} hours)` : ''}
              </AppText>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <MapPin color={Colors.neutral[500]} size={14} />
            <AppText variant="caption" color={Colors.neutral[800]} style={styles.detailText} numberOfLines={1}>
              {item.location?.address || item.meeting_location || 'Location TBD'}
            </AppText>
          </View>
          <View style={styles.cardBottomRow}>
            {item.distance != null && !isNaN(parseFloat(item.distance)) ? (
              <View style={styles.distanceRow}>
                <MapPin color={Colors.neutral[500]} size={14} />
                <AppText variant="caption" color={Colors.neutral[800]} style={styles.distanceText}>
                  {(parseFloat(item.distance) * 0.621371).toFixed(1)} miles
                </AppText>
              </View>
            ) : <View />}
            <View style={[styles.newBadge, { backgroundColor: statusColors.bg }]}>
              <AppText variant="caption" weight="semiBold" color={statusColors.text}>
                {displayStatus}
              </AppText>
            </View>
          </View>
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

      <View style={styles.tabContainer}>
        {(['Active', 'History'] as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <AppText 
                variant="labelLarge" 
                color={isActive ? Colors.primary[500] : Colors.neutral[500]}
                numberOfLines={1}
              >
                {tab}
              </AppText>
              {isActive && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search color={Colors.neutral[400]} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schedule..."
            placeholderTextColor={Colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X color={Colors.neutral[400]} size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SectionList
        sections={getSections()}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <AppText variant="bodyLarge" color={Colors.neutral[500]} center>
              {searchQuery.trim() 
                ? `No schedule found for "${searchQuery}"` 
                : activeTab === 'Active'
                ? 'No active requests in your schedule.'
                : 'No request history found.'}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    marginBottom: verticalScale(16),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTab: {},
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary[500],
  },
  searchRow: {
    paddingHorizontal: horizontalScale(24),
    marginBottom: verticalScale(16),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: 12,
    paddingHorizontal: horizontalScale(16),
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: horizontalScale(12),
    fontSize: 16,
    color: Colors.neutral[900],
    paddingVertical: 0,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  cardTitleContainer: {
    flex: 1,
    justifyContent: 'center',
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
    flexShrink: 0,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(4),
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
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: horizontalScale(6),
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
});
