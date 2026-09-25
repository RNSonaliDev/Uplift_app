import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {Button} from '../../../components/Button';
import {
  Bell
} from 'lucide-react-native';
import {authApi, UserProfileResponse} from '../../../api/auth';
import {donationsApi, Donation, DashboardStats} from '../../../api/donations';
import {api} from '../../../api/client';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import ContributionCard from '../../../components/ContributionCard';

export default function SponsorDashboardScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [contributions, setContributions] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [totalContributed, setTotalContributed] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const profData = await authApi.getProfile();
      setProfile(profData);
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
    
    try {
      const donations = await donationsApi.getDonations();
      setContributions(donations || []);
      const total = (donations || []).reduce((acc, cur) => acc + Number(cur.amount), 0);
      setTotalContributed(total);
    } catch (error) {
      console.error('Failed to fetch donations', error);
    }
    
    try {
      const statsData = await donationsApi.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
    
    try {
      const data = await api.get<any>('/notifications');
      setUnreadCount(data?.unread_count || 0);
    } catch (error) {
      console.log('Failed to fetch notifications count', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const name = profile?.profiles?.sponsor?.first_name || profile?.first_name || 'Sponsor';
  
  // Format the date or use a fallback
  const formatContributionDate = (dateStr: string) => {
    try {
      return formatDate(dateStr);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.primary[500]} barStyle="light-content" />
      <ScrollView 
        style={styles.container} 
        bounces={true} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View style={{justifyContent: 'center'}}>
                <AppText variant="bodyLarge" style={styles.welcomeText}>
                  Welcome back,
                </AppText>
                <AppText variant="h3" style={styles.nameText}>
                  {name}
                </AppText>
              </View>
            </View>
            <TouchableOpacity style={styles.bellIcon} onPress={() => navigation.navigate('Notifications')}>
              <Bell color={Colors.neutral[0]} size={24} />
              {unreadCount > 0 && (
                <View style={styles.unreadBadge} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Impact Card */}
        <View style={styles.impactCardWrapper}>
          <View style={styles.impactCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <AppText variant="h3" style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
                  {stats?.donations_total}
                </AppText>
                <AppText variant="caption" style={styles.statLabel} center>Contribution {"\n"}Count</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <AppText variant="h3" style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
                  ${stats?.amount_donated || 0}
                </AppText>
                <AppText variant="caption" style={styles.statLabel} center>Contribution Amount</AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Button 
            title="Make a Contribution" 
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('ChooseAmount')}
            style={styles.actionBtn}
          />
        </View>

        {/* Recent Contributions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <AppText variant="h5">Recent Contributions</AppText>
            <TouchableOpacity onPress={() => navigation.navigate('ContributionsTab')}>
              <AppText variant="bodyMedium" color={Colors.primary[500]}>View All</AppText>
            </TouchableOpacity>
          </View>

          {/* Contributions List */}
          <View>
            {contributions.length === 0 ? (
              <View style={{padding: 20, alignItems: 'center'}}>
                <AppText variant="bodyMedium" color={Colors.neutral[500]}>No recent contributions.</AppText>
              </View>
            ) : (
              contributions.slice(0, 3).map((contribution) => (
                <ContributionCard
                  key={contribution.id}
                  item={contribution}
                  onPress={() => {}}
                  // onPress={() => navigation.navigate('ContributionsTab', { screen: 'ContributionDetails', params: { contribution } })}
                />
              ))
            )}
          </View>
        </View>
        
        <View style={{height: verticalScale(40)}} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingBottom: verticalScale(80), 
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
  bellIcon: {
    padding: 8,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error as any,
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  impactCardWrapper: {
    paddingHorizontal: horizontalScale(24),
    marginTop: -verticalScale(60), 
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
    color: Colors.primary[500],
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.neutral[500],
  },
  sectionContainer: {
    marginTop: verticalScale(24),
    paddingHorizontal: horizontalScale(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  actionBtn: {
    width: '100%',
  },
});
