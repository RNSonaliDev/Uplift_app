import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {FontFamily} from '../../../theme/typography';
import {AppText} from '../../../components/AppText';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {Button} from '../../../components/Button';
import {CategoryIcon} from '../../../components/CategoryIcon';
import { button_user } from '../../../assets/images';
import {
  Bell,
  Calendar,
  Heart,
  MessageSquare,
  User,
  Building,
  ShoppingBag,
  MapPin,
  Clock,
  ArrowRightLeft,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import {authApi, UserProfileResponse} from '../../../api/auth';
import {api, getFullImageUrl} from '../../../api/client';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';

export default function VolunteerDashboardScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [profData, reqData, statsData, notifData] = await Promise.all([
        authApi.getProfile(),
        api.get<any[]>('/help_requests/browse'),
        api.get<any>('/dashboard/stats?role=volunteer'),
        api.get<any>('/notifications')
      ]);
      setProfile(profData);
      setRequests(reqData || []);
      setStats(statsData);
      setUnreadNotificationsCount(notifData?.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const name = profile?.profiles?.volunteer?.first_name || profile?.first_name || 'Volunteer';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.primary[500]} barStyle="light-content" />
      <ScrollView 
        style={styles.container} 
        bounces={true} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary[500]]} />
        }
      >
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View style={{marginLeft: 16, justifyContent: 'center'}}>
                <AppText variant="bodyLarge" style={styles.welcomeText}>
                  Welcome back,
                </AppText>
                <AppText variant="h3" style={styles.nameText}>
                  {name}
                </AppText>
              </View>
            </View>
            
            <TouchableOpacity style={styles.bellIcon} onPress={() => navigation.navigate('Notifications')}>
              {unreadNotificationsCount > 0 && <View style={styles.notificationBadge} />}
              <Bell color={Colors.neutral[0]} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Impact Card */}
        <View style={styles.impactCardWrapper}>
          <View style={styles.impactCard}>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <AppText variant="h3" style={styles.statNumber}>{stats?.hours_completed || 0}</AppText>
                <AppText variant="caption" style={styles.statLabel} center>Hours {"\n"}volunteered</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <AppText variant="h3" style={styles.statNumber}>{stats?.requests_completed || 0}</AppText>
                <AppText variant="caption" style={styles.statLabel} center>Requests {"\n"}completed </AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <AppText variant="h3" style={styles.statNumber}>{stats?.community_help || 0}</AppText>
                <AppText variant="caption" style={styles.statLabel} center>Communities {"\n"}helped</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Browse Support Section */}
        <View style={styles.sectionContainer}>
          <AppText variant="h5" style={styles.browseSectionTitle}>Browse support requests</AppText>
          <View style={styles.browseCardsRow}>
            <TouchableOpacity 
              style={styles.browseSupportCard}
              onPress={() => navigation.navigate('RequestsTab', { screen: 'BrowseRequests', params: { activeTab: 'beneficiary', timestamp: Date.now() } })}
              activeOpacity={0.7}
            >
              <View style={styles.browseCardTop}>
                <View style={[styles.browseIconCircle, { backgroundColor: Colors.primary[50] }]}>
                  <User color={Colors.primary[500]} size={22} />
                </View>
                <View style={styles.browseArrowCircle}>
                  <ChevronRight color={Colors.primary[500]} size={16} />
                </View>
              </View>
              <AppText variant="labelLarge" weight="semiBold" color={Colors.neutral[900]} style={styles.browseCardTitle}>Beneficiary</AppText>
              <AppText variant="caption" color={Colors.neutral[500]} style={styles.browseCardDesc}>Help individuals with daily needs & errands</AppText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.browseSupportCard}
              onPress={() => navigation.navigate('RequestsTab', { screen: 'BrowseRequests', params: { activeTab: 'organization', timestamp: Date.now() } })}
              activeOpacity={0.7}
            >
              <View style={styles.browseCardTop}>
                <View style={[styles.browseIconCircle, { backgroundColor: Colors.secondary[50] }]}>
                  <Building color={Colors.secondary[500]} size={22} />
                </View>
                <View style={styles.browseArrowCircle}>
                  <ChevronRight color={Colors.secondary[500]} size={16} />
                </View>
              </View>
              <AppText variant="labelLarge" weight="semiBold" color={Colors.neutral[900]} style={styles.browseCardTitle}>Organization</AppText>
              <AppText variant="caption" color={Colors.neutral[500]} style={styles.browseCardDesc}>Volunteer for community events & programs</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.sectionContainer, {marginBottom: verticalScale(40)}]}>
          {/* <AppText variant="h5" style={{marginBottom: verticalScale(16)}}>Quick Actions</AppText> */}
          <View style={styles.quickActionsGrid}>
            {/* <QuickAction 
              icon={<Calendar color={Colors.neutral[600]} size={24} />} 
              label="My Schedule"
              onPress={() => navigation.navigate('ScheduleTab')}
            /> */}
            {/* <QuickAction 
              icon={<MessageSquare color={Colors.neutral[600]} size={24} />} 
              label="Messages"
              onPress={() => {}}
            /> */}
            {/* <QuickAction 
              icon={<User color={Colors.neutral[600]} size={24} />} 
              label="My Profile"
              onPress={() => navigation.navigate('ProfileTab')}
            /> */}
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const QuickAction = ({icon, label, onPress}: any) => (
  <TouchableOpacity style={styles.quickActionItem} onPress={onPress}>
    <View style={styles.quickActionIcon}>
      {icon}
    </View>
    <AppText variant="caption" color={Colors.neutral[700]} center>{label}</AppText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[500],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(60), // Extra padding for the overlapping card
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: Colors.neutral[100],
    marginBottom: 4,
  },
  nameText: {
    color: Colors.neutral[0],
  },
  avatar: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    borderWidth: 2,
    borderColor: Colors.neutral[0],
  },
  bellIcon: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    zIndex: 1,
  },
  impactCardWrapper: {
    paddingHorizontal: horizontalScale(24),
    marginTop: -verticalScale(40), // Pulls the card up over the header
  },
  impactCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(20),
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  impactTitle: {
    color: Colors.neutral[900],
    marginBottom: verticalScale(16),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral[200],
  },
  statNumber: {
    color: Colors.primary[500],
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.neutral[500],
  },
  sectionContainer: {
    marginTop: verticalScale(32),
    paddingHorizontal: horizontalScale(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  requestCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: verticalScale(16),
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  requestTitleInfo: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: 12,
  },
  requestDetails: {
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
  browseBtn: {
    marginTop: verticalScale(8),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: "flex-start"
  },
  quickActionItem: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: 28,
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  supportCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  supportIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseSectionTitle: {
    marginBottom: verticalScale(16),
    color: Colors.neutral[900],
  },
  browseCardsRow: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },
  browseSupportCard: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  browseCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: verticalScale(12),
  },
  browseIconCircle: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseArrowCircle: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: Colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseCardTitle: {
    marginBottom: verticalScale(4),
  },
  browseCardDesc: {
    lineHeight: moderateScale(16),
  },
});
