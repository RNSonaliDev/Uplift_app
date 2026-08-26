import React, {useState, useCallback} from 'react';
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
import Svg, {Path, Circle} from 'react-native-svg';
import {api, getFullImageUrl} from '../../../api/client';
import {authApi, CategoryResponse, UserProfileResponse} from '../../../api/auth';
import {AppText} from '../../../components/AppText';
import {Colors} from '../../../theme/colors';
import {Typography, FontFamily} from '../../../theme/typography';
import {horizontalScale, verticalScale, moderateScale} from '../../../utils/responsive';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
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
} from 'lucide-react-native';

export default function BeneficiaryDashboardScreen() {
  const navigation = useNavigation<any>();
  const [upcomingRequest, setUpcomingRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  const getBadgeColors = (status: string) => {
    if (!status) return { bg: '#E0DEFF', text: '#6D5DF6' };
    const s = status.toLowerCase();
    if (s === 'confirmed' || s === 'completed' || s === 'accepted') return { bg: '#DCFCE7', text: '#16A34A' };
    if (s === 'pending') return { bg: '#FEF3C7', text: '#D97706' };
    return { bg: '#E0DEFF', text: '#6D5DF6' };
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        try {
          const [catData, profData] = await Promise.all([
            authApi.getCategories(),
            authApi.getProfile()
          ]);
          if (!isActive) return;
          const beneficiaryCategories = catData.filter(c => c.category_type === 'beneficiary');
          setCategories(beneficiaryCategories);
          setProfile(profData);
        } catch (error) {
          console.error('Failed to fetch data', error);
        }
      };
      fetchData();
      return () => { isActive = false; };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchRequests = async () => {
        try {
          setLoading(true);
          const data = await api.get<any[]>('/help_requests');
          if (!isActive) return;
          const active = data.find(r => r.status === 'pending' || r.status === 'accepted' || r.status === 'assigned');
          setUpcomingRequest(active || null);
        } catch (error) {
          console.error('Failed to fetch requests', error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchRequests();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View style={{marginLeft: 16, justifyContent: 'center'}}>
                <AppText variant="bodyLarge" style={styles.welcomeText}>
                  Welcome back,
                </AppText>
                <AppText variant="bodyLarge" style={[styles.nameText, {fontWeight: "400"}]}>
                  {profile ? `${profile.first_name}` : 'User'}
                </AppText>
              </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {/* <TouchableOpacity 
                style={styles.notificationBtn}
                onPress={() => profile && navigation.navigate('DashboardRoleSelection', { selectedRoles: profile.selected_roles || [] })}
              >
                <ArrowRightLeft color={Colors.neutral[0]} size={22} />
              </TouchableOpacity> */}
              {/* <TouchableOpacity style={styles.notificationBtn}>
                <Bell color={Colors.neutral[0]} size={24} />
                <View style={styles.notificationDot} />
              </TouchableOpacity> */}
            </View>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Upcoming Request */}
          <Text style={styles.sectionTitle}>Upcoming Request</Text>
          {loading ? (
            <View style={[styles.card, {alignItems: 'center', justifyContent: 'center', paddingVertical: 40}]}>
              <Text style={{color: Colors.neutral[500]}}>Loading...</Text>
            </View>
          ) : upcomingRequest ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  {upcomingRequest.category?.logo_url ? (
                    <Image 
                      source={{ uri: getFullImageUrl(upcomingRequest.category.logo_url) as string }}
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <ShoppingCart color={Colors.primary[500]} size={24} />
                  )}
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={[styles.cardTitle, { marginBottom: 4 }]}>{upcomingRequest.category?.title}</Text>
                  <Text style={{ ...Typography.caption, color: Colors.neutral[600], marginBottom: 6 }}>
                    #{upcomingRequest.reference_number || upcomingRequest.id}
                  </Text>
                </View>
                {upcomingRequest.status && (
                  <View style={[styles.statusBadge, { backgroundColor: getBadgeColors(upcomingRequest.status).bg, alignSelf: 'flex-start' }]}>
                    <Text style={[styles.statusBadgeText, { color: getBadgeColors(upcomingRequest.status).text }]}>
                      {upcomingRequest.status.charAt(0).toUpperCase() + upcomingRequest.status.slice(1)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ marginBottom: 16 }}>
                <View style={styles.row}>
                  <Calendar color={Colors.neutral[500]} size={14} />
                  <Text style={styles.cardSubtitle}> {formatDate(upcomingRequest.preferred_date)}{upcomingRequest.preferred_start_time ? ` • ${formatTime12Hour(upcomingRequest.preferred_start_time)}${upcomingRequest.preferred_end_time ? ` - ${formatTime12Hour(upcomingRequest.preferred_end_time)}` : ''}` : ''}</Text>
                </View>
                <View style={[styles.row, { alignItems: 'flex-start' }]}>
                  <View style={{ marginTop: 2 }}>
                    <MapPin color={Colors.neutral[500]} size={14} />
                  </View>
                  <Text style={[styles.cardSubtitle, { flex: 1, marginLeft: 6 }]} numberOfLines={1}>{upcomingRequest.location?.address || upcomingRequest.meeting_location || 'Location TBD'}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.requestHelpBtn}
                onPress={() => navigation.navigate('RequestsTab', { screen: 'RequestTracking', params: { requestId: upcomingRequest.id } })}
              >
                <Text style={styles.requestHelpText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.card, {alignItems: 'center'}]}>
              <Text style={{color: Colors.neutral[500], marginBottom: 16}}>No upcoming requests.</Text>
              <TouchableOpacity 
                style={[styles.requestHelpBtn, {width: '100%'}]}
                onPress={() => navigation.navigate('RequestHelp')}
              >
                <Plus color={Colors.neutral[0]} size={20} />
                <Text style={styles.requestHelpText}>Create Request Help</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          {/* <Text style={styles.sectionTitle}>Quick Actions</Text> */}
          <View style={styles.quickActionsContainer}>
            {/* <QuickActionItem 
              icon={<FileText color={Colors.neutral[700]} size={24} strokeWidth={1.5} />} 
              label="My Requests" 
              onPress={() => navigation.navigate('RequestsTab' as never)}
            /> */}
            {/* <QuickActionItem 
              icon={<MessageSquare color={Colors.neutral[700]} size={24} strokeWidth={1.5} />} 
              label="Message" 
              onPress={() => navigation.navigate('MessagesTab' as never)}
            /> */}
            {/* <QuickActionItem 
              icon={<User color={Colors.neutral[700]} size={24} strokeWidth={1.5} />} 
              label="My Profile" 
              onPress={() => navigation.navigate('ProfileTab' as never)}
            /> */}
            {/* <QuickActionItem 
              icon={<Heart color={Colors.neutral[700]} size={24} strokeWidth={1.5} />} 
              label="Donate" 
              onPress={() => {}}
            /> */}
          </View>

          {/* Need Help with? */}
          <Text style={styles.sectionTitle}>Need Help with?</Text>
          {categories.length > 0 ? (
            categories.map((category) => {
              let IconComponent = ShoppingCart;
              if (category.title.toLowerCase().includes('pharmacy') || category.title.toLowerCase().includes('medical') || category.title.toLowerCase().includes('pill')) {
                IconComponent = Pill;
              } else if (category.title.toLowerCase().includes('grocery') || category.title.toLowerCase().includes('food')) {
                IconComponent = ShoppingCart;
              } else {
                IconComponent = FileText;
              }

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
                      <IconComponent color={Colors.primary[500]} size={24} />
                    )
                  }
                  title={category.title}
                  onPress={() => navigation.navigate('RequestsTab', {
                  screen: 'CreateRequest',
                  params: { category_id: category.id.toString() }
                })}
                />
              );
            })
          ) : (
            <Text style={{color: Colors.neutral[500]}}>Loading categories...</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  content: {
    flexGrow: 1,
  },
  header: {
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
    marginBottom: verticalScale(20),
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
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.labelLarge,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: verticalScale(4),
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
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
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
});
