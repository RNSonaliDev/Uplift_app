import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {ArrowLeft, ShoppingBag, Pill, FileText} from 'lucide-react-native';
import {AppText} from '../../../components/AppText';
import {Colors} from '../../../theme/colors';
import {api} from '../../../api/client';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {formatDate} from '../../../utils/dateFormatter';

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

  const getCategoryIcon = (title: string) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('pharmacy') || t.includes('medical') || t.includes('pill')) return <Pill color={Colors.primary[500]} size={20} />;
    if (t.includes('grocery') || t.includes('food')) return <ShoppingBag color={Colors.primary[500]} size={20} />;
    return <FileText color={Colors.primary[500]} size={20} />;
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

  const renderCard = ({item}: {item: any}) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        if (activeTab === 'Upcoming') {
          navigation.navigate('RequestDetails', { request: item });
        } else if (activeTab === 'In Progress') {
          navigation.navigate('RequestDetails', { request: item });
        } else if (activeTab === 'Completed') {
          navigation.navigate('RequestDetails', { request: item });
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getCategoryIcon(item.category?.title)}
      </View>
      <View style={styles.cardInfo}>
        <AppText variant="labelLarge" color={Colors.neutral[900]}>
          {item.category?.title || 'Help Request'}
        </AppText>
        <AppText variant="bodyMedium" color={Colors.neutral[700]} style={{marginTop: verticalScale(4)}}>
          {item.hours_required}
        </AppText>
        <AppText variant="bodyMedium" color={Colors.neutral[700]} style={{marginTop: verticalScale(2)}}>
          {item.location?.address || item.meeting_location || 'Location TBD'}
        </AppText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={Colors.neutral[900]} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
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
            style={{fontWeight: activeTab === 'Upcoming' ? '600' : '400'}}
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
            style={{fontWeight: activeTab === 'In Progress' ? '600' : '400'}}
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
            style={{fontWeight: activeTab === 'Completed' ? '600' : '400'}}
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
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: 12,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  cardInfo: {
    flex: 1,
  },
});
