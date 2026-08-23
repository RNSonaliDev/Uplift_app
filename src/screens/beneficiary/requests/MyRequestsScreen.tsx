import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {api, getFullImageUrl} from '../../../api/client';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Pill,
  Car,
  Plus,
} from 'lucide-react-native';

export default function MyRequestsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/help_requests');
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const activeRequests = requests.filter(r => r.status === 'pending' || r.status === 'accepted' || r.status === 'assigned');
  const historyRequests = requests.filter(r => r.status === 'completed' || r.status === 'cancelled');
  const displayRequests = activeTab === 'Active' ? activeRequests : historyRequests;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <View style={{width: 28}} />
      </View>

      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
            onPress={() => setActiveTab('Active')}
          >
            <Text style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'History' && styles.activeTab]}
            onPress={() => setActiveTab('History')}
          >
            <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading...</Text>
            </View>
          ) : displayRequests.length > 0 ? (
            displayRequests.map((req: any) => (
              <RequestCard 
                key={req.id.toString()}
                icon={<ShoppingCart color={Colors.primary[500]} size={24} />}
                title={req.category?.title || 'Help Request'}
                date={req.preferred_date}
                location={req.location?.address || req.meeting_location}
                status={req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                statusColor={req.status === 'pending' ? Colors.warning : Colors.info}
                helperImage={getFullImageUrl(req.volunteer?.profile_image_url) || undefined}
                onPress={() => navigation.navigate('RequestTracking', { requestId: req.id })}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No requests found.</Text>
            </View>
          )}
        </ScrollView>
      </View>
      
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateRequest')}
      >
        <Plus color={Colors.neutral[0]} size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const RequestCard = ({
  icon, title, date, location, status, statusColor, helperImage, onPress
}: {
  icon: React.ReactNode, title: string, date: string, location: string, status: string, statusColor: string, helperImage?: string, onPress: () => void
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDate}>{date}</Text>
      </View>
      <ChevronRight color={Colors.primary[300]} size={20} />
    </View>
    <View style={styles.cardBody}>
      <Text style={styles.cardLocation}>{location}</Text>
    </View>
    <View style={styles.cardFooter}>
      <Text style={[styles.statusText, {color: statusColor}]}>{status}</Text>
      {helperImage && (
        <Image source={{uri: helperImage}} style={styles.helperAvatar} />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[500],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[0],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary[500],
  },
  tabText: {
    ...Typography.labelMedium,
    color: Colors.neutral[500],
  },
  activeTabText: {
    color: Colors.primary[500],
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  cardDate: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  cardBody: {
    marginLeft: 52,
    marginBottom: 12,
  },
  cardLocation: {
    ...Typography.caption,
    color: Colors.neutral[500],
    lineHeight: 18,
  },
  cardFooter: {
    marginLeft: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    ...Typography.labelMedium,
  },
  helperAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
});
