import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {Button} from '../../../components/Button';
import { button_user } from '../../../assets/images';
import {
  Bell,
  Calendar,
  Heart,
  MessageSquare,
  User,
  ShoppingBag,
  MapPin,
  Clock,
  ArrowRightLeft,
  Star,
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

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const [profData, reqData, statsData] = await Promise.all([
            authApi.getProfile(),
            api.get<any[]>('/help_requests/browse'),
            api.get<any>('/dashboard/stats?role=volunteer')
          ]);
          setProfile(profData);
          setRequests(reqData || []);
          setStats(statsData);
        } catch (error) {
          console.error('Failed to fetch data', error);
        } finally {
          setLoadingRequests(false);
        }
      };
      fetchData();
    }, [])
  );

  const name = profile?.first_name || 'Volunteer';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View style={{marginLeft: 16, justifyContent: 'center'}}>
                <AppText variant="bodyLarge" style={styles.welcomeText}>
                  Welcome back,
                </AppText>
                <AppText variant="bodyLarge" style={[styles.nameText, {fontWeight: "400"}]}>
                  {profile ? `${profile.first_name}` : name}
                </AppText>
              </View>
            </View>
            
            {/* <TouchableOpacity style={styles.bellIcon} onPress={() => {}}>
              <Bell color={Colors.neutral[0]} size={24} />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Floating Impact Card */}
        <View style={styles.impactCardWrapper}>
          <View style={styles.impactCard}>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <AppText variant="h3" style={styles.statNumber}>{stats?.hours_completed || 0}</AppText>
                <AppText variant="caption" style={styles.statLabel} center>Hours{'\n'}Contributed</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <AppText variant="h3" style={styles.statNumber}>{stats?.requests_completed || 0}</AppText>
                <AppText variant="caption" style={styles.statLabel} center>Requests{'\n'}Completed</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <AppText variant="h3" style={styles.statNumber}>{stats?.community_help || 0}</AppText>
                <AppText variant="caption" style={styles.statLabel} center>Communities{'\n'}Helped</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Upcoming Requests Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <AppText variant="h5">Upcoming Requests</AppText>
            <TouchableOpacity onPress={() => navigation.navigate('RequestsTab')}>
              <AppText variant="bodyMedium" color={Colors.primary[500]}>View all</AppText>
            </TouchableOpacity>
          </View>

          {/* Request Cards */}
          {loadingRequests ? (
            <View style={[styles.requestCard, {alignItems: 'center', justifyContent: 'center', paddingVertical: 40}]}>
              <AppText variant="bodyMedium" color={Colors.neutral[500]}>Loading requests...</AppText>
            </View>
          ) : requests.length > 0 ? (
            requests.slice(0, 3).map((request, index) => {
              const formatStatus = (status: string) => {
                if (!status) return 'Pending';
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

              const displayStatus = formatStatus(request.status);
              const statusColors = getStatusColors(request.status);

              return (
              <TouchableOpacity 
                key={request.id || index} 
                style={styles.requestCard}
                onPress={() => navigation.navigate('RequestsTab', { screen: 'RequestDetails', params: { request } })}
                activeOpacity={0.7}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.requestIconContainer}>
                    {request.category?.logo_url ? (
                      <Image 
                        source={{ uri: getFullImageUrl(request.category.logo_url) as string }}
                        style={{ width: 24, height: 24 }}
                        resizeMode="contain"
                      />
                    ) : (
                      <ShoppingBag color={Colors.primary[500]} size={20} />
                    )}
                  </View>
                  <View style={styles.requestTitleInfo}>
                    <AppText variant="labelLarge">{request.category?.title || 'Help Request'}</AppText>
                    <AppText variant="bodySmall" color={Colors.neutral[500]}>#{request.reference_number || request.id}</AppText>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                    <AppText variant="labelMedium" color={statusColors.text}>
                      {displayStatus}
                    </AppText>
                  </View>
                </View>
                
                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <Calendar color={Colors.neutral[400]} size={16} />
                    <AppText variant="bodyMedium" color={Colors.neutral[500]} style={styles.detailText}>
                      {formatDate(request.preferred_date)} • {(request.preferred_start_time || request.start_time) ? `${formatTime12Hour(request.preferred_start_time || request.start_time)}${(request.preferred_end_time || request.end_time) ? ` - ${formatTime12Hour(request.preferred_end_time || request.end_time)}` : ''}` : (request.preferred_time || (request.hours_required ? `${request.hours_required} hours` : 'Time TBD'))}
                    </AppText>
                  </View>
                  <View style={styles.detailRow}>
                    <MapPin color={Colors.neutral[400]} size={16} />
                    <AppText variant="bodyMedium" color={Colors.neutral[500]} style={styles.detailText} numberOfLines={1}>
                      {request.location?.address || request.meeting_location || 'Location TBD'}
                    </AppText>
                  </View>
                  {request.distance_km != null && (
                    <View style={styles.detailRow}>
                      <MapPin color={Colors.primary[500]} size={16} />
                      <AppText variant="bodyMedium" color={Colors.primary[600]} style={styles.detailText}>
                        {request.distance_km.toFixed(1)} km away {request.within_service_radius ? '(In Range)' : ''}
                      </AppText>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )})
          ) : (
            <View style={[styles.requestCard, {alignItems: 'center', justifyContent: 'center', paddingVertical: 40}]}>
              <AppText variant="bodyMedium" color={Colors.neutral[500]}>No pending requests nearby.</AppText>
            </View>
          )}

          <Button 
            title="Browse Requests" 
            onPress={() => navigation.navigate('RequestsTab')}
            style={styles.browseBtn}
          />
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
    backgroundColor: Colors.neutral[50],
  },
  container: {
    flex: 1,
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
});
