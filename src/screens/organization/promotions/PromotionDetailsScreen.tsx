import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Clipboard,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import {
  ChevronLeft,
  Megaphone,
  Calendar,
  MapPin,
  Globe,
  Tag,
  Copy,
  Eye,
  Hash,
  FileText,
  Sparkles,
  Pencil,
  Trash2,
  Info,
} from 'lucide-react-native';
import { api } from '../../../api/client';
import { formatDate } from '../../../utils/dateFormatter';
import { formatStatus, getStatusColors } from '../../../utils/statusUtils';
import Toast from 'react-native-toast-message';

export const PromotionDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id, promotion: initialData, isPublicView } = route.params || {};

  const [promotion, setPromotion] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPromotionDetails();
    }
  }, [id]);

  const fetchPromotionDetails = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>(`/promotions/${id}`);
      if (data) {
        setPromotion(data);
      }
    } catch (error: any) {
      console.error('Failed to fetch promotion details', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    const targetId = promotion?.id || id;
    if (!targetId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Invalid promotion ID' });
      return;
    }

    try {
      setPublishing(true);
      await api.post(`/promotions/${targetId}/publish`);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Promotion published successfully!',
      });
      setPromotion((prev: any) => ({ ...prev, status: 'Active' }));
    } catch (error: any) {
      console.error('Failed to publish promotion', error);
      Toast.show({
        type: 'error',
        text1: 'Publish Failed',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to publish promotion',
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleClose = async () => {
    const targetId = promotion?.id || id;
    if (!targetId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Invalid promotion ID' });
      return;
    }

    Alert.alert(
      'Close Promotion',
      'Are you sure you want to close this promotion? Users will no longer see it as active.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Promotion',
          style: 'destructive',
          onPress: async () => {
            try {
              setClosing(true);
              await api.post(`/promotions/${targetId}/close`, {});
              Toast.show({
                type: 'success',
                text1: 'Promotion Closed',
                text2: 'Promotion closed successfully!',
              });
              setPromotion((prev: any) => ({ ...prev, status: 'closed' }));
            } catch (error: any) {
              console.error('Failed to close promotion', error);
              Toast.show({
                type: 'error',
                text1: 'Close Failed',
                text2: error?.data?.errors?.[0] || error?.message || 'Failed to close promotion',
              });
            } finally {
              setClosing(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    const targetId = promotion?.id || id;
    if (!targetId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Invalid promotion ID' });
      return;
    }

    Alert.alert(
      'Delete Promotion',
      'Are you sure you want to delete this promotion? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await api.delete(`/promotions/${targetId}`);
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Promotion deleted successfully!',
              });
              navigation.goBack();
            } catch (error: any) {
              console.error('Failed to delete promotion', error);
              Toast.show({
                type: 'error',
                text1: 'Delete Failed',
                text2: error?.data?.errors?.[0] || error?.message || 'Failed to delete promotion',
              });
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCopyCode = () => {
    const code = promotion?.promo_code || promotion?.promoCode || 'UPLIFT';
    Clipboard.setString(code);
    setCopied(true);
    Toast.show({
      type: 'success',
      text1: 'Copied!',
      text2: `Promo code "${code}" copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDateVal = (dateVal: any) => {
    if (!dateVal) return 'N/A';
    if (typeof dateVal === 'string') return formatDate(dateVal);
    if (dateVal instanceof Date) return formatDate(dateVal.toISOString());
    return String(dateVal);
  };

  const promoTitle = promotion?.business_name || promotion?.title || 'Promotion Details';
  const promoType = promotion?.promotion_type?.name || promotion?.promotion_type_name || promotion?.type || 'Promotion';
  const categoryName = promotion?.product_category?.name || promotion?.product_category_name || promotion?.category || 'General';
  const code = promotion?.promo_code || promotion?.promoCode || 'UPLIFT';
  const locationType = promotion?.location_type || 'in_store';
  const address = promotion?.store_address || promotion?.address || '';
  const url = promotion?.online_url || promotion?.url || '';

  const availableFrom = promotion?.available_from || promotion?.availableUntil;
  const availableUntil = promotion?.available_until || promotion?.availableUntil;
  const quantity = promotion?.quantity_available !== null && promotion?.quantity_available !== undefined
    ? `${promotion.quantity_available} Available`
    : (promotion?.quantity || 'Unlimited');

  const terms = promotion?.terms_and_conditions || promotion?.termsConditions || '';
  const description = promotion?.description || '';

  const statusStyle = promotion?.status ? getStatusColors(promotion.status) : null;

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={Colors.primary[500]} barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerAbsoluteCenter}>
            <AppText variant="h5" color={Colors.neutral[0]}>Promotion Details</AppText>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ChevronLeft color={Colors.neutral[0]} size={28} strokeWidth={2} />
          </TouchableOpacity>
          <View style={{ width: 50, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            {(() => {
              const isClosed = (promotion?.status || '').toLowerCase() === 'closed' || (promotion?.status || '').toLowerCase() === 'expired';
              if (isClosed || isPublicView) return null;
              return (
                <>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CreatePromotion', { promotionToEdit: promotion })}
                    style={{ marginRight: 12 }}>
                    <Pencil color={Colors.neutral[0]} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDelete}>
                    <Trash2 color={Colors.neutral[0]} size={20} />
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>

            {promotion?.status ? (
              <View style={styles.detailRowItem}>
                <View style={styles.detailLabelRow}>
                  <Info color={Colors.neutral[600]} size={20} />
                  <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Status</AppText>
                </View>
                <AppText variant="bodyMedium" color={statusStyle?.text || Colors.neutral[600]} style={{ flex: 1, textAlign: 'right', marginLeft: 16 }}>
                  {formatStatus(promotion.status)}
                </AppText>
              </View>
            ) : null}

            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <Megaphone color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Business Name</AppText>
              </View>
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{ flex: 1, textAlign: 'right', marginLeft: 16 }}>
                {promoTitle}
              </AppText>
            </View>

            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <Sparkles color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Promotion Type</AppText>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={styles.badge}>
                  <AppText variant="labelSmall" color={Colors.primary[700]}>
                    {promoType}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <Tag color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Product Category</AppText>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={styles.badgeOutline}>
                  <AppText variant="labelSmall" color={Colors.neutral[600]}>
                    {categoryName}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <Calendar color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Promotion Period</AppText>
              </View>
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{ flex: 1, textAlign: 'right', marginLeft: 16 }}>
                {promotion?.dates || `${formatDateVal(availableFrom)} - ${formatDateVal(availableUntil)}`}
              </AppText>
            </View>

            {(locationType === 'in_store' || locationType === 'both' || address) ? (
              <View style={styles.detailRowItem}>
                <View style={styles.detailLabelRow}>
                  <MapPin color={Colors.neutral[600]} size={20} />
                  <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Location</AppText>
                </View>
                <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{ flex: 1, textAlign: 'right', marginLeft: 16 }}>
                  {address || 'In store'}
                </AppText>
              </View>
            ) : null}

            {(locationType === 'online' || locationType === 'both' || url) ? (
              <View style={styles.detailColumnItem}>
                <View style={styles.detailLabelRow}>
                  <Globe color={Colors.neutral[600]} size={20} />
                  <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>URL</AppText>
                </View>
                <TouchableOpacity onPress={() => url && Linking.openURL(url.startsWith('http') ? url : `https://${url}`)}>
                  <AppText variant="bodyMedium" color={Colors.primary[600]} style={{ marginLeft: 28, marginTop: 4, lineHeight: 22, textDecorationLine: 'underline' }}>
                    {url || 'Online'}
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <Hash color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Quantity Available</AppText>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={styles.badgeOutline}>
                  <AppText variant="labelSmall" color={Colors.neutral[600]}>
                    {quantity}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <Eye color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Total Views</AppText>
              </View>
              <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{ flex: 1, textAlign: 'right', marginLeft: 16 }}>
                {promotion?.views_count || promotion?.views || 0} views
              </AppText>
            </View>

            {/* Promo Code Box */}
            <TouchableOpacity style={styles.codeBox} onPress={handleCopyCode} activeOpacity={0.8}>
              <View style={styles.codeLeft}>
                <Tag size={20} color={Colors.primary[600]} style={{ marginRight: 8 }} />
                <View>
                  <AppText variant="labelSmall" color={Colors.neutral[500]} style={{ letterSpacing: 0.5 }}>PROMO CODE</AppText>
                  <AppText variant="h6" color={Colors.primary[700]} style={{ letterSpacing: 1, fontFamily: FontFamily.bold }}>{code}</AppText>
                </View>
              </View>
              <View style={styles.copyButton}>
                <Copy size={16} color={Colors.primary[600]} style={{ marginRight: 4 }} />
                <AppText variant="labelSmall" color={Colors.primary[600]} style={{ fontFamily: FontFamily.semiBold }}>{copied ? 'Copied' : 'Copy'}</AppText>
              </View>
            </TouchableOpacity>

            {terms ? (
              <View style={styles.detailColumnItem}>
                <View style={styles.detailLabelRow}>
                  <FileText color={Colors.neutral[600]} size={20} />
                  <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Terms and Conditions</AppText>
                </View>
                <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{ marginLeft: 28, marginTop: 4, lineHeight: 22 }}>
                  {terms}
                </AppText>
              </View>
            ) : null}

            {description ? (
              <View style={styles.detailColumnItem}>
                <View style={styles.detailLabelRow}>
                  <FileText color={Colors.neutral[600]} size={20} />
                  <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Description</AppText>
                </View>
                <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{ marginLeft: 28, marginTop: 4, lineHeight: 22 }}>
                  {description}
                </AppText>
              </View>
            ) : null}

          </ScrollView>
        )}

        {/* Footer Actions */}
        {(() => {
          if (isPublicView) return null;
          const status = (promotion?.status || '').toLowerCase();
          if (status !== 'closed' && status !== 'expired') {
            return (
              <View style={styles.footer}>
                <Button
                  title="Close Promotion"
                  onPress={handleClose}
                  loading={closing}
                  color="error"
                  variant="outline"
                  size="lg"
                  fullWidth
                />
              </View>
            );
          }
          return null;
        })()}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.primary[500],
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
    position: 'relative',
  },
  headerAbsoluteCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  iconButton: { padding: 4 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16 },
  badge: { backgroundColor: Colors.primary[50], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeOutline: { backgroundColor: Colors.neutral[50], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  detailColumnItem: {
    marginBottom: 20,
  },
  detailRowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary[50],
    borderWidth: 1.5,
    borderColor: Colors.primary[300],
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    marginTop: 4,
  },
  codeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
});
