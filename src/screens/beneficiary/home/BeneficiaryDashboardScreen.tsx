import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Svg, {Path, Circle} from 'react-native-svg';
import {api} from '../../../api/client';
import {authApi, CategoryResponse, UserProfileResponse} from '../../../api/auth';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
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

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, profData] = await Promise.all([
          authApi.getCategories(),
          authApi.getProfile()
        ]);
        setCategories(catData);
        setProfile(profData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

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
            <View style={styles.logoContainer}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M6 10V14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14V10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                <Circle cx="8" cy="4" r="2" fill="#FFFFFF" />
                <Circle cx="16" cy="4" r="2" fill="#FFFFFF" />
              </Svg>
              <Text style={styles.brandText}>Uplift</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity 
                style={styles.notificationBtn}
                onPress={() => profile && navigation.navigate('DashboardRoleSelection', { selectedRoles: profile.selected_roles || [] })}
              >
                <ArrowRightLeft color={Colors.neutral[0]} size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.notificationBtn}>
                <Bell color={Colors.neutral[0]} size={24} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>Sarah</Text>
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
                  <ShoppingCart color={Colors.primary[500]} size={24} />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{upcomingRequest.category?.title || 'Help Request'}</Text>
                  <View style={styles.row}>
                    <Calendar color={Colors.neutral[500]} size={14} />
                    <Text style={styles.cardSubtitle}> {upcomingRequest.preferred_date || 'Date TBD'}</Text>
                  </View>
                  <View style={styles.row}>
                    <MapPin color={Colors.neutral[500]} size={14} />
                    <Text style={styles.cardSubtitle} numberOfLines={2}> {upcomingRequest.location?.address || upcomingRequest.meeting_location || 'Location TBD'}</Text>
                  </View>
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionItem 
              icon={<FileText color={Colors.neutral[700]} size={24} strokeWidth={1.5} />} 
              label="My Requests" 
              onPress={() => navigation.navigate('RequestsTab' as never)}
            />
            {/* <QuickActionItem 
              icon={<MessageSquare color={Colors.neutral[700]} size={24} strokeWidth={1.5} />} 
              label="Message" 
              onPress={() => navigation.navigate('MessagesTab' as never)}
            /> */}
            <QuickActionItem 
              icon={<User color={Colors.neutral[700]} size={24} strokeWidth={1.5} />} 
              label="My Profile" 
              onPress={() => navigation.navigate('ProfileTab' as never)}
            />
            <QuickActionItem 
              icon={<Heart color={Colors.neutral[700]} size={24} strokeWidth={1.5} />} 
              label="Donate" 
              onPress={() => {}}
            />
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
                  icon={<IconComponent color={Colors.primary[500]} size={24} />}
                  title={category.title}
                  onPress={() => navigation.navigate('RequestHelp', { category_id: category.id.toString() })}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    ...Typography.h4,
    color: Colors.neutral[0],
    marginLeft: 8,
    fontWeight: 'bold',
  },
  welcomeText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[200],
  },
  nameText: {
    ...Typography.h3,
    color: Colors.neutral[0],
    marginTop: 4,
  },
  notificationBtn: {
    padding: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  mainContent: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 20,
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
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginLeft: 4,
  },
  cardSubtext: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginLeft: 18,
  },
  requestHelpBtn: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  requestHelpText: {
    ...Typography.buttonMedium,
    color: Colors.neutral[0],
    marginLeft: 8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginBottom: 24,
    gap:20
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionLabel: {
    ...Typography.caption,
    color: Colors.neutral[700],
    fontWeight: '500',
  },
  helpCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  helpCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpCategoryTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
  },
});
