import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Plus,
  Megaphone,
  Tag,
  MapPin,
  Calendar,
  Hash,
  Eye,
  CheckCircle2,
  Pencil,
  Trash2,
  XCircle,
} from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import { api } from '../../../api/client';
import { formatDate } from '../../../utils/dateFormatter';
import Toast from 'react-native-toast-message';

export const PromotionsListingScreen = () => {
  const navigation = useNavigation<any>();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const isFirstMount = React.useRef(true);

  const fetchPromotions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await api.get<any[]>('/promotions');
      if (Array.isArray(data)) {
        setPromotions(data);
      }
    } catch (error) {
      console.error('Failed to fetch promotions list', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleClosePromotion = (item: any) => {
    Alert.alert(
      'Close Promotion',
      `Are you sure you want to close "${item.business_name || item.title || 'this promotion'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Promotion',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/promotions/${item.id}/close`, {});
              Toast.show({
                type: 'success',
                text1: 'Promotion Closed',
                text2: 'Promotion has been closed.',
              });
              fetchPromotions();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Close Failed',
                text2: error?.data?.errors?.[0] || error?.message || 'Failed to close promotion',
              });
            }
          },
        },
      ]
    );
  };

  const handleDeletePromotion = (item: any) => {
    Alert.alert(
      'Delete Promotion',
      `Are you sure you want to delete "${item.business_name || item.title || 'this promotion'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/promotions/${item.id}`);
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Promotion has been deleted.',
              });
              fetchPromotions();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Delete Failed',
                text2: error?.data?.errors?.[0] || error?.message || 'Failed to delete promotion',
              });
            }
          },
        },
      ]
    );
  };

  const formatDateVal = (dateVal: any) => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') return formatDate(dateVal);
    if (dateVal instanceof Date) return formatDate(dateVal.toISOString());
    return String(dateVal);
  };

  const getStatusStyle = (statusStr?: string) => {
    const s = (statusStr || '').toLowerCase();
    if (s === 'draft') {
      return {
        bg: Colors.accent[100],
        text: Colors.accent[700],
        iconColor: Colors.accent[700],
        label: 'Draft',
      };
    }
    if (s === 'closed' || s === 'expired' || s === 'inactive') {
      return {
        bg: Colors.neutral[200],
        text: Colors.neutral[700],
        iconColor: Colors.neutral[600],
        label: s.charAt(0).toUpperCase() + s.slice(1),
      };
    }
    return {
      bg: Colors.secondary[50],
      text: Colors.secondary[700],
      iconColor: Colors.secondary[600],
      label: s ? (s.charAt(0).toUpperCase() + s.slice(1)) : 'Active',
    };
  };

  const filteredPromotions = promotions.filter((item) => {
    const s = (item.status || '').toLowerCase();
    if (activeTab === 'active') {
      return s !== 'closed' && s !== 'expired';
    }
    return s === 'closed' || s === 'expired';
  });

  const renderPromoCard = (item: any) => {
    const statusStyle = getStatusStyle(item.status);
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
      : (item.dates || 'Dates TBD');

    const quantity = item.quantity_available !== null && item.quantity_available !== undefined
      ? `${item.quantity_available} Available`
      : (item.quantity || 'Unlimited');

    const views = item.views_count || item.views || 0;

    return (
      <TouchableOpacity
        key={item.id?.toString() || Math.random().toString()}
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PromotionDetails', { id: item.id, promotion: item })}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Megaphone size={14} color={Colors.primary[600]} style={{ marginRight: 6 }} />
            <Text style={styles.typeBadgeText}>{promoType}</Text>
          </View>
          {!((item.status || '').toLowerCase() === 'closed' || (item.status || '').toLowerCase() === 'expired') && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={{ padding: 4, marginRight: 8 }}
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('CreatePromotion', { promotionToEdit: item });
                }}>
                <Pencil size={16} color={Colors.primary[600]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={{ padding: 4 }}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeletePromotion(item);
                }}>
                <Trash2 size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.promoTitle}>{promoTitle}</Text>

        <View style={styles.codeRow}>
          <View style={styles.codeBadge}>
            <Tag size={14} color={Colors.primary[600]} style={{ marginRight: 6 }} />
            <Text style={styles.codeText}>{code}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryName}</Text>
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

  const activeCount = promotions.filter(item => (item.status || '').toLowerCase() !== 'closed' && (item.status || '').toLowerCase() !== 'expired').length;
  const closedCount = promotions.filter(item => (item.status || '').toLowerCase() === 'closed' || (item.status || '').toLowerCase() === 'expired').length;

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
        {/* Top Tab Bar */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}>
            <AppText
              variant="labelMedium"
              color={activeTab === 'active' ? Colors.primary[600] : Colors.neutral[600]}
              style={activeTab === 'active' ? styles.activeTabText : styles.tabText}>
              Active ({activeCount})
            </AppText>
            {activeTab === 'active' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'closed' && styles.activeTab]}
            onPress={() => setActiveTab('closed')}>
            <AppText
              variant="labelMedium"
              color={activeTab === 'closed' ? Colors.primary[600] : Colors.neutral[600]}
              style={activeTab === 'closed' ? styles.activeTabText : styles.tabText}>
              Closed ({closedCount})
            </AppText>
            {activeTab === 'closed' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Promotions List */}
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchPromotions} colors={[Colors.primary[500]]} />
          }>
          {filteredPromotions.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Megaphone color={Colors.neutral[300]} size={48} />
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{ marginTop: 16, fontFamily: FontFamily.medium }}>
                {activeTab === 'active' ? 'No active promotions found' : 'No closed promotions found'}
              </AppText>
              <AppText variant="bodySmall" color={Colors.neutral[400]} style={{ marginTop: 4, textAlign: 'center' }}>
                Tap the + button below to create your promotion.
              </AppText>
            </View>
          ) : (
            filteredPromotions.map((item) => renderPromoCard(item))
          )}
        </ScrollView>

        {/* Floating Action Button (+) */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreatePromotion')}
          activeOpacity={0.85}>
          <Plus color={Colors.neutral[0]} size={20} />
          <AppText variant="buttonMedium" color={Colors.neutral[0]} style={{ marginLeft: 6 }}>
            Create Promo
          </AppText>
        </TouchableOpacity>
      </View>
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
    position: 'relative',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
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
  activeTab: {},
  tabText: {
    fontFamily: FontFamily.medium,
  },
  activeTabText: {
    fontFamily: FontFamily.semiBold,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: Colors.primary[600],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(90),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
    paddingHorizontal: horizontalScale(24),
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(12),
  },
  statusText: {
    fontFamily: FontFamily.medium,
    fontSize: fontScale(11.5),
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
    marginRight: horizontalScale(8),
  },
  codeText: {
    fontFamily: FontFamily.bold,
    fontSize: fontScale(12.5),
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
    color: Colors.neutral[500],
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
  fab: {
    position: 'absolute',
    bottom: verticalScale(24),
    right: horizontalScale(20),
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(28),
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
