import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {
  Search,
  Filter,
  ShoppingBag,
  Pill,
  Clock,
  Calendar,
  MapPin,
  FileText,
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
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [catData, reqData] = await Promise.all([
            authApi.getCategories(),
            api.get<any[]>('/help_requests/browse')
          ]);
          setCategories(catData);
          setRequests(reqData || []);
        } catch (error) {
          console.error('Failed to fetch data', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const filteredRequests = requests.filter(req => {
    // Search query
    const matchesSearch = req.category?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.meeting_location?.toLowerCase().includes(searchQuery.toLowerCase());
                          
    // Category filter
    const matchesCategory = activeCategory ? req.category_id === activeCategory : true;

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (title: string) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('pharmacy') || t.includes('medical') || t.includes('pill')) return <Pill color={Colors.primary[500]} size={20} />;
    if (t.includes('grocery') || t.includes('food')) return <ShoppingBag color={Colors.primary[500]} size={20} />;
    return <FileText color={Colors.primary[500]} size={20} />;
  };

  const formatStatus = (status: string) => {
    if (!status) return 'New';
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

  const renderRequestCard = ({item}: {item: any}) => {
    const displayStatus = formatStatus(item.status);
    const statusColors = getStatusColors(item.status);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('RequestDetails', { request: item })}
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
              <ShoppingBag color={Colors.primary[500]} size={20} />
            )}
          </View>
          <View style={{flex: 1}}>
            <AppText variant="labelLarge" color={Colors.neutral[900]}>
              {item.category?.title || 'Help Request'}
            </AppText>
            <AppText variant="bodySmall" color={Colors.neutral[500]} style={{marginTop: 4}}>
              #{item.reference_number || item.id}
            </AppText>
          </View>
          <View style={[styles.newBadge, { backgroundColor: statusColors.bg }]}>
            <AppText variant="labelMedium" color={statusColors.text}>
              {displayStatus}
            </AppText>
          </View>
        </View>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Calendar color={Colors.neutral[400]} size={16} />
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.detailText}>
              {formatDate(item.preferred_date)} • {(item.preferred_start_time || item.start_time) ? `${formatTime12Hour(item.preferred_start_time || item.start_time)}${(item.preferred_end_time || item.end_time) ? ` - ${formatTime12Hour(item.preferred_end_time || item.end_time)}` : ''}` : (item.preferred_time || (item.hours_required ? `${item.hours_required} hours` : 'Time TBD'))}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <MapPin color={Colors.neutral[400]} size={16} />
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.detailText} numberOfLines={1}>
              {item.location?.address || item.meeting_location || 'Location TBD'}
            </AppText>
          </View>
          {item.distance_km != null && (
            <View style={styles.detailRow}>
              <MapPin color={Colors.neutral[400]} size={16} />
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.detailText}>
                {/* Treating distance_km as miles for display as per design */}
                {item.distance_km.toFixed(1)} mi
              </AppText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* <View style={styles.searchRow}>
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
          <TouchableOpacity style={styles.filterBtn}>
            <Filter color={Colors.neutral[700]} size={20} />
          </TouchableOpacity>
        </View> */}

        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            <TouchableOpacity 
              style={[styles.categoryChip, activeCategory === null && styles.categoryChipActive]}
              onPress={() => setActiveCategory(null)}
            >
              <AppText variant="bodyMedium" color={activeCategory === null ? Colors.neutral[0] : Colors.neutral[700]}>All</AppText>
            </TouchableOpacity>
            
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.categoryChip, activeCategory === cat.id && styles.categoryChipActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <AppText variant="bodyMedium" color={activeCategory === cat.id ? Colors.neutral[0] : Colors.neutral[700]}>
                  {cat.title}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.neutral[50],
    paddingTop: verticalScale(16),
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
});
