import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, TextInput, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Briefcase, Search, Link2, ChevronDown, X, SlidersHorizontal } from 'lucide-react-native';
import { api } from '../../../api/client';

const ORDER_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Title A-Z', value: 'title_asc' },
  { label: 'Title Z-A', value: 'title_desc' },
  { label: 'Most Viewed', value: 'most_viewed' },
  { label: 'Recently Published', value: 'recently_published' },
];

export const BrowseJobsScreen = () => {
  const navigation = useNavigation<any>();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [orderBy, setOrderBy] = useState('newest');

  // Modal visibility
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedSubCategory = selectedCategory?.sub_categories?.find((s: any) => s.id === selectedSubCategoryId);
  const selectedOrderLabel = ORDER_OPTIONS.find(o => o.value === orderBy)?.label || 'Newest';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get<any[]>('/job_categories');
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/job_posts/browse';
      const params: string[] = [];
      if (searchQuery.trim()) {
        params.push(`title=${encodeURIComponent(searchQuery.trim())}`);
      }
      if (selectedCategoryId) {
        params.push(`job_category_id=${selectedCategoryId}`);
      }
      if (selectedSubCategoryId) {
        params.push(`job_sub_category_id=${selectedSubCategoryId}`);
      }
      if (orderBy) {
        params.push(`order_by=${orderBy}`);
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      const data = await api.get<any[]>(url);
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategoryId, selectedSubCategoryId, orderBy]);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setOrderBy('newest');
  };

  const hasActiveFilters = selectedCategoryId !== null || orderBy !== 'newest';

  const renderJobCard = (job: any) => (
    <TouchableOpacity
      key={job.id}
      style={styles.card}
      onPress={() => navigation.navigate('VolunteerJobDetails', { job })}
      activeOpacity={0.7}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardIconContainer}>
          <Briefcase color={Colors.primary[600]} size={20} />
        </View>
        <View style={styles.cardBody}>
          <AppText variant="labelLarge" color={Colors.neutral[900]} numberOfLines={1}>
            {job.title}
          </AppText>

          {(job.job_category?.title || job.job_sub_category?.title) && (
            <View style={styles.badgeRow}>
              {job.job_category?.title && (
                <View style={styles.categoryBadge}>
                  <AppText variant="labelSmall" color={Colors.primary[700]}>
                    {job.job_category.title}
                  </AppText>
                </View>
              )}
              {job.job_sub_category?.title && (
                <View style={styles.subCategoryBadge}>
                  <AppText variant="labelSmall" color={Colors.neutral[600]}>
                    {job.job_sub_category.title}
                  </AppText>
                </View>
              )}
            </View>
          )}

          {job.company_url ? (
            <View style={styles.urlRow}>
              <Link2 color={Colors.neutral[400]} size={14} />
              <AppText variant="bodySmall" color={Colors.neutral[500]} style={{marginLeft: 6, flex: 1}} numberOfLines={1}>
                {job.company_url}
              </AppText>
            </View>
          ) : null}

          {job.description ? (
            <AppText variant="bodySmall" color={Colors.neutral[500]} numberOfLines={2} style={{marginTop: 6, lineHeight: 18}}>
              {job.description}
            </AppText>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDropdownModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: any[],
    selectedId: number | string | null,
    onSelect: (item: any) => void,
    keyField = 'id',
    labelField = 'title'
  ) => (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <AppText variant="h6" color={Colors.neutral[900]}>{title}</AppText>
                <TouchableOpacity onPress={onClose} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                  <X color={Colors.neutral[600]} size={24} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={data}
                keyExtractor={item => String(item[keyField])}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => onSelect(item)}
                  >
                    <AppText
                      variant="bodyMedium"
                      color={selectedId === item[keyField] ? Colors.primary[600] : Colors.neutral[700]}
                      style={selectedId === item[keyField] ? { fontFamily: FontFamily.semiBold } : undefined}
                    >
                      {item[labelField]}
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
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <AppText variant="h5" color={Colors.neutral[900]} style={{textAlign: 'center'}}>Browse Jobs</AppText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color={Colors.neutral[400]} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs by title..."
            placeholderTextColor={Colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchJobs}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => setFiltersVisible(!filtersVisible)} style={styles.filterIconBtn}>
            <SlidersHorizontal color={hasActiveFilters ? Colors.primary[600] : Colors.neutral[400]} size={20} />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters Row */}
      {filtersVisible && (
        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {/* Category Filter */}
            <TouchableOpacity style={styles.filterChip} onPress={() => setCategoryModalVisible(true)}>
              <AppText variant="labelSmall" color={selectedCategoryId ? Colors.primary[600] : Colors.neutral[600]}>
                {selectedCategoryId ? selectedCategory?.title : 'Category'}
              </AppText>
              <ChevronDown color={selectedCategoryId ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{marginLeft: 4}} />
            </TouchableOpacity>

            {/* Sub Category Filter */}
            {selectedCategory?.sub_categories?.length > 0 && (
              <TouchableOpacity style={styles.filterChip} onPress={() => setSubCategoryModalVisible(true)}>
                <AppText variant="labelSmall" color={selectedSubCategoryId ? Colors.primary[600] : Colors.neutral[600]}>
                  {selectedSubCategoryId ? selectedSubCategory?.title : 'Sub Category'}
                </AppText>
                <ChevronDown color={selectedSubCategoryId ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{marginLeft: 4}} />
              </TouchableOpacity>
            )}

            {/* Order By Filter */}
            <TouchableOpacity style={styles.filterChip} onPress={() => setOrderModalVisible(true)}>
              <AppText variant="labelSmall" color={orderBy !== 'newest' ? Colors.primary[600] : Colors.neutral[600]}>
                {selectedOrderLabel}
              </AppText>
              <ChevronDown color={orderBy !== 'newest' ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{marginLeft: 4}} />
            </TouchableOpacity>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearChip} onPress={clearFilters}>
                <X color={Colors.error} size={14} />
                <AppText variant="labelSmall" color={Colors.error} style={{marginLeft: 4}}>Clear</AppText>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchJobs} />}
      >
        {jobs.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Briefcase color={Colors.neutral[300]} size={48} />
            <AppText variant="bodyMedium" color={Colors.neutral[500]} style={{marginTop: 16}}>
              No jobs found.
            </AppText>
            <AppText variant="bodySmall" color={Colors.neutral[400]} style={{marginTop: 4}}>
              Try adjusting your search or filters.
            </AppText>
          </View>
        ) : (
          jobs.map(job => renderJobCard(job))
        )}
      </ScrollView>

      {/* Category Modal */}
      {renderDropdownModal(
        categoryModalVisible,
        () => setCategoryModalVisible(false),
        'Select Category',
        [{ id: null, title: 'All Categories' }, ...categories],
        selectedCategoryId,
        (item) => {
          setSelectedCategoryId(item.id);
          setSelectedSubCategoryId(null);
          setCategoryModalVisible(false);
        }
      )}

      {/* Sub Category Modal */}
      {selectedCategory && renderDropdownModal(
        subCategoryModalVisible,
        () => setSubCategoryModalVisible(false),
        'Select Sub Category',
        [{ id: null, title: 'All Sub Categories' }, ...(selectedCategory?.sub_categories || [])],
        selectedSubCategoryId,
        (item) => {
          setSelectedSubCategoryId(item.id);
          setSubCategoryModalVisible(false);
        }
      )}

      {/* Order By Modal */}
      {renderDropdownModal(
        orderModalVisible,
        () => setOrderModalVisible(false),
        'Sort By',
        ORDER_OPTIONS.map(o => ({ id: o.value, title: o.label })),
        orderBy,
        (item) => {
          setOrderBy(item.id);
          setOrderModalVisible(false);
        }
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: '#FFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    padding: 0,
  },
  filterIconBtn: {
    padding: 4,
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[600],
  },
  filtersRow: {
    backgroundColor: '#FFF',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  content: { padding: 16 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  subCategoryBadge: {
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
});
