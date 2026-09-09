import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { horizontalScale, verticalScale, moderateScale } from '../../../utils/responsive';
import { supportApi, SupportRequest } from '../../../api/support';
import { ChevronLeft, MessageSquare, Clock, CheckCircle, Plus } from 'lucide-react-native';

export default function ContactSupportScreen() {
  const navigation = useNavigation<any>();

  // History State
  const [history, setHistory] = useState<SupportRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await supportApi.getSupportRequests();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Failed to fetch support history', error);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const renderHistoryItem = ({ item }: { item: SupportRequest }) => {
    const date = new Date(item.created_at).toLocaleDateString();
    
    let statusColor = Colors.neutral[500];
    if (item.status === 'open' || item.status === 'pending') statusColor = Colors.primary[500];
    if (item.status === 'resolved' || item.status === 'closed') statusColor = Colors.success;

    return (
      <View style={styles.historyCard}>
        <TouchableOpacity 
          style={styles.historyCardHeader} 
          onPress={() => navigation.navigate('ContactSupportDetails', { id: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.historyIcon}>
            <MessageSquare color={Colors.primary[500]} size={24} />
          </View>
          <View style={styles.historyContent}>
            {item.reference_number && (
              <AppText variant="labelMedium" style={styles.referenceNumber}>
                Ref: {item.reference_number}
              </AppText>
            )}
            <AppText variant="labelLarge" style={styles.historySubject} numberOfLines={1}>
              {item.subject}
            </AppText>
            <View style={styles.historyMeta}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <AppText variant="caption" style={[styles.statusText, { color: statusColor }]}>
                  {item.status.toUpperCase()}
                </AppText>
              </View>
              <View style={styles.dateRow}>
                <Clock color={Colors.neutral[400]} size={12} />
                <AppText variant="caption" style={styles.dateText}>{date}</AppText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Support Requests</AppText>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.historyContainer}>
        {loadingHistory ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <CheckCircle color={Colors.neutral[300]} size={48} />
                <AppText variant="h6" style={styles.emptyTitle}>No requests yet</AppText>
                <AppText variant="bodyMedium" style={styles.emptyText} center>
                  You haven't submitted any support requests.
                </AppText>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateSupportRequest')}
        activeOpacity={0.8}
      >
        <Plus color={Colors.neutral[0]} size={24} />
      </TouchableOpacity>
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
  historyContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: moderateScale(16),
    flexGrow: 1,
  },
  historyCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    overflow: 'hidden',
  },
  historyCardHeader: {
    flexDirection: 'row',
    padding: moderateScale(16),
    alignItems: 'flex-start',
  },
  historyIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  historyContent: {
    flex: 1,
  },
  referenceNumber: {
    color: Colors.neutral[500],
    marginBottom: verticalScale(2),
  },
  historySubject: {
    color: Colors.neutral[900],
    marginBottom: verticalScale(6),
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(8),
    marginRight: horizontalScale(12),
  },
  statusText: {
    fontWeight: '700',
    fontSize: moderateScale(10),
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: Colors.neutral[500],
    marginLeft: horizontalScale(4),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(80),
  },
  emptyTitle: {
    color: Colors.neutral[900],
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptyText: {
    color: Colors.neutral[500],
    paddingHorizontal: horizontalScale(40),
  },
  fab: {
    position: 'absolute',
    bottom: verticalScale(24),
    right: horizontalScale(24),
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
});
