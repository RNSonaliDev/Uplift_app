import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Heart, ShieldCheck, Download, Calendar, DollarSign } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Colors } from '../../../theme/colors';
import { FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import { formatDate, formatTime12Hour } from '../../../utils/dateFormatter';
import { organizationDonationsApi, OrganizationDonation } from '../../../api/donations';
import { getFullUrl } from '../../../api/client';

export const OrgDonationsListScreen = () => {
  const navigation = useNavigation<any>();

  const [donations, setDonations] = useState<OrganizationDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchDonations = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await organizationDonationsApi.getDonations();
      if (Array.isArray(res)) {
        setDonations(res);
      }
    } catch (e: any) {
      console.warn('Failed to fetch organization donations', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDonations(false);
    }, [fetchDonations])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDonations(false);
    setRefreshing(false);
  }, [fetchDonations]);

  const handleDownloadInvoice = async (item: OrganizationDonation) => {
    if (downloadingId === item.id) return;

    try {
      setDownloadingId(item.id);

      Toast.show({
        type: 'info',
        text1: 'Downloading Invoice',
        text2: 'Preparing invoice file for your device...',
      });

      // 1. Determine target URL
      let targetUrl = item.invoice_url
        ? getFullUrl(item.invoice_url)
        : `https://uplift-backend.pixoatic.com/api/v1/organization_donations/${item.id}/invoice`;

      // 2. Fetch authenticated data from server
      const token = await AsyncStorage.getItem('UPLIFT_AUTH_TOKEN');
      const headers: Record<string, string> = {
        Accept: 'application/pdf, application/json, */*',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to download invoice (HTTP ${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      let blob: Blob;

      if (contentType.includes('application/json')) {
        const json = await response.json();
        const directUrl = json?.invoice_url || json?.url;
        if (!directUrl) {
          throw new Error('Invoice is being generated. Please check back shortly.');
        }
        const cleanUrl = getFullUrl(directUrl);
        const fileRes = await fetch(cleanUrl);
        if (!fileRes.ok) {
          throw new Error(`Failed to fetch invoice file (HTTP ${fileRes.status})`);
        }
        blob = await fileRes.blob();
      } else {
        blob = await response.blob();
      }

      let mimeType = blob.type;
      if (!mimeType || mimeType === 'application/octet-stream') {
        mimeType = 'application/pdf';
      }

      // Convert to base64 Data URI
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read invoice file'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error reading invoice'));
        reader.readAsDataURL(blob);
      });

      let finalDataUri = dataUri;
      if (mimeType && !finalDataUri.startsWith(`data:${mimeType}`)) {
        finalDataUri = finalDataUri.replace(/^data:[^;]*/, `data:${mimeType}`);
      }

      const filename = `Invoice_${item.reference_number || item.id}.pdf`;

      // Open native system sheet to save to device
      await Share.share(
        {
          url: finalDataUri,
          title: filename,
        },
        {
          subject: filename,
          dialogTitle: 'Save Invoice to Device',
        }
      );
    } catch (e: any) {
      console.warn('Failed to download invoice:', e);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: e?.message || 'Unable to download invoice to device. Please try again.',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const totalAmount = donations.reduce((sum, item) => {
    const s = (item.status || 'completed').toLowerCase();
    if (s === 'completed' || s === 'success') {
      return sum + (Number(item.amount) || 0);
    }
    return sum;
  }, 0);

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={Colors.primary[500]} barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <AppText variant="h5" color={Colors.neutral[0]} style={styles.headerTitle}>
            Partnering
          </AppText>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        ) : (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* Overview Stats Card */}
            {donations.length > 0 && (
              <View style={styles.statsCard}>
                <View style={styles.statItem}>
                  <AppText variant="caption" color={Colors.neutral[500]}>
                    Total Contributed
                  </AppText>
                  <AppText variant="h4" weight="bold" color={Colors.primary[600]} style={{ marginTop: 2 }}>
                    ${totalAmount.toFixed(2)}
                  </AppText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <AppText variant="caption" color={Colors.neutral[500]}>
                    Contributions
                  </AppText>
                  <AppText variant="h4" weight="bold" color={Colors.neutral[900]} style={{ marginTop: 2 }}>
                    {donations.length}
                  </AppText>
                </View>
              </View>
            )}

            {/* List or Empty State */}
            {donations.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Heart color={Colors.primary[500]} size={42} />
                </View>
                <AppText variant="h5" weight="semiBold" color={Colors.neutral[900]} style={styles.emptyTitle}>
                  No contributions yet
                </AppText>
                <AppText variant="bodySmall" color={Colors.neutral[600]} center style={styles.emptySubtitle}>
                  Your contribution supports iUpliftU platform operations and community growth.
                </AppText>
              </View>
            ) : (
              <View style={styles.listContainer}>
                <AppText variant="labelLarge" weight="semiBold" color={Colors.neutral[900]} style={styles.listHeading}>
                  Contribution History
                </AppText>

                {donations.map((item) => {
                  const normalizedStatus = (item.status || 'completed').toLowerCase();
                  const isSuccess = normalizedStatus === 'completed' || normalizedStatus === 'success';
                  const isPending = normalizedStatus === 'pending';
                  const statusBg = isSuccess ? '#E8F5E9' : isPending ? '#FFF8E1' : '#FFEBEE';
                  const statusColor = isSuccess ? '#2E7D32' : isPending ? '#F57F17' : '#C62828';

                  const dateFormatted = item.created_at ? formatDate(item.created_at) : 'N/A';
                  const timeFormatted = item.created_at ? formatTime12Hour(item.created_at) : '';

                  return (
                    <View key={item.id} style={styles.card}>
                      {/* Top Row: Ref & Status */}
                      <View style={styles.cardHeader}>
                        <View style={styles.refWrapper}>
                          <ShieldCheck size={16} color={Colors.primary[500]} style={{ marginRight: 6 }} />
                          <AppText variant="bodyMedium" weight="bold" color={Colors.neutral[900]}>
                            {item.reference_number || `#DON-${item.id}`}
                          </AppText>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                          <AppText variant="caption" weight="semiBold" style={{ color: statusColor }}>
                            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Completed'}
                          </AppText>
                        </View>
                      </View>

                      {/* Middle Row: Amount & Date */}
                      <View style={styles.cardBody}>
                        <View style={styles.amountCol}>
                          <AppText variant="caption" color={Colors.neutral[500]}>
                            Amount
                          </AppText>
                          <AppText variant="h4" weight="bold" color={Colors.neutral[900]} style={{ marginTop: 2 }}>
                            ${Number(item.amount || 0).toFixed(2)}
                          </AppText>
                        </View>

                        <View style={styles.dateCol}>
                          <View style={styles.dateRow}>
                            <Calendar size={13} color={Colors.neutral[400]} style={{ marginRight: 4 }} />
                            <AppText variant="caption" color={Colors.neutral[600]}>
                              {dateFormatted} {timeFormatted ? `· ${timeFormatted}` : ''}
                            </AppText>
                          </View>
                          {item.message ? (
                            <AppText variant="caption" color={Colors.neutral[500]} numberOfLines={1} style={{ marginTop: 4 }}>
                              {item.message}
                            </AppText>
                          ) : null}
                        </View>
                      </View>

                      {/* Optional Invoice action if available */}
                      {(item.invoice_url || isSuccess) && (
                        <View style={styles.cardFooter}>
                          <TouchableOpacity
                            style={styles.invoiceBtn}
                            onPress={() => handleDownloadInvoice(item)}
                            disabled={downloadingId === item.id}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            {downloadingId === item.id ? (
                              <ActivityIndicator size="small" color={Colors.primary[600]} style={{ marginRight: 6 }} />
                            ) : (
                              <Download size={14} color={Colors.primary[600]} style={{ marginRight: 6 }} />
                            )}
                            <AppText variant="caption" weight="semiBold" color={Colors.primary[600]}>
                              {downloadingId === item.id ? 'Downloading...' : 'Download Invoice'}
                            </AppText>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

        {/* Floating "+ Contribute Now" Button */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('OrgDonationScreen')}
        >
          <Plus color={Colors.neutral[0]} size={20} strokeWidth={2.5} />
          <AppText
            variant="buttonMedium"
            weight="semiBold"
            color={Colors.neutral[0]}
            style={{ marginLeft: 6 }}
          >
            Contribute Now
          </AppText>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(90),
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(18),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.neutral[200],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
    paddingHorizontal: horizontalScale(24),
  },
  emptyIconCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  emptyTitle: {
    marginBottom: verticalScale(6),
  },
  emptySubtitle: {
    lineHeight: fontScale(20),
    maxWidth: 280,
  },
  listContainer: {
    marginTop: verticalScale(4),
  },
  listHeading: {
    marginBottom: verticalScale(12),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(14),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  refWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(6),
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(12),
  },
  amountCol: {
    flex: 1,
  },
  dateCol: {
    alignItems: 'flex-end',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooter: {
    marginTop: verticalScale(12),
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(2),
  },
  fab: {
    position: 'absolute',
    bottom: verticalScale(24),
    right: horizontalScale(20),
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(18),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(28),
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});

