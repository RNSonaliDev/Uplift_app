import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Svg, {Path, Circle} from 'react-native-svg';
import {api, getFullImageUrl} from '../../../api/client';
import {authApi, CategoryResponse, UserProfileResponse} from '../../../api/auth';
import {notificationsApi, AppNotification} from '../../../api/notifications';
import {AppText} from '../../../components/AppText';
import {Colors} from '../../../theme/colors';
import {Typography, FontFamily} from '../../../theme/typography';
import {horizontalScale, verticalScale, moderateScale} from '../../../utils/responsive';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {formatStatus, getStatusColors} from '../../../utils/statusUtils';
import {CategoryIcon} from '../../../components/CategoryIcon';
import {logo} from '../../../assets/images';
import {
  ArrowRightLeft,
  Bell,
  Plus,
  List,
  MessageSquare,
  User,
  Heart,
  ShoppingCart,
  Pill,
  ChevronRight,
  MapPin,
  Calendar,
  FileText,
  Clock,
} from 'lucide-react-native';

export default function BeneficiaryDashboardScreen() {
  const navigation = useNavigation<any>();
  const [activeAndPendingRequests, setActiveAndPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<any>(null);

  const isFirstMount = React.useRef(true);

  const fetchData = useCallback(async () => {
    try {
      if (isFirstMount.current) {
        setLoading(true);
      }
      const [catData, profData, reqData, notifData, statsData] = await Promise.all([
        authApi.getCategories(),
        authApi.getProfile(),
        api.get<any[]>('/help_requests'),
        api.get<any>('/notifications').catch(() => null),
        api.get<any>('/dashboard/stats').catch(() => null)
      ]);
      const beneficiaryCategories = catData.filter(c => c.category_type === 'beneficiary');
      setCategories(beneficiaryCategories);
      setProfile(profData);
      setStats(statsData);
      
      
      setUnreadNotifications(notifData?.unread_count > 0);
      const activeAccepted = (reqData || []).filter(
        (r: any) =>
          r.status === 'accepted' ||
          r.status === 'assigned' ||
          r.status === 'on_the_way' ||
          r.status === 'in_progress' ||
          r.status === 'confirmed'
      );
      const activePending = (reqData || []).filter(
        (r: any) => r.status === 'pending'
      );
      setActiveAndPendingRequests([...activeAccepted, ...activePending]);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
      isFirstMount.current = false;
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

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[
          styles.content,
          activeAndPendingRequests.length > 0 ? { paddingBottom: verticalScale(90) } : null,
        ]}
        bounces={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary[500]]}
            tintColor={Colors.neutral[0]}
            progressBackgroundColor={Colors.neutral[0]}
          />
        }
      >
        <View style={{ position: 'absolute', top: -1000, left: 0, right: 0, height: 1000, backgroundColor: Colors.primary[500] }} />
        {/* Header Section */}
        <View style={[styles.header, { paddingBottom: verticalScale(60), borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }]}>
          <View style={styles.headerTopRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View style={{marginLeft: 16, justifyContent: 'center'}}>
                <AppText variant="bodyLarge" style={styles.welcomeText}>
                  Welcome back,
                </AppText>
                <AppText variant="bodyLarge" style={[styles.nameText, {fontWeight: "400"}]}>
                  {profile?.profiles?.beneficiary?.first_name || profile?.first_name || 'User'}
                </AppText>
              </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Notifications')}>
                <Bell color={Colors.neutral[0]} size={24} />
                {unreadNotifications && <View style={styles.notificationDot} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Floating Impact Card */}
        <View style={styles.impactCardWrapper}>
          <View style={styles.impactCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <AppText variant="h3" style={styles.statNumber}>{stats?.hours_given || 0}</AppText>
                <AppText variant="caption" style={styles.statLabel} center>Hours {'\n'}served</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <AppText variant="h3" style={styles.statNumber}>{stats?.requests_given || 0}</AppText>
                <AppText variant="caption" style={styles.statLabel} center>Requests {'\n'}completed</AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.mainContent, { borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingTop: verticalScale(32) }]}>
          {/* Active and Pending Requests */}
          {activeAndPendingRequests.length > 0 && (
            <>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 16}}>
                <Text style={[styles.sectionTitle, {marginTop: 0, marginBottom: 0}]}>Accepted & Pending Requests</Text>
              </View>
              {loading ? (
                <View style={[styles.card, {alignItems: 'center', justifyContent: 'center', paddingVertical: 40}]}>
                  <Text style={{color: Colors.neutral[500]}}>Loading...</Text>
                </View>
              ) : (
                activeAndPendingRequests.map((request: any) => (
                  <TouchableOpacity 
                    key={request.id}
                    style={[styles.card, { marginBottom: verticalScale(16) }]}
                    onPress={() => navigation.navigate('BeneficiaryRequestDetails', { requestId: request.id })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.iconContainer}>
                        {request.category?.logo_url ? (
                          <Image 
                            source={{ uri: getFullImageUrl(request.category.logo_url) as string }}
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                          />
                        ) : (
                          <CategoryIcon title={request.category?.title} color={Colors.primary[500]} size={24} />
                        )}
                      </View>
                      <View style={styles.cardTitleContainer}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{request.category?.title || 'Help Request'}</Text>
                      </View>
                    </View>

                    <View style={{ marginBottom: 4 }}>
                      {request.title ? (
                        <Text style={{ ...Typography.bodyMedium, color: Colors.neutral[800], marginBottom: 4, fontFamily: FontFamily.medium }}>
                          {request.title}
                        </Text>
                      ) : null}
                      <Text style={{ ...Typography.caption, color: Colors.neutral[600], marginBottom: 8 }}>
                        #{request.reference_number || request.id}
                      </Text>
                      <View style={styles.row}>
                        <Calendar color={Colors.neutral[500]} size={14} />
                        <Text style={styles.cardSubtitle}> {formatDate(request.preferred_date)}</Text>
                      </View>
                      {(request.preferred_start_time || request.preferred_end_time || request.hours_required) ? (
                        <View style={[styles.row, { alignItems: 'flex-start', marginTop: 4 }]}>
                          <Clock color={Colors.neutral[500]} size={14} />
                          <Text style={styles.cardSubtitle}>
                            {request.preferred_start_time ? ` ${formatTime12Hour(request.preferred_start_time)}${request.preferred_end_time ? ` - ${formatTime12Hour(request.preferred_end_time)}` : ''}` : ''}
                            {request.preferred_start_time && request.hours_required ? ' ' : ''}
                            {request.hours_required ? `(${request.hours_required} hours)` : ''}
                          </Text>
                        </View>
                      ) : null}
                      <View style={[styles.row, { alignItems: 'flex-start', marginTop: 4 }]}>
                        <View style={{ marginTop: 2 }}>
                          <MapPin color={Colors.neutral[500]} size={14} />
                        </View>
                        <Text style={[styles.cardSubtitle, { flex: 1, marginLeft: 6 }]} numberOfLines={1}>{request.location?.address || request.meeting_location || 'Location TBD'}</Text>
                      </View>
                    </View>

                    {request.status && (
                      <View style={styles.cardBottomRow}>
                        <View />
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColors(request.status).bg }]}>
                          <Text style={[styles.statusBadgeText, { color: getStatusColors(request.status).text }]}>
                            {formatStatus(request.status)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {/* Need help? Create a request (Shown when both active and pending are complete) */}
          {activeAndPendingRequests.length === 0 && (
            <>
              <Text style={styles.sectionTitle}>Need help? Create a request</Text>
              {categories.length > 0 ? (
                categories.map((category) => {
                  return (
                    <HelpCategoryItem 
                      key={category.id}
                      icon={
                        category.logo_url ? (
                          <Image 
                            source={{ uri: getFullImageUrl(category.logo_url) as string }}
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                          />
                        ) : (
                          <CategoryIcon title={category.title} color={Colors.primary[500]} size={24} />
                        )
                      }
                      title={category.title}
                      onPress={() => navigation.navigate('CreateRequest', {
                        category_id: category.id.toString(), fromDashboard: true
                      })}
                    />
                  );
                })
              ) : (
                <Text style={{color: Colors.neutral[500]}}>Loading categories...</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating '+ Create Request' button in blue (Same as other screen) */}
      {activeAndPendingRequests.length > 0 && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate('RequestHelp')}
          activeOpacity={0.8}
        >
          <Plus color={Colors.neutral[0]} size={20} />
          <AppText variant="buttonMedium" color={Colors.neutral[0]} style={{ marginLeft: 6 }}>
            New Request
          </AppText>
        </TouchableOpacity>
      )}
      </View>
      </SafeAreaView>
    </>
  );
}

const QuickActionItem = ({icon, label, onPress}: {icon: React.ReactNode, label: string, onPress: () => void}) => (
  <TouchableOpacity style={styles.quickActionItem} onPress={onPress}>
    <View style={styles.quickActionIcon}>{icon}</View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const HelpCategoryItem = ({icon, title, onPress}: {icon: React.ReactNode, title: string, onPress: () => void}) => (
  <TouchableOpacity style={styles.helpCategoryItem} onPress={onPress}>
    <View style={styles.helpCategoryLeft}>
      <View style={styles.helpCategoryIcon}>{icon}</View>
      <Text style={styles.helpCategoryTitle}>{title}</Text>
    </View>
    <ChevronRight color={Colors.neutral[400]} size={20} />
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
  content: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
    // paddingBottom: verticalScale(40),
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  logoContainer: {
    // alignItems: 'center',
  },
  brandText: {
    ...Typography.h4,
    color: Colors.neutral[0],
    marginLeft: horizontalScale(8),
  },
  welcomeText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[200],
  },
  nameText: {
    ...Typography.h3,
    color: Colors.neutral[0],
    marginTop: verticalScale(4),
  },
  notificationBtn: {
    padding: moderateScale(8),
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: moderateScale(8),
    right: moderateScale(8),
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: Colors.error,
  },
  mainContent: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderTopLeftRadius: moderateScale(32),
    borderTopRightRadius: moderateScale(32),
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(32),
    paddingBottom: verticalScale(24),
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
    marginBottom: verticalScale(16),
    marginTop: verticalScale(8),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginBottom: verticalScale(24),
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(2)},
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  iconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
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
    ...Typography.h3,
    color: Colors.primary[500],
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  cardTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    ...Typography.bodyLarge,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: Colors.neutral[900],
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(6),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.neutral[600],
    marginLeft: horizontalScale(4),
  },
  cardSubtext: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginLeft: horizontalScale(18),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    flexShrink: 0,
  },
  statusBadgeText: {
    ...Typography.labelSmall,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  requestHelpBtn: {
    backgroundColor: Colors.primary[500],
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
  },
  requestHelpText: {
    ...Typography.buttonMedium,
    color: Colors.neutral[0],
    marginLeft: horizontalScale(8),
  },
  quickActionsContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(24),
    gap: horizontalScale(20),
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(2)},
    shadowOpacity: 0.03,
    shadowRadius: moderateScale(4),
    elevation: 1,
  },
  quickActionLabel: {
    ...Typography.caption,
    color: Colors.neutral[700],
    fontFamily: FontFamily.medium,
  },
  helpCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(2)},
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  helpCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpCategoryIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  helpCategoryTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
  },
  fab: {
    position: 'absolute',
    bottom: verticalScale(24),
    right: horizontalScale(24),
    height: moderateScale(52),
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(26),
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(4)},
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(12),
    elevation: 5,
    zIndex: 999,
  },
});
