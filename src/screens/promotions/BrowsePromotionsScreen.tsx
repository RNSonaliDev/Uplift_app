import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  TextInput,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Megaphone,
  Tag,
  MapPin,
  Calendar,
  Hash,
  Eye,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily } from '../../theme/typography';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';
import { api } from '../../api/client';
import { formatDate } from '../../utils/dateFormatter';

export interface PromotionTypeItem {
  id: number;
  name: string;
}

export interface ProductCategoryItem {
  id: number;
  name: string;
}

const FALLBACK_PROMOTION_TYPES: PromotionTypeItem[] = [
  { id: 1, name: 'Discount or sale' },
  { id: 2, name: 'Buy one get one' },
  { id: 3, name: 'Free item with purchase' },
  { id: 4, name: 'Grand opening special' },
  { id: 5, name: 'Seasonal offer' },
  { id: 6, name: 'Limited time deal' },
  { id: 7, name: 'New product or service launch' },
];

const FALLBACK_PRODUCT_CATEGORIES: ProductCategoryItem[] = [
  { id: 1, name: 'Food & Drink' },
  { id: 2, name: 'Beauty & Wellness' },
  { id: 3, name: 'Retail & Shopping' },
  { id: 4, name: 'Health & Fitness' },
  { id: 5, name: 'Home & Services' },
  { id: 6, name: 'Technology' },
  { id: 7, name: 'Education & Tutoring' },
  { id: 8, name: 'Entertainment' },
  { id: 9, name: 'Other' },
];

export const BrowsePromotionsScreen = () => {
  const navigation = useNavigation<any>();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [zipCodeQuery, setZipCodeQuery] = useState('');
  const [selectedLocationMode, setSelectedLocationMode] = useState<'all' | 'online' | 'offline'>('all');

  // Temporary Filter States for Filter Modal
  const [tempTypeId, setTempTypeId] = useState<number | null>(null);
  const [tempCategoryId, setTempCategoryId] = useState<number | null>(null);
  const [tempZipCode, setTempZipCode] = useState('');
  const [tempLocationMode, setTempLocationMode] = useState<'all' | 'online' | 'offline'>('all');

  // Visibility states
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [zipModalVisible, setZipModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Metadata dropdown options
  const [promotionTypes, setPromotionTypes] = useState<PromotionTypeItem[]>(FALLBACK_PROMOTION_TYPES);
  const [productCategories, setProductCategories] = useState<ProductCategoryItem[]>(FALLBACK_PRODUCT_CATEGORIES);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [typesRes, catsRes] = await Promise.all([
        api.get<PromotionTypeItem[]>('/promotion_types').catch(() => FALLBACK_PROMOTION_TYPES),
        api.get<ProductCategoryItem[]>('/product_categories').catch(() => FALLBACK_PRODUCT_CATEGORIES),
      ]);

      if (Array.isArray(typesRes) && typesRes.length > 0) {
        setPromotionTypes(typesRes);
      }
      if (Array.isArray(catsRes) && catsRes.length > 0) {
        setProductCategories(catsRes);
      }
    } catch (error) {
      console.error('Failed to fetch promotion metadata', error);
    }
  };

  const isFirstMount = React.useRef(true);

  const fetchPromotions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const params: Record<string, any> = {};
      if (searchQuery.trim()) {
        params.query = searchQuery.trim();
      }
      if (selectedTypeId) {
        params.promotion_type_id = selectedTypeId;
      }
      if (selectedCategoryId) {
        params.product_category_id = selectedCategoryId;
      }
      if (zipCodeQuery.trim()) {
        params.zip_code = zipCodeQuery.trim();
      }

      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/promotions/browse${queryString ? `?${queryString}` : ''}`;
      const data: any = await api.get(endpoint);

      if (Array.isArray(data)) {
        setPromotions(data);
      } else if (data && Array.isArray(data.promotions)) {
        setPromotions(data.promotions);
      } else if (data && Array.isArray(data.data)) {
        setPromotions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch promotions', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTypeId, selectedCategoryId, zipCodeQuery]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        fetchPromotions(true);
        isFirstMount.current = false;
      } else {
        fetchPromotions(false);
      }
    }, [fetchPromotions])
  );

  const openFilterModal = () => {
    setTempTypeId(selectedTypeId);
    setTempCategoryId(selectedCategoryId);
    setTempZipCode(zipCodeQuery);
    setTempLocationMode(selectedLocationMode);
    setIsFilterModalVisible(true);
  };

  const applyFilters = () => {
    setSelectedTypeId(tempTypeId);
    setSelectedCategoryId(tempCategoryId);
    setZipCodeQuery(tempZipCode);
    setSelectedLocationMode(tempLocationMode);
    setIsFilterModalVisible(false);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedTypeId(null);
    setSelectedCategoryId(null);
    setZipCodeQuery('');
    setSelectedLocationMode('all');
    setTempTypeId(null);
    setTempCategoryId(null);
    setTempZipCode('');
    setTempLocationMode('all');
    setIsFilterModalVisible(false);
  };

  const activeFilterCount = (selectedTypeId ? 1 : 0) + (selectedCategoryId ? 1 : 0) + (zipCodeQuery.trim() ? 1 : 0) + (selectedLocationMode !== 'all' ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const formatDateVal = (dateVal: any) => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') return formatDate(dateVal);
    if (dateVal instanceof Date) return formatDate(dateVal.toISOString());
    return String(dateVal);
  };

  const getPromoLocationCategory = (item: any): 'local' | 'both' | 'online' => {
    const locType = (item.location_type || '').toLowerCase();
    const addr = (item.store_address || item.address || '').trim();
    const url = (item.online_url || item.url || '').trim();
    const locText = (item.locationText || '').toLowerCase();

    if (locType === 'both' || (addr && url) || locText.includes('& online')) {
      return 'both';
    }
    if (locType === 'online' || (url && !addr) || locText.startsWith('online')) {
      return 'online';
    }
    return 'local';
  };

  const filteredPromotions = promotions.filter((item) => {
    const status = (item.status || '').toLowerCase();
    if (status === 'closed' || status === 'expired') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (item.business_name || item.title || '').toLowerCase();
      const type = (item.promotion_type?.name || item.type || '').toLowerCase();
      const cat = (item.product_category?.name || item.category || '').toLowerCase();
      const code = (item.promo_code || item.promoCode || '').toLowerCase();
      if (!title.includes(q) && !type.includes(q) && !cat.includes(q) && !code.includes(q)) {
        return false;
      }
    }

    if (selectedTypeId) {
      const typeId = item.promotion_type?.id || item.promotion_type_id;
      if (typeId && typeId !== selectedTypeId) return false;
    }

    if (selectedCategoryId) {
      const catId = item.product_category?.id || item.product_category_id;
      if (catId && catId !== selectedCategoryId) return false;
    }

    // Location Mode Filter (Online / In-Store / All)
    if (selectedLocationMode === 'online') {
      const cat = getPromoLocationCategory(item);
      if (cat !== 'online' && cat !== 'both') return false;
    } else if (selectedLocationMode === 'offline') {
      const cat = getPromoLocationCategory(item);
      if (cat !== 'local' && cat !== 'both') return false;
    }

    // Zip Code Filter logic: "online should show anyways"
    if (zipCodeQuery.trim()) {
      const category = getPromoLocationCategory(item);
      if (category === 'local') {
        const z = zipCodeQuery.trim().toLowerCase();
        const addr = (item.store_address || item.address || item.locationText || '').toLowerCase();
        const zip = (item.zip_code || item.zip || item.postal_code || '').toLowerCase();
        if (!addr.includes(z) && !zip.includes(z)) {
          return false;
        }
      }
    }

    return true;
  });

  // Sort logic: Local show first, followed by local/online and then online
  const sortedPromotions = [...filteredPromotions].sort((a, b) => {
    const getRank = (item: any) => {
      const category = getPromoLocationCategory(item);
      if (category === 'local') return 1;
      if (category === 'both') return 2;
      if (category === 'online') return 3;
      return 4;
    };

    return getRank(a) - getRank(b);
  });

  const selectedTypeName = promotionTypes.find((t) => t.id === selectedTypeId)?.name;
  const selectedCatName = productCategories.find((c) => c.id === selectedCategoryId)?.name;

  const renderPromoCard = (item: any) => {
    const promoTitle = item.business_name || item.title || 'Promotion';
    const promoType = item.promotion_type?.name || item.promotion_type_name || item.type || 'Promotion';
    const categoryName = item.product_category?.name || item.product_category_name || item.category || 'General';
    const code = item.promo_code || item.promoCode || 'UPLIFT';

    const cleanStr = (s?: string) => {
      if (!s) return '';
      if (s.includes('<View') || s.includes('promotion?.') || s.includes('styles.')) return '';
      return s.trim();
    };

    const cleanAddress = cleanStr(item.store_address);
    const cleanUrl = cleanStr(item.online_url);
    const cleanLocText = cleanStr(item.locationText);

    let locationText = '';
    if (item.location_type === 'both' && cleanAddress && cleanUrl) {
      locationText = `${cleanAddress} & Online (${cleanUrl})`;
    } else if (item.location_type === 'online' && cleanUrl) {
      locationText = `Online (${cleanUrl})`;
    } else if (cleanAddress) {
      locationText = cleanAddress;
    } else if (cleanLocText) {
      locationText = cleanLocText;
    } else if (cleanUrl) {
      locationText = `Online (${cleanUrl})`;
    }

    const availableFrom = item.available_from || item.availableFrom;
    const availableUntil = item.available_until || item.availableUntil;
    const dateRange = (availableFrom && availableUntil)
      ? `${formatDateVal(availableFrom)} - ${formatDateVal(availableUntil)}`
      : (item.dates || 'Valid');

    const quantity = item.quantity_available !== null && item.quantity_available !== undefined
      ? `${item.quantity_available} Available`
      : (item.quantity || 'Unlimited');

    const views = item.views_count || item.views || 0;

    return (
      <TouchableOpacity
        key={item.id?.toString() || Math.random().toString()}
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('PromotionDetails', { id: item.id, promotion: item, isPublicView: true })}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Megaphone size={14} color={Colors.primary[600]} style={{ marginRight: 6 }} />
            <Text style={styles.typeBadgeText}>{promoType}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryName}</Text>
          </View>
        </View>

        <Text style={styles.promoTitle}>{promoTitle}</Text>

        <View style={styles.codeRow}>
          <View style={styles.codeBadge}>
            <Tag size={14} color={Colors.primary[600]} style={{ marginRight: 6 }} />
            <Text style={styles.codeText}>{code}</Text>
          </View>
        </View>

        {locationText ? (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={14} color={Colors.neutral[500]} />
              <Text style={styles.metaText} numberOfLines={1}>
                {locationText}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={14} color={Colors.neutral[500]} />
            <Text style={styles.metaText}>{dateRange}</Text>
          </View>
          <View style={styles.metaItem}>
            <Hash size={14} color={Colors.neutral[500]} />
            <Text style={styles.metaText}>{quantity}</Text>
          </View>
          <View style={styles.metaItem}>
            <Eye size={14} color={Colors.neutral[500]} />
            <Text style={styles.metaText}>{views} Views</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDropdownModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: any[],
    selectedId: number | null,
    onSelect: (item: any) => void
  ) => (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.dropdownModalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dropdownModalContent}>
              <View style={styles.dropdownModalHeader}>
                <AppText variant="h6" color={Colors.neutral[900]}>{title}</AppText>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <X color={Colors.neutral[600]} size={22} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={data}
                keyExtractor={(item) => String(item.id ?? 'all')}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownOption}
                    onPress={() => onSelect(item)}>
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        selectedId === item.id && styles.dropdownOptionTextSelected,
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 320 }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.primary[500]} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h5" color={Colors.neutral[0]} style={styles.headerTitle}>
          Promotions
        </AppText>
      </View>

      <View style={styles.mainContainer}>
        {/* Search & Filter Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.neutral[400]} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search promotions, deals or categories..."
              placeholderTextColor={Colors.neutral[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => fetchPromotions(false)}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4, marginRight: 4 }}>
                <X size={16} color={Colors.neutral[400]} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => setFiltersVisible(!filtersVisible)} style={styles.filterIconBtn}>
              <SlidersHorizontal color={hasActiveFilters ? Colors.primary[600] : Colors.neutral[400]} size={20} />
              {hasActiveFilters && <View style={styles.filterDot} />}
            </TouchableOpacity>
          </View>

          {/* Expandable Filter Chips Row like BrowseJobsScreen */}
          {filtersVisible && (
            <View style={styles.filtersRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                {/* Location Option Filter Chip */}
                <TouchableOpacity style={styles.filterChip} onPress={() => setLocationModalVisible(true)}>
                  <AppText variant="labelSmall" color={selectedLocationMode !== 'all' ? Colors.primary[600] : Colors.neutral[600]}>
                    {selectedLocationMode === 'online' ? 'Online' : selectedLocationMode === 'offline' ? 'In-Store' : 'Location: All'}
                  </AppText>
                  <ChevronDown color={selectedLocationMode !== 'all' ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                {/* Zip Code Filter Chip */}
                <TouchableOpacity style={styles.filterChip} onPress={() => { setTempZipCode(zipCodeQuery); setZipModalVisible(true); }}>
                  <MapPin color={zipCodeQuery.trim() ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{ marginRight: 4 }} />
                  <AppText variant="labelSmall" color={zipCodeQuery.trim() ? Colors.primary[600] : Colors.neutral[600]}>
                    {zipCodeQuery.trim() ? `Zip: ${zipCodeQuery.trim()}` : 'Zip Code'}
                  </AppText>
                  <ChevronDown color={zipCodeQuery.trim() ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                {/* Promotion Type Dropdown Filter */}
                <TouchableOpacity style={styles.filterChip} onPress={() => setTypeModalVisible(true)}>
                  <AppText variant="labelSmall" color={selectedTypeId ? Colors.primary[600] : Colors.neutral[600]}>
                    {selectedTypeName || 'Promotion Type'}
                  </AppText>
                  <ChevronDown color={selectedTypeId ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                {/* Product Category Dropdown Filter */}
                <TouchableOpacity style={styles.filterChip} onPress={() => setCategoryModalVisible(true)}>
                  <AppText variant="labelSmall" color={selectedCategoryId ? Colors.primary[600] : Colors.neutral[600]}>
                    {selectedCatName || 'Product Category'}
                  </AppText>
                  <ChevronDown color={selectedCategoryId ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                {/* Clear Active Filters */}
                {hasActiveFilters && (
                  <TouchableOpacity style={styles.clearChip} onPress={resetAllFilters}>
                    <X color={Colors.error} size={14} />
                    <AppText variant="labelSmall" color={Colors.error} style={{ marginLeft: 4 }}>Clear</AppText>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}

          {/* Active Filter Quick Badges */}
          {!filtersVisible && hasActiveFilters && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScrollView}
              contentContainerStyle={styles.chipsContainer}>
              {selectedLocationMode !== 'all' ? (
                <TouchableOpacity style={styles.chip} onPress={() => setSelectedLocationMode('all')}>
                  <Text style={styles.chipText}>Location: {selectedLocationMode === 'online' ? 'Online' : 'In-Store'}</Text>
                  <X size={13} color={Colors.primary[700]} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ) : null}

              {zipCodeQuery.trim() ? (
                <TouchableOpacity style={styles.chip} onPress={() => setZipCodeQuery('')}>
                  <Text style={styles.chipText}>Zip: {zipCodeQuery.trim()}</Text>
                  <X size={13} color={Colors.primary[700]} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ) : null}

              {selectedTypeName ? (
                <TouchableOpacity style={styles.chip} onPress={() => setSelectedTypeId(null)}>
                  <Text style={styles.chipText}>Type: {selectedTypeName}</Text>
                  <X size={13} color={Colors.primary[700]} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ) : null}

              {selectedCatName ? (
                <TouchableOpacity style={styles.chip} onPress={() => setSelectedCategoryId(null)}>
                  <Text style={styles.chipText}>Category: {selectedCatName}</Text>
                  <X size={13} color={Colors.primary[700]} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity style={styles.clearAllChip} onPress={resetAllFilters}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Promotions List */}
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchPromotions} colors={[Colors.primary[500]]} />
          }>
          {sortedPromotions.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Megaphone color={Colors.neutral[300]} size={48} />
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{ marginTop: 16, fontFamily: FontFamily.medium }}>
                No active promotions available
              </AppText>


              {hasActiveFilters && (
                <TouchableOpacity style={styles.resetButton} onPress={resetAllFilters}>
                  <RotateCcw size={16} color={Colors.primary[600]} style={{ marginRight: 6 }} />
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            sortedPromotions.map((item) => renderPromoCard(item))
          )}
        </ScrollView>
      </View>

      {/* Zip Code Quick Modal */}
      <Modal visible={zipModalVisible} animationType="fade" transparent onRequestClose={() => setZipModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setZipModalVisible(false)}>
          <View style={styles.dropdownModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.dropdownModalContent, { padding: 20 }]}>
                <View style={styles.dropdownModalHeader}>
                  <AppText variant="h6" color={Colors.neutral[900]}>Enter Zip Code</AppText>
                  <TouchableOpacity onPress={() => setZipModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X color={Colors.neutral[600]} size={22} />
                  </TouchableOpacity>
                </View>
                <View style={styles.zipInputWrapper}>
                  <MapPin size={18} color={Colors.neutral[400]} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.zipTextInput}
                    placeholder="e.g. 95112"
                    placeholderTextColor={Colors.neutral[400]}
                    value={tempZipCode}
                    onChangeText={setTempZipCode}
                    keyboardType="numeric"
                    autoFocus
                  />
                  {tempZipCode ? (
                    <TouchableOpacity onPress={() => setTempZipCode('')} style={{ padding: 4 }}>
                      <X size={16} color={Colors.neutral[400]} />
                    </TouchableOpacity>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {zipCodeQuery.trim() ? (
                    <TouchableOpacity
                      style={[styles.resetButton, { flex: 1, marginTop: 0, justifyContent: 'center' }]}
                      onPress={() => { setZipCodeQuery(''); setTempZipCode(''); setZipModalVisible(false); }}>
                      <Text style={styles.resetButtonText}>Clear</Text>
                    </TouchableOpacity>
                  ) : null}
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Apply"
                      onPress={() => { setZipCodeQuery(tempZipCode); setZipModalVisible(false); }}
                      size="md"
                      fullWidth
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Location Option Dropdown Modal */}
      {renderDropdownModal(
        locationModalVisible,
        () => setLocationModalVisible(false),
        'Select Location Option',
        [
          { id: 'all', name: 'All Locations' },
          { id: 'offline', name: 'In-Store / Offline' },
          { id: 'online', name: 'Online' },
        ],
        selectedLocationMode as any,
        (item) => {
          setSelectedLocationMode(item.id);
          setLocationModalVisible(false);
        }
      )}

      {/* Promotion Type Dropdown Modal */}
      {renderDropdownModal(
        typeModalVisible,
        () => setTypeModalVisible(false),
        'Select Promotion Type',
        [{ id: null, name: 'All Promotion Types' }, ...promotionTypes],
        selectedTypeId,
        (item) => {
          setSelectedTypeId(item.id);
          setTypeModalVisible(false);
        }
      )}

      {/* Product Category Dropdown Modal */}
      {renderDropdownModal(
        categoryModalVisible,
        () => setCategoryModalVisible(false),
        'Select Product Category',
        [{ id: null, name: 'All Product Categories' }, ...productCategories],
        selectedCategoryId,
        (item) => {
          setSelectedCategoryId(item.id);
          setCategoryModalVisible(false);
        }
      )}

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SlidersHorizontal size={20} color={Colors.neutral[900]} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Filter Promotions</Text>
              </View>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)} style={styles.modalCloseButton}>
                <X size={20} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Location Mode Selector */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Location Option</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipSelectorRow}>
                  {[
                    { id: 'all', label: 'All Locations' },
                    { id: 'offline', label: 'In-Store / Offline' },
                    { id: 'online', label: 'Online' },
                  ].map((opt) => {
                    const isSelected = tempLocationMode === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.selectorChip,
                          isSelected && styles.selectorChipSelected,
                        ]}
                        onPress={() => setTempLocationMode(opt.id as any)}>
                        <Text style={[styles.selectorChipText, isSelected && styles.selectorChipTextSelected]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              {/* Zip Code Selector */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Zip Code</Text>
                <View style={[styles.zipInputWrapper, { marginVertical: 0, marginTop: 4 }]}>
                  <MapPin size={18} color={Colors.neutral[400]} style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.zipTextInput}
                    placeholder="Enter Zip Code (e.g. 95112)"
                    placeholderTextColor={Colors.neutral[400]}
                    value={tempZipCode}
                    onChangeText={setTempZipCode}
                    keyboardType="numeric"
                  />
                  {tempZipCode ? (
                    <TouchableOpacity onPress={() => setTempZipCode('')} style={{ padding: 4 }}>
                      <X size={16} color={Colors.neutral[400]} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Promotion Type Selector */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Promotion Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipSelectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.selectorChip,
                      tempTypeId === null && styles.selectorChipSelected,
                    ]}
                    onPress={() => setTempTypeId(null)}>
                    <Text style={[styles.selectorChipText, tempTypeId === null && styles.selectorChipTextSelected]}>
                      All Types
                    </Text>
                  </TouchableOpacity>

                  {promotionTypes.map((type) => {
                    const isSelected = tempTypeId === type.id;
                    return (
                      <TouchableOpacity
                        key={type.id.toString()}
                        style={[
                          styles.selectorChip,
                          isSelected && styles.selectorChipSelected,
                        ]}
                        onPress={() => setTempTypeId(type.id)}>
                        <Text style={[styles.selectorChipText, isSelected && styles.selectorChipTextSelected]}>
                          {type.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Product Category Selector */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Product Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipSelectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.selectorChip,
                      tempCategoryId === null && styles.selectorChipSelected,
                    ]}
                    onPress={() => setTempCategoryId(null)}>
                    <Text style={[styles.selectorChipText, tempCategoryId === null && styles.selectorChipTextSelected]}>
                      All Categories
                    </Text>
                  </TouchableOpacity>

                  {productCategories.map((cat) => {
                    const isSelected = tempCategoryId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id.toString()}
                        style={[
                          styles.selectorChip,
                          isSelected && styles.selectorChipSelected,
                        ]}
                        onPress={() => setTempCategoryId(cat.id)}>
                        <Text style={[styles.selectorChipText, isSelected && styles.selectorChipTextSelected]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetModalButton} onPress={resetAllFilters}>
                <RotateCcw size={16} color={Colors.neutral[600]} style={{ marginRight: 6 }} />
                <Text style={styles.resetModalButtonText}>Reset All</Text>
              </TouchableOpacity>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Button
                  title="Apply Filters"
                  onPress={applyFilters}
                  size="md"
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[500],
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
  searchSection: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: fontScale(14),
    color: Colors.neutral[900],
    paddingVertical: 0,
  },
  filterIconBtn: {
    padding: 4,
    position: 'relative',
    marginLeft: 4,
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
    marginTop: verticalScale(10),
  },
  filtersScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    marginRight: horizontalScale(8),
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '15',
    borderWidth: 1,
    borderColor: Colors.error + '30',
    borderRadius: moderateScale(20),
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(6),
    marginRight: horizontalScale(8),
  },
  chipsScrollView: {
    marginTop: verticalScale(10),
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: horizontalScale(8),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100],
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(16),
    marginRight: horizontalScale(8),
  },
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: fontScale(11.5),
    color: Colors.primary[800],
  },
  clearAllChip: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
  },
  clearAllText: {
    fontFamily: FontFamily.medium,
    fontSize: fontScale(12),
    color: Colors.error,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(30),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
    paddingHorizontal: horizontalScale(24),
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  resetButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(13),
    color: Colors.primary[600],
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(14),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    elevation: 2,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  typeBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: fontScale(11.5),
    color: Colors.primary[700],
  },
  categoryBadge: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  categoryText: {
    fontFamily: FontFamily.regular,
    fontSize: fontScale(12),
    color: Colors.neutral[700],
  },
  promoTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(15.5),
    color: Colors.neutral[900],
    marginBottom: verticalScale(8),
    lineHeight: fontScale(21),
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100],
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  codeText: {
    fontFamily: FontFamily.bold,
    fontSize: fontScale(12.5),
    color: Colors.primary[700],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: horizontalScale(14),
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: fontScale(12),
    color: Colors.neutral[500],
    marginLeft: 4,
  },
  // Dropdown Modal Styles
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  dropdownModalContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    width: '100%',
    maxHeight: 400,
    padding: moderateScale(16),
    elevation: 5,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    paddingBottom: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  dropdownOption: {
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  dropdownOptionText: {
    fontFamily: FontFamily.regular,
    fontSize: fontScale(14),
    color: Colors.neutral[800],
  },
  dropdownOptionTextSelected: {
    fontFamily: FontFamily.semiBold,
    color: Colors.primary[600],
  },
  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    maxHeight: '82%',
    paddingBottom: verticalScale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: fontScale(17),
    color: Colors.neutral[900],
  },
  modalCloseButton: {
    padding: moderateScale(4),
  },
  modalBody: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(16),
  },
  filterGroup: {
    marginBottom: verticalScale(18),
  },
  filterLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(13.5),
    color: Colors.neutral[800],
    marginBottom: verticalScale(8),
  },
  chipSelectorRow: {
    flexDirection: 'row',
  },
  selectorChip: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginRight: horizontalScale(8),
  },
  selectorChipSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  selectorChipText: {
    fontFamily: FontFamily.medium,
    fontSize: fontScale(12.5),
    color: Colors.neutral[700],
  },
  selectorChipTextSelected: {
    fontFamily: FontFamily.semiBold,
    color: Colors.primary[700],
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(14),
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    marginTop: verticalScale(10),
  },
  resetModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(10),
  },
  resetModalButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: fontScale(13.5),
    color: Colors.neutral[600],
  },
  zipInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderWidth: 1.5,
    borderColor: Colors.neutral[300],
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginVertical: 18,
  },
  zipTextInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: fontScale(15),
    color: Colors.neutral[900],
    paddingVertical: 0,
  },
});
