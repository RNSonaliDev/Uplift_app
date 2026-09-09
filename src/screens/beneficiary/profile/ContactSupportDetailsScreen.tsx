import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { horizontalScale, verticalScale, moderateScale } from '../../../utils/responsive';
import { supportApi, SupportRequest } from '../../../api/support';
import { getFullImageUrl } from '../../../api/client';
import { ChevronLeft, Clock, MessageSquare } from 'lucide-react-native';

export default function ContactSupportDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const [details, setDetails] = useState<SupportRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    try {
      const data = await supportApi.getSupportRequestDetails(id);
      setDetails(data);
    } catch (error) {
      console.log('Failed to fetch request details', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [fetchDetails])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={Colors.neutral[900]} size={28} />
          </TouchableOpacity>
          <AppText variant="h5" style={styles.headerTitle}>Support Request</AppText>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!details) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={Colors.neutral[900]} size={28} />
          </TouchableOpacity>
          <AppText variant="h5" style={styles.headerTitle}>Support Request</AppText>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.centerContainer}>
          <AppText variant="bodyMedium" color={Colors.neutral[500]}>Request not found</AppText>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(details.created_at).toLocaleString();
  let statusColor = Colors.neutral[500];
  if (details.status === 'open' || details.status === 'pending') statusColor = Colors.primary[500];
  if (details.status === 'resolved' || details.status === 'closed') statusColor = Colors.success;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Request Details</AppText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MessageSquare color={Colors.primary[500]} size={24} />
            </View>
            <View style={styles.titleContainer}>
              {details.reference_number && (
                <AppText variant="labelMedium" style={styles.referenceNumber}>
                  Ref: {details.reference_number}
                </AppText>
              )}
              <AppText variant="h6" style={styles.subjectText}>{details.subject}</AppText>
            </View>
          </View>
          
          <View style={styles.metaRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <AppText variant="caption" style={[styles.statusText, { color: statusColor }]}>
                {details.status.toUpperCase()}
              </AppText>
            </View>
            <View style={styles.dateRow}>
              <Clock color={Colors.neutral[400]} size={14} />
              <AppText variant="caption" style={styles.dateText}>{date}</AppText>
            </View>
          </View>

          <View style={styles.divider} />
          
          <AppText variant="labelMedium" style={styles.messageLabel}>Message</AppText>
          <AppText variant="bodyMedium" style={styles.messageText}>
            {details.message}
          </AppText>
          
          {details.attachment?.url && (
            <View style={styles.attachmentContainer}>
              <AppText variant="labelMedium" style={styles.messageLabel}>Attachment</AppText>
              <Image 
                source={{ uri: getFullImageUrl(details.attachment.url) || undefined }} 
                style={styles.attachmentImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backBtn: {
    padding: moderateScale(4),
  },
  headerTitle: {
    color: Colors.neutral[900],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: moderateScale(16),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
  },
  iconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  titleContainer: {
    flex: 1,
  },
  referenceNumber: {
    color: Colors.neutral[500],
    marginBottom: verticalScale(4),
  },
  subjectText: {
    color: Colors.neutral[900],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  statusText: {
    fontWeight: '700',
    fontSize: moderateScale(12),
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: Colors.neutral[500],
    marginLeft: horizontalScale(6),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginBottom: verticalScale(20),
  },
  messageLabel: {
    color: Colors.neutral[900],
    marginBottom: verticalScale(8),
  },
  messageText: {
    color: Colors.neutral[700],
    lineHeight: 24,
  },
  attachmentContainer: {
    marginTop: verticalScale(24),
  },
  attachmentImage: {
    width: '100%',
    height: verticalScale(200),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.neutral[100],
  },
});
