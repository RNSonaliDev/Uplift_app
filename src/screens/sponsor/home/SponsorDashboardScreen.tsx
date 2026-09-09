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
  Heart,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronRight,
  Bell
} from 'lucide-react-native';
import {authApi, UserProfileResponse} from '../../../api/auth';
import {donationsApi, Donation, DashboardStats} from '../../../api/donations';
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const name = profile?.first_name || 'Sponsor';
  
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
                  {profile ? `${profile.first_name}` : `Compassion ${name}`} 
                </AppText>
              </View>
            </View>
            <TouchableOpacity style={styles.bellIcon} onPress={() => navigation.navigate('Notifications')}>
              <Bell color={Colors.neutral[0]} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Impact Card */}
        <View style={styles.impactCardWrapper}>
          <View style={styles.impactCard}>
            <View>
              <AppText variant="caption" style={styles.totalLabel}>Total Contributed</AppText>
              <AppText variant="h1" style={styles.totalAmount}>${stats ? stats.amount_donated : totalContributed}</AppText>
              <AppText variant="caption" style={styles.totalLabelBottom}>All time</AppText>
            </View>
            <View style={styles.iconContainer}>
              <Heart color={Colors.primary[300]} size={48} strokeWidth={1.5} />
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <TrendingUp color={Colors.primary[500]} size={20} />
              </View>
              <AppText variant="h5" style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
                {stats ? (stats.donations_total + stats.donations_pending) : contributions.length}
              </AppText>
              <AppText variant="caption" style={styles.statLabel} center>Contributions</AppText>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <DollarSign color={Colors.primary[500]} size={20} />
              </View>
              <AppText variant="h5" style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
                ${contributions[0]?.amount || 0}
              </AppText>
              <AppText variant="caption" style={styles.statLabel} center>Last Contribution</AppText>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Calendar color={Colors.primary[500]} size={20} />
              </View>
              <AppText variant="h5" style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
                {stats?.last_donation_at 
                  ? formatContributionDate(stats.last_donation_at) 
                  : (contributions[0]?.created_at ? formatContributionDate(contributions[0].created_at) : 'N/A')}
              </AppText>
              <AppText variant="caption" style={styles.statLabel} center>Last Contribution Date</AppText>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Button 
            title="Make a Contribution" 
            onPress={() => navigation.navigate('ChooseAmount')}
            style={styles.actionBtn}
          />
        </View>

        {/* Recent Contributions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <AppText variant="h5">Recent Contributions</AppText>
            <TouchableOpacity onPress={() => navigation.navigate('ContributionsTab', { screen: 'ContributionsList' })}>
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
                  onPress={() => navigation.navigate('ContributionsTab', { screen: 'ContributionDetails', params: { contribution } })}
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
  },
  impactCardWrapper: {
    paddingHorizontal: horizontalScale(24),
    marginTop: -verticalScale(60), 
  },
  impactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary[600],
    borderRadius: 16,
    padding: moderateScale(24),
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: verticalScale(16),
  },
  totalLabel: {
    color: Colors.neutral[100],
    marginBottom: 8,
  },
  totalAmount: {
    color: Colors.neutral[0],
    marginBottom: 4,
  },
  totalLabelBottom: {
    color: Colors.neutral[200],
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: horizontalScale(8),
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(12),
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconCircle: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  statNumber: {
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.neutral[500],
    fontSize: 10,
    textAlign: 'center',
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
