import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useStripe, LinkDisplay } from '@stripe/stripe-react-native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { HtmlContentView } from '../../../components/HtmlContentView';
import {
  ChevronLeft,
  Megaphone,
  Calendar,
  MapPin,
  Globe,
  Tag,
  Copy,
  Eye,
  Package,
  FileText,
  Sparkles,
  Pencil,
  Trash2,
  Info,
  Check,
  X,
} from 'lucide-react-native';
import { api } from '../../../api/client';
import { authApi } from '../../../api/auth';
import { plansApi, Plan, CreatePlanPurchaseResponse } from '../../../api/plans';
import { formatDate } from '../../../utils/dateFormatter';
import { formatStatus, getStatusColors } from '../../../utils/statusUtils';
import Toast from 'react-native-toast-message';

export const PromotionDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id, promotion: initialData, isPublicView } = route.params || {};

  const [promotion, setPromotion] = useState<any>(initialData || null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialData);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<CreatePlanPurchaseResponse | null>(null);
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleSelectPlan = useCallback(async (plan: Plan) => {
    setSelectedPlan(plan);
    const targetId = promotion?.id || id;
    if (!targetId) return;
    try {
      setInitializingPayment(true);
      const res = await plansApi.createPromotionPlanPurchase(targetId, plan.id);
      setCurrentPurchase(res);
      if (res?.client_secret) {
        await initPaymentSheet({
          merchantDisplayName: 'Uplift',
          paymentIntentClientSecret: res.client_secret,
          returnURL: 'upliftapp://stripe-redirect',
          allowsDelayedPaymentMethods: true,
          paymentMethodOrder: ['card', 'us_bank_account'],
          link: {
            display: LinkDisplay.NEVER,
          },
        });
      }
    } catch (error: any) {
      console.warn('Failed to create promotion plan purchase on selection', error);
    } finally {
      setInitializingPayment(false);
    }
  }, [promotion?.id, id, initPaymentSheet]);

  const fetchPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      const data = await plansApi.getPlans('promotion');
      if (data && data.length > 0) {
        setPlans(data);
        const defaultPlan = data.find((p) => p.code === 'featured') || data[0];
        handleSelectPlan(defaultPlan);
      }
    } catch (error) {
      console.error('Failed to fetch promotion plans', error);
    } finally {
      setLoadingPlans(false);
    }
  }, [handleSelectPlan]);

  const fetchPromotionDetails = useCallback(async () => {
    const targetId = promotion?.id || id;
    if (!targetId) return;
    try {
      setLoading(true);
      const data = await api.get<any>(`/promotions/${targetId}`);
      if (data) {
        setPromotion(data);
        if ((data.status || '').toLowerCase() === 'draft') {
          fetchPlans();
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch promotion details', error);
    } finally {
      setLoading(false);
    }
  }, [promotion?.id, id, fetchPlans]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res: any = await authApi.getProfile();
      const role = res?.default_role || res?.user?.default_role || null;
      setUserRole(role);
    } catch (err) {
      console.log('Failed to fetch profile in PromotionDetailsScreen', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPromotionDetails();
      fetchUserProfile();
      if ((promotion?.status || '').toLowerCase() === 'draft') {
        fetchPlans();
      }
    }, [fetchPromotionDetails, fetchUserProfile, promotion?.status, fetchPlans])
  );

  const handleOpenPublish = () => {
    setIsPlanModalVisible(true);
    if (plans.length === 0) {
      fetchPlans();
    } else if (!selectedPlan && plans.length > 0) {
      const defaultPlan = plans.find((p) => p.code === 'featured') || plans[0];
      handleSelectPlan(defaultPlan);
    }
  };

  const handlePayAndPublish = async () => {
    const targetId = promotion?.id || id;
    if (!targetId) return;
    if (!selectedPlan) {
      Toast.show({ type: 'info', text1: 'Plan Required', text2: 'Please select a plan to publish this promotion.' });
      return;
    }

    try {
      setPublishing(true);

      // 1. Ensure we have a plan purchase created for the currently selected plan
      let purchaseData = currentPurchase;
      if (!purchaseData || purchaseData.plan_purchase?.plan?.id !== selectedPlan.id) {
        purchaseData = await plansApi.createPromotionPlanPurchase(targetId, selectedPlan.id);
        setCurrentPurchase(purchaseData);
        if (purchaseData?.client_secret) {
          const { error: initErr } = await initPaymentSheet({
            merchantDisplayName: 'Uplift',
            paymentIntentClientSecret: purchaseData.client_secret,
            returnURL: 'upliftapp://stripe-redirect',
            allowsDelayedPaymentMethods: true,
            paymentMethodOrder: ['card', 'us_bank_account'],
            link: {
              display: LinkDisplay.NEVER,
            },
          });
          if (initErr) {
            Toast.show({ type: 'error', text1: 'Payment Error', text2: initErr.message });
            setPublishing(false);
            return;
          }
        }
      }

      // 2. Present Stripe Payment Sheet
      if (purchaseData?.client_secret) {
        const { error: paymentError } = await presentPaymentSheet();
        if (paymentError) {
          if (paymentError.code !== 'Canceled') {
            Toast.show({ type: 'error', text1: 'Payment Failed', text2: paymentError.message });
          }
          setPublishing(false);
          return;
        }
      }

      // 3. Confirm plan purchase on backend
      const purchaseId = purchaseData?.plan_purchase?.id;
      if (purchaseId) {
        await plansApi.confirmPlanPurchase(purchaseId);
      }

      // 4. Trigger publish endpoint to ensure promotion status transitions to published
      try {
        await api.post(`/promotions/${targetId}/publish`, {
          plan_id: selectedPlan.id,
          plan_code: selectedPlan.code,
          plan_purchase_id: purchaseId,
        });
      } catch (pubErr) {
        // If confirm already marked promotion published, ignore
      }

      setIsPlanModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: (promotion?.status || '').toLowerCase() === 'draft' ? 'Plan purchased and promotion published successfully!' : 'Promotion boosted successfully!',
      });
      await fetchPromotionDetails();
    } catch (error: any) {
      if (error?.data?.error === 'PlanRequiredError' || error?.message?.includes('PlanRequiredError') || error?.data?.requires_plan) {
        setIsPlanModalVisible(true);
      }
      const errMsg =
        error?.data?.error ||
        error?.data?.errors?.[0] ||
        error?.message ||
        'Failed to complete plan purchase.';
      Toast.show({ type: 'error', text1: 'Error', text2: errMsg });
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
  const isVolOrBeni = isPublicView || userRole === 'volunteer' || userRole === 'beneficiary';

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
              if (isClosed || isPublicView || isVolOrBeni) return null;
              return (
                <>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CreatePromotion', { promotionToEdit: promotion })}
                    style={{ marginRight: 14 }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Pencil color={Colors.neutral[0]} size={22} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleDelete}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 color={Colors.neutral[0]} size={22} />
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
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPromotionDetails} />}>

            {promotion?.status && !isVolOrBeni ? (
              <View style={styles.detailRowItem}>
                <View style={styles.detailLabelRow}>
                  <Info color={Colors.neutral[600]} size={20} />
                  <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Status</AppText>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end', marginLeft: 16 }}>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle?.bg || Colors.neutral[50] }]}>
                    <AppText variant="labelMedium" color={statusStyle?.text || Colors.neutral[600]}>
                      {formatStatus(promotion.status)}
                    </AppText>
                  </View>
                </View>
              </View>
            ) : null}

            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <Megaphone color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Business Name</AppText>
              </View>
              <AppText variant="bodyMedium" color={Colors.neutral[800]} style={{ flex: 1, textAlign: 'right', marginLeft: 16 }}>
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
                  <AppText variant="labelSmall" color={Colors.neutral[700]}>
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
              <AppText variant="bodyMedium" color={Colors.neutral[800]} style={{ flex: 1, textAlign: 'right', marginLeft: 16 }}>
                {promotion?.dates || `${formatDateVal(availableFrom)} - ${formatDateVal(availableUntil)}`}
              </AppText>
            </View>

            <View style={styles.detailRowItem}>
              <View style={styles.detailLabelRow}>
                <Package color={Colors.neutral[600]} size={20} />
                <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Quantity Available</AppText>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={styles.badgeOutline}>
                  <AppText variant="labelSmall" color={Colors.neutral[700]}>
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
              <AppText variant="bodyMedium" color={Colors.neutral[800]} style={{ flex: 1, textAlign: 'right', marginLeft: 16 }}>
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
                <View style={{ marginLeft: 28, marginTop: 4 }}>
                  <HtmlContentView htmlContent={terms} />
                </View>
              </View>
            ) : null}

            {description ? (
              <View style={styles.detailColumnItem}>
                <View style={styles.detailLabelRow}>
                  <FileText color={Colors.neutral[600]} size={20} />
                  <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Description</AppText>
                </View>
                <AppText variant="bodyMedium" color={Colors.neutral[800]} style={{ marginLeft: 28, marginTop: 4, lineHeight: 22 }}>
                  {description}
                </AppText>
              </View>
            ) : null}

            {(locationType === 'in_store' || locationType === 'both' || address) ? (
              <View style={styles.detailColumnItem}>
                <View style={styles.detailLabelRow}>
                  <MapPin color={Colors.neutral[600]} size={20} />
                  <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>Location</AppText>
                </View>
                <AppText variant="bodyMedium" color={Colors.neutral[800]} style={{ marginLeft: 28, marginTop: 4, lineHeight: 22 }}>
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

            {!isVolOrBeni && (promotion?.plan || promotion?.badge || promotion?.boost) && (
              <View style={styles.detailRowItem}>
                <View style={styles.detailLabelRow}>
                  <Sparkles color={Colors.primary[600]} size={20} />
                  <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{ marginLeft: 8, fontFamily: FontFamily.medium }}>
                    {promotion.badge ? `${promotion.badge} Boost` : 'Active Plan'}
                  </AppText>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <View style={[styles.badge, { backgroundColor: Colors.primary[100] }]}>
                    <AppText variant="labelSmall" color={Colors.primary[700]} style={{ fontFamily: FontFamily.semiBold }}>
                      {promotion.badge || (typeof promotion.plan === 'object' ? promotion.plan.name : promotion.plan) || 'Boosted'}
                    </AppText>
                  </View>
                  {promotion.boost_ends_at && (
                    <AppText variant="caption" color={Colors.neutral[500]} style={{ marginTop: 2 }}>
                      Boost ends {formatDate(promotion.boost_ends_at)}
                    </AppText>
                  )}
                </View>
              </View>
            )}

          </ScrollView>
        )}

        {/* Footer Actions */}
        {(() => {
          if (isPublicView || isVolOrBeni) return null;
          const status = (promotion?.status || '').toLowerCase();
          if (status === 'published') {
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
          if (status === 'draft' || promotion?.requires_plan) {
            return (
              <View style={styles.footer}>
                <Button
                  title="Publish Promotion"
                  onPress={handleOpenPublish}
                  loading={publishing && !isPlanModalVisible}
                  size="lg"
                  fullWidth
                />
              </View>
            );
          }
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

        {/* Plan Selection Modal */}
        <Modal
          visible={isPlanModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => !publishing && setIsPlanModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdropTouch}
              activeOpacity={1}
              onPress={() => !publishing && setIsPlanModalVisible(false)}
            />
            <View style={styles.modalContainer}>
              <View style={styles.modalDragHandle} />

              <View style={styles.modalHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Sparkles color={Colors.primary[600]} size={20} />
                    <AppText variant="bodyLarge" weight="bold" color={Colors.neutral[900]} style={{ marginLeft: 8 }}>
                      Choose Plan to Publish
                    </AppText>
                  </View>
                  <AppText variant="bodySmall" color={Colors.neutral[600]} style={{ marginTop: 4 }}>
                    A paid promotion plan is required to publish this promotion:
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => !publishing && setIsPlanModalVisible(false)}
                  style={styles.modalCloseButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X color={Colors.neutral[700]} size={22} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {loadingPlans && plans.length === 0 ? (
                  <View style={styles.planLoadingContainer}>
                    <ActivityIndicator size="small" color={Colors.primary[500]} />
                    <AppText variant="bodySmall" color={Colors.neutral[500]} style={{ marginLeft: 8 }}>
                      Loading available plans...
                    </AppText>
                  </View>
                ) : (
                  <View style={styles.plansList}>
                    {plans.map((p) => {
                      const isSelected = selectedPlan?.id === p.id;
                      const isFeatured = (p.code || '').toLowerCase() === 'featured' || (p.badge || '').toLowerCase() === 'featured';
                      return (
                        <TouchableOpacity
                          key={p.id}
                          activeOpacity={0.85}
                          onPress={() => handleSelectPlan(p)}
                          style={[
                            styles.planCard,
                            isSelected && styles.planCardSelected,
                            isFeatured && !isSelected && styles.planCardFeaturedBorder,
                          ]}
                        >
                          {isFeatured && (
                            <View style={styles.popularBadge}>
                              <Sparkles color="#FFF" size={11} />
                              <AppText variant="caption" color="#FFF" style={styles.popularBadgeText}>
                                FEATURED
                              </AppText>
                            </View>
                          )}

                          <View style={styles.planCardTopRow}>
                            <View style={styles.planRadioRow}>
                              <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                                {isSelected && <View style={styles.radioButtonInner} />}
                              </View>
                              <View style={{ marginLeft: 10, flex: 1 }}>
                                <AppText variant="bodyLarge" weight="bold" color={Colors.neutral[900]}>
                                  {p.name}
                                </AppText>
                                <AppText variant="caption" color={Colors.neutral[500]}>
                                  {p.duration_days} Days Duration
                                </AppText>
                              </View>
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                              <AppText variant="h6" weight="bold" color={Colors.primary[600]}>
                                ${Number(p.price).toFixed(2)}
                              </AppText>
                              <AppText variant="caption" color={Colors.neutral[500]}>
                                +${Number(p.processing_fee).toFixed(2)} fee
                              </AppText>
                            </View>
                          </View>

                          {p.description ? (
                            <AppText variant="bodySmall" color={Colors.neutral[600]} style={styles.planDesc}>
                              {p.description}
                            </AppText>
                          ) : null}

                          <View style={styles.planFeatures}>
                            <View style={styles.planFeatureItem}>
                              <Check color={Colors.primary[600]} size={14} strokeWidth={2.5} />
                              <AppText variant="caption" color={Colors.neutral[700]} style={{ marginLeft: 6 }}>
                                Active promotion for {p.duration_days} days
                              </AppText>
                            </View>
                            {isFeatured && (
                              <View style={styles.planFeatureItem}>
                                <Check color={Colors.primary[600]} size={14} strokeWidth={2.5} />
                                <AppText variant="caption" color={Colors.neutral[700]} style={{ marginLeft: 6 }}>
                                  Top of feed & highlighted badge
                                </AppText>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </ScrollView>

              {/* Modal Footer with Pay Button */}
              <View style={styles.modalFooter}>
                <Button
                  title={
                    publishing
                      ? 'Processing Payment...'
                      : initializingPayment
                      ? 'Preparing Checkout...'
                      : selectedPlan
                      ? `Pay $${Number(selectedPlan.amount || selectedPlan.price).toFixed(2)}`
                      : 'Pay'
                  }
                  onPress={handlePayAndPublish}
                  loading={publishing || initializingPayment}
                  disabled={publishing || initializingPayment || !selectedPlan}
                  size="lg"
                  fullWidth
                />
              </View>
            </View>
          </View>
        </Modal>
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
  content: { padding: 16, paddingBottom: 24 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
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

  // Plan Selection Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 12,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral[300],
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },

  planLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  plansList: {
    gap: 12,
  },
  planCard: {
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#FFF',
    position: 'relative',
    marginTop: 6,
  },
  planCardSelected: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[50],
  },
  planCardFeaturedBorder: {
    borderColor: Colors.primary[300],
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  popularBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: FontFamily.bold,
    letterSpacing: 0.5,
  },
  planCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  radioButtonSelected: {
    borderColor: Colors.primary[600],
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary[600],
  },
  planDesc: {
    marginTop: 8,
    lineHeight: 18,
  },
  planFeatures: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    gap: 6,
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
