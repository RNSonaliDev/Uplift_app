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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { FontFamily } from '../../../theme/typography';
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
  X,
  Check,
} from 'lucide-react-native';
import { api } from '../../../api/client';
import { useStripe, LinkDisplay } from '@stripe/stripe-react-native';
import { plansApi, Plan, CreatePlanPurchaseResponse } from '../../../api/plans';
import { formatDate } from '../../../utils/dateFormatter';
import Toast from 'react-native-toast-message';

export const PromotionPreviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { promotion, rawPayload, isEditing, editingId } = route.params || {};

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<CreatePlanPurchaseResponse | null>(null);
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [savedPromoId, setSavedPromoId] = useState<number | string | null>(null);

  const handleSelectPlan = async (plan: Plan, targetPromoId?: number | string) => {
    setSelectedPlan(plan);
    const promoId = targetPromoId || savedPromoId || editingId || promotion?.id;
    if (!promoId) return;
    try {
      setInitializingPayment(true);
      const res = await plansApi.createPromotionPlanPurchase(promoId, plan.id);
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
  };

  const fetchPlans = async (targetPromoId?: number | string, plansList?: Plan[]) => {
    try {
      setLoadingPlans(true);
      let data: Plan[] = plansList && plansList.length > 0 ? plansList : [];
      if (!data || data.length === 0) {
        data = await plansApi.getPlans('promotion');
      }
      if (data && data.length > 0) {
        setPlans(data);
        const defaultPlan = data.find((p) => (p.code || '').toLowerCase() === 'featured') || data[0];
        await handleSelectPlan(defaultPlan, targetPromoId);
      }
    } catch (error) {
      console.error('Failed to fetch promotion plans', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handlePayAndPublish = async () => {
    const targetId = savedPromoId || editingId || promotion?.id;
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
      } catch {
        // If confirm already marked promotion published, ignore
      }

      setIsPlanModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Plan purchased and promotion published successfully!',
      });
      navigation.navigate('OrganizationTabs', { screen: 'PromotionsTab' });
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

  const handleClosePlanModal = () => {
    if (publishing) return;
    setIsPlanModalVisible(false);
    Toast.show({
      type: 'info',
      text1: 'Draft Saved',
      text2: 'You can select a plan anytime to publish this promotion.',
    });
    navigation.navigate('OrganizationTabs', { screen: 'PromotionsTab' });
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

      let savedPromo: any = null;
      if (targetId) {
        savedPromo = await api.put(`/promotions/${targetId}`, payloadToUse);
      } else {
        savedPromo = await api.post('/promotions', payloadToUse);
        targetId = savedPromo?.id || savedPromo?.promotion?.id;
      }

      const status = (savedPromo?.status || savedPromo?.promotion?.status || promotion?.status || '').toLowerCase();
      const isDraft = status === 'draft' || savedPromo?.requires_plan || savedPromo?.promotion?.requires_plan;

      const availablePlansFromApi =
        savedPromo?.available_plans ||
        savedPromo?.promotion?.available_plans ||
        promotion?.available_plans;

      if (isDraft && targetId) {
        setSavedPromoId(targetId);
        setIsPlanModalVisible(true);
        fetchPlans(targetId, Array.isArray(availablePlansFromApi) && availablePlansFromApi.length > 0 ? availablePlansFromApi : undefined);
        Toast.show({
          type: 'info',
          text1: 'Draft Saved',
          text2: 'Please select a plan to publish this promotion.',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: isEditing ? 'Promotion updated successfully!' : 'Promotion published successfully!',
        });
        navigation.navigate('OrganizationTabs', { screen: 'PromotionsTab' });
      }
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

          {/* {promotion?.status ? (
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
          ) : null} */}

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

        </ScrollView>

        {/* Footer Publish Button */}
        <View style={styles.footer}>
          <Button
            title="Publish Promotion"
            onPress={handlePublish}
            loading={publishing && !isPlanModalVisible}
            size="lg"
            fullWidth
          />
        </View>

        {/* Plan Selection Modal */}
        <Modal
          visible={isPlanModalVisible}
          transparent
          animationType="slide"
          onRequestClose={handleClosePlanModal}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdropTouch}
              activeOpacity={1}
              onPress={handleClosePlanModal}
            />
            <View style={styles.modalContainer}>
              <View style={styles.modalDragHandle} />

              <View style={styles.modalHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AppText variant="bodyLarge" weight="bold" color={Colors.neutral[900]} style={{ marginLeft: 8 }}>
                      Choose Plan to Publish
                    </AppText>
                  </View>
                  <AppText variant="bodySmall" color={Colors.neutral[600]} style={{ marginTop: 4 }}>
                    A paid promotion plan is required to publish this promotion:
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={handleClosePlanModal}
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
                                  {p.duration_days ? `${p.duration_days} Days Duration` : (p.code === 'featured' ? '30 Days Duration' : '15 Days Duration')}
                                </AppText>
                              </View>
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                              <AppText variant="h6" weight="bold" color={Colors.primary[600]}>
                                ${Number(p.amount || p.price).toFixed(2)}
                              </AppText>
                              {p.processing_fee ? (
                                <AppText variant="caption" color={Colors.neutral[500]}>
                                  +${Number(p.processing_fee).toFixed(2)} fee
                                </AppText>
                              ) : null}
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
                                Active promotion for {p.duration_days || (p.code === 'featured' ? 30 : 15)} days
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
  content: { padding: 16 },
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
