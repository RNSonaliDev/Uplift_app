import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Clipboard,
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
  Info,
} from 'lucide-react-native';
import { api } from '../../../api/client';
import { formatDate } from '../../../utils/dateFormatter';
import { formatStatus, getStatusColors } from '../../../utils/statusUtils';
import Toast from 'react-native-toast-message';

export const PromotionPreviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { promotion, rawPayload, isEditing, editingId } = route.params || {};

  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handlePublish = async () => {
    try {
      setPublishing(true);

      let targetId = promotion?.id || editingId;
      let payloadToUse = rawPayload;

      if (!payloadToUse) {
        payloadToUse = {
          promotion: {
            promotion_type_id: promotion?.promotion_type?.id || promotion?.promotion_type_id || 1,
            product_category_id: promotion?.product_category?.id || promotion?.product_category_id || 1,
            business_name: promotion?.business_name || promotion?.title || '',
            available_from: promotion?.available_from || new Date().toISOString(),
            available_until: promotion?.available_until || new Date().toISOString(),
            location_type: promotion?.location_type || 'in_store',
            store_address: promotion?.store_address || '',
            online_url: promotion?.online_url || '',
            promo_code: promotion?.promo_code || promotion?.promoCode || 'UPLIFT',
            quantity_available: promotion?.quantity_available !== undefined ? promotion.quantity_available : null,
            terms_and_conditions: promotion?.terms_and_conditions || '',
          },
        };
      }

      if (isEditing && targetId) {
        await api.put(`/promotions/${targetId}`, payloadToUse);
      } else if (!targetId) {
        const createRes: any = await api.post('/promotions', payloadToUse);
        targetId = createRes?.id || createRes?.promotion?.id;
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Promotion published successfully!',
      });

      navigation.navigate('OrganizationTabs', { screen: 'PromotionsTab' });
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

  const promoTitle = promotion?.business_name || promotion?.title || 'New Promotion';
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
            <AppText variant="h5" color={Colors.neutral[0]}>Preview Promotion</AppText>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ChevronLeft color={Colors.neutral[0]} size={28} strokeWidth={2} />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

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

        {/* Footer Publish Button */}
        <View style={styles.footer}>
          <Button
            title="Publish Promotion"
            onPress={handlePublish}
            loading={publishing}
            size="lg"
            fullWidth
          />
        </View>
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
