import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useFocusEffect, useRoute} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {FontFamily} from '../../../theme/typography';
import {AppText} from '../../../components/AppText';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {formatStatus, getStatusColors} from '../../../utils/statusUtils';
import {CategoryIcon} from '../../../components/CategoryIcon';
import {
  Search,
  Filter,
  ShoppingBag,
  Pill,
  Clock,
  Calendar,
  MapPin,
  FileText,
  X,
} from 'lucide-react-native';
import {authApi, CategoryResponse} from '../../../api/auth';
import {api, getFullImageUrl} from '../../../api/client';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';

export default function BrowseRequestsScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [orgCategories, setOrgCategories] = useState<CategoryResponse[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState<'beneficiary' | 'organization'>(route.params?.activeTab || 'beneficiary');

  useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params?.activeTab]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [catData, orgCatData, reqData] = await Promise.all([
            authApi.getCategories(),
            authApi.getOrganizationCategories(),
            api.get<any[]>('/help_requests/browse')
          ]);
          setCategories(catData);
          setOrgCategories(orgCatData);
          setRequests(reqData || []);
        } catch (error) {
          console.error('Failed to fetch data', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [route.params?.activeTab])
  );

  const filteredRequests = requests.filter(req => {
    // Search query
    const matchesSearch = req.category?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.meeting_location?.toLowerCase().includes(searchQuery.toLowerCase());
                          
    // Category filter
    const matchesCategory = activeCategory ? req.category_id === activeCategory : true;

    // Tab filter
    const matchesTab = req.request_type === activeTab;

    return matchesSearch && matchesCategory && matchesTab;
  });

  const getCategoryIcon = (title: string) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('pharmacy') || t.includes('medical') || t.includes('pill')) return <Pill color={Colors.primary[500]} size={20} />;
    if (t.includes('grocery') || t.includes('food')) return <ShoppingBag color={Colors.primary[500]} size={20} />;
    return <FileText color={Colors.primary[500]} size={20} />;
  };


  const renderRequestCard = ({item}: {item: any}) => {
    const displayStatus = formatStatus(item.status);
    const statusColors = getStatusColors(item.status);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          navigation.navigate('RequestDetails', { request: item });
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
          <View style={{flex: 1}}>
            <AppText variant="labelLarge" weight="semiBold" color={Colors.neutral[900]} style={{marginBottom: 4}}>
              {item.category?.title || 'Help Request'}
            </AppText>
          </View>
          <View style={[styles.newBadge, { backgroundColor: Colors.accent[50] }]}>
            <AppText variant="labelMedium" color={Colors.accent[700]}>
              {item.distance != null ? `${(parseFloat(item.distance) * 0.621371).toFixed(1)} miles` : displayStatus}
            </AppText>
          </View>
        </View>
        
        <View style={styles.cardDetails}>
          {item.title ? (
            <AppText variant="bodyMedium" color={Colors.neutral[800]} style={{marginBottom: 4, fontFamily: FontFamily.medium}}>
              {item.title}
            </AppText>
          ) : null}
          <AppText variant="caption" color={Colors.neutral[600]} style={{marginBottom: 12}}>
            #{item.reference_number || item.id}
          </AppText>
          <View style={styles.detailRow}>
            <Calendar color={Colors.neutral[500]} size={14} />
            <AppText variant="caption" color={Colors.neutral[800]} style={styles.detailText}>
              {formatDate(item.preferred_date)}
            </AppText>
          </View>
          {(item.preferred_start_time || item.start_time || item.preferred_time || item.hours_required) ? (
            <View style={[styles.detailRow, { marginTop: 4 }]}>
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerTitleContainer}>
        <AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: 'center'}}>Requests</AppText>
      </View>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'beneficiary' && styles.activeTab]}
            onPress={() => {
              setActiveTab('beneficiary');
              setActiveCategory(null);
            }}
          >
            <AppText 
              variant="labelLarge" 
              color={activeTab === 'beneficiary' ? Colors.primary[600] : Colors.neutral[500]}
              numberOfLines={1}
            >
              Beneficiary 
            </AppText>
            {activeTab === 'beneficiary' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'organization' && styles.activeTab]}
            onPress={() => {
              setActiveTab('organization');
              setActiveCategory(null);
            }}
          >
            <AppText 
              variant="labelLarge" 
              color={activeTab === 'organization' ? Colors.primary[600] : Colors.neutral[500]}
              numberOfLines={1}
            >
              Organization 
            </AppText>
            {activeTab === 'organization' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search color={Colors.neutral[400]} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search requests..."
              placeholderTextColor={Colors.neutral[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterBtn}
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter color={activeCategory !== null ? Colors.primary[600] : Colors.neutral[700]} size={20} />
            {activeCategory !== null && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderRequestCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText variant="bodyLarge" color={Colors.neutral[500]}>
              {loading ? 'Loading requests...' : 'No requests found.'}
            </AppText>
          </View>
        }
      />

      <Modal visible={filterModalVisible} animationType="fade" transparent>
        <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <AppText variant="h6" color={Colors.neutral[900]}>Select Category</AppText>
                  <TouchableOpacity onPress={() => setFilterModalVisible(false)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                    <X color={Colors.neutral[600]} size={24} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={[{ id: null as number | null, title: 'All Categories' }, ...(activeTab === 'organization' ? orgCategories : categories)]}
                  keyExtractor={(item, index) => item.id?.toString() || `all-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        setActiveCategory(item.id);
                        setFilterModalVisible(false);
                      }}
                    >
                      <AppText
                        variant="bodyMedium"
                        color={activeCategory === item.id ? Colors.primary[600] : Colors.neutral[700]}
                        style={activeCategory === item.id ? { fontFamily: FontFamily.semiBold } : undefined}
                      >
                        {item.title}
                      </AppText>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 300 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  headerTitleContainer: {
    backgroundColor: Colors.primary[500],
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
  },
  header: {
    backgroundColor: Colors.neutral[50],
    paddingTop: verticalScale(16),
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(24),
    marginBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTab: {
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1, // Overlap the borderBottom
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary[600],
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(24),
    marginBottom: verticalScale(16),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: 12,
    paddingHorizontal: horizontalScale(16),
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginRight: horizontalScale(12),
  },
  searchInput: {
    flex: 1,
    marginLeft: horizontalScale(12),
    fontSize: 16,
    color: Colors.neutral[900],
  },
  filterBtn: {
    width: moderateScale(48),
    height: moderateScale(48),
    backgroundColor: Colors.neutral[0],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  categoriesWrapper: {
    marginBottom: verticalScale(16),
  },
  categoriesContainer: {
    paddingHorizontal: horizontalScale(24),
    gap: horizontalScale(12),
  },
  categoryChip: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: 20,
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  categoryChipActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  listContent: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(24),
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
  },
  filterDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    width: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  modalOption: {
    paddingVertical: moderateScale(16),
    paddingHorizontal: horizontalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
});
