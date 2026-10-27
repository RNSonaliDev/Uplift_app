import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, Linking, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useStripe, LinkDisplay } from '@stripe/stripe-react-native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { FileText, Link2, Briefcase, Tag, ChevronLeft, Building, DollarSign, Clock, Edit2, Info, Sparkles, Check, X } from 'lucide-react-native';
import { api } from '../../../api/client';
import { plansApi, Plan, CreatePlanPurchaseResponse } from '../../../api/plans';
import Toast from 'react-native-toast-message';
import { formatStatus, getStatusColors } from '../../../utils/statusUtils';
import { formatDate } from '../../../utils/dateFormatter';

export const JobDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [job, setJob] = useState<any>(route.params?.job || null);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<CreatePlanPurchaseResponse | null>(null);
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleSelectPlan = useCallback(async (plan: Plan) => {
    setSelectedPlan(plan);
    if (!job?.id) return;
    try {
      setInitializingPayment(true);
      const res = await plansApi.createPlanPurchase(job.id, plan.id);
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
      console.warn('Failed to create plan purchase on selection', error);
    } finally {
      setInitializingPayment(false);
    }
  }, [job?.id, initPaymentSheet]);

  const fetchPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      const data = await plansApi.getPlans('job');
      if (data && data.length > 0) {
        setPlans(data);
        const defaultPlan = data.find((p) => p.code === 'featured') || data[0];
        handleSelectPlan(defaultPlan);
      }
    } catch (error) {
      console.error('Failed to fetch plans', error);
    } finally {
      setLoadingPlans(false);
    }
  }, [handleSelectPlan]);

  const fetchJob = useCallback(async () => {
    if (!job?.id) return;
    try {
      setLoading(true);
      const data = await api.get<any>(`/job_posts/${job.id}`);
      setJob(data);
      if (data?.status === 'draft') {
        fetchPlans();
      }
    } catch (error) {
      console.error('Failed to fetch job details', error);
    } finally {
      setLoading(false);
    }
  }, [job?.id, fetchPlans]);

  useFocusEffect(
    useCallback(() => {
      fetchJob();
      if (job?.status === 'draft') {
        fetchPlans();
      }
    }, [fetchJob, fetchPlans, job?.status])
  );

  const handleClose = async () => {
    try {
      setClosing(true);
      await api.post(`/job_posts/${job.id}/close`);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Job closed successfully!' });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'Failed to close job.' });
    } finally {
      setClosing(false);
    }
  };

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
    if (!job?.id) return;
    if (!selectedPlan) {
      Toast.show({ type: 'info', text1: 'Plan Required', text2: 'Please select a plan to publish this job.' });
      return;
    }

    try {
      setPublishing(true);

      // 1. Ensure we have a plan purchase created for the currently selected plan
      let purchaseData = currentPurchase;
      if (!purchaseData || purchaseData.plan_purchase?.plan?.id !== selectedPlan.id) {
        purchaseData = await plansApi.createPlanPurchase(job.id, selectedPlan.id);
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

      // 4. Trigger publish endpoint to ensure job post status transitions to published
      try {
        await api.post(`/job_posts/${job.id}/publish`, {
          plan_id: selectedPlan.id,
          plan_code: selectedPlan.code,
          plan_purchase_id: purchaseId,
        });
      } catch (pubErr) {
        // If confirm already marked job published, ignore
      }

      setIsPlanModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: job.status === 'draft' ? 'Plan purchased and job published successfully!' : 'Job boosted successfully!',
      });
      await fetchJob();
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

  if (!job) return null;
  const statusStyle = getStatusColors(job.status);

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerAbsoluteCenter}>
            <AppText variant="h5" color={Colors.neutral[0]}>Job Details</AppText>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ChevronLeft color={Colors.neutral[0]} size={28} strokeWidth={2} />
          </TouchableOpacity>
          <View style={{width: 50, alignItems: 'flex-end'}}>
            {job.status === 'draft' && (
              <TouchableOpacity onPress={() => navigation.navigate('CreateJob', { job })}>
                <Edit2 color={Colors.neutral[0]} size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchJob} />}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View style={styles.detailLabelRow}>
            <Info color={Colors.neutral[600]} size={20} />
            <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Status</AppText>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end', marginLeft: 16 }}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderWidth: 0 }]}>
              <AppText variant="labelMedium" color={statusStyle.text}>
                {formatStatus(job.status)}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.detailRowItem}>
          <View style={styles.detailLabelRow}>
            <Briefcase color={Colors.neutral[600]} size={20} />
            <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Job Title</AppText>
          </View>
          <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
            {job.title}
          </AppText>
        </View>

        {job.department && (
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Tag color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Department</AppText>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={styles.badge}>
                <AppText variant="labelSmall" color={Colors.primary[700]}>
                  {typeof job.department === 'object' && job.department !== null ? job.department.title : job.department}
                </AppText>
              </View>
            </View>
          </View>
        )}

        {job.job_type && (
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Clock color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Job Type</AppText>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={styles.badgeOutline}>
                <AppText variant="labelSmall" color={Colors.neutral[600]}>{job.job_type}</AppText>
              </View>
            </View>
          </View>
        )}

        {job.work_setting && (
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Building color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Work Setting</AppText>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={styles.badgeOutline}>
                <AppText variant="labelSmall" color={Colors.neutral[600]}>{job.work_setting}</AppText>
              </View>
            </View>
          </View>
        )}

        {job.compensation && (
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <DollarSign color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Compensation</AppText>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={styles.badgeOutline}>
                <AppText variant="labelSmall" color={Colors.neutral[600]}>{job.compensation}</AppText>
              </View>
            </View>
          </View>
        )}

        {job.company_url ? (
          <View style={styles.detailColumnItem}>
            <View style={styles.detailLabelRow}>
              <Link2 color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Company URL</AppText>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL(job.company_url)}>
              <AppText variant="bodyMedium" color={Colors.primary[600]} style={{marginLeft: 28, marginTop: 4, lineHeight: 22, textDecorationLine: 'underline'}}>
                {job.company_url}
              </AppText>
            </TouchableOpacity>
          </View>
        ) : null}

        {job.job_url ? (
          <View style={styles.detailColumnItem}>
            <View style={styles.detailLabelRow}>
              <Link2 color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Job URL</AppText>
            </View>
            <TouchableOpacity onPress={() => Linking.openURL(job.job_url)}>
              <AppText variant="bodyMedium" color={Colors.primary[600]} style={{marginLeft: 28, marginTop: 4, lineHeight: 22, textDecorationLine: 'underline'}}>
                Apply here
              </AppText>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.detailColumnItem}>
          <View style={styles.detailLabelRow}>
            <FileText color={Colors.neutral[600]} size={20} />
            <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Description</AppText>
          </View>
          <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{marginLeft: 28, marginTop: 4, lineHeight: 22}}>
            {job.description}
          </AppText>
        </View>

        {(job.plan || job.badge || job.boost) && (
          <View style={styles.detailRowItem}>
            <View style={styles.detailLabelRow}>
              <Sparkles color={Colors.primary[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>
                {job.badge ? `${job.badge} Boost` : 'Active Plan'}
              </AppText>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={[styles.badge, { backgroundColor: Colors.primary[100] }]}>
                <AppText variant="labelSmall" color={Colors.primary[700]} style={{ fontFamily: FontFamily.semiBold }}>
                  {job.badge || (typeof job.plan === 'object' ? job.plan.name : job.plan) || 'Boosted'}
                </AppText>
              </View>
              {job.boost_ends_at && (
                <AppText variant="caption" color={Colors.neutral[500]} style={{ marginTop: 2 }}>
                  Boost ends {formatDate(job.boost_ends_at)}
                </AppText>
              )}
            </View>
          </View>
        )}

      </ScrollView>
      {job.status === 'published' ? (
        <View style={styles.footer}>
          <Button title="Close Job" onPress={handleClose} loading={closing} size="lg" fullWidth style={{ backgroundColor: Colors.error }} />
        </View>
      ) : job.status === 'draft' || job.requires_plan ? (
        <View style={styles.footer}>
          <Button
            title="Publish Job"
            onPress={handleOpenPublish}
            loading={publishing && !isPlanModalVisible}
            size="lg"
            fullWidth
          />
        </View>
      ) : job.status !== 'closed' ? (
        <View style={styles.footer}>
          <Button title="Close Job" onPress={handleClose} loading={closing} size="lg" fullWidth style={{ backgroundColor: Colors.error }} />
        </View>
      ) : null}

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
                  A paid promotion plan is required to publish this job listing:
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
                              Active listing for {p.duration_days} days
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: Colors.primary[500], borderBottomWidth: 1, borderBottomColor: Colors.primary[500], position: 'relative' },
  headerAbsoluteCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
  iconButton: { padding: 4 },
  content: { padding: 16, paddingBottom: 24 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeContainer: { flexDirection: 'row', marginBottom: 24, flexWrap: 'wrap', gap: 8 },
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
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: Colors.neutral[200] },

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

