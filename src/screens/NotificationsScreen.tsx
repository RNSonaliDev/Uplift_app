import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Typography, FontFamily } from '../theme/typography';
import { AppText } from '../components/AppText';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../utils/responsive';
import { notificationsApi, AppNotification } from '../api/notifications';
import { authApi } from '../api/auth';
import Toast from 'react-native-toast-message';
import {
  ChevronLeft,
  Bell,
  CheckCircle,
  Clock
} from 'lucide-react-native';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      const role = profile?.default_role || 'beneficiary';
      const data = await notificationsApi.getNotifications(role);
      let notifs = [];
      if (Array.isArray(data)) {
        notifs = data;
      } else if (data && typeof data === 'object' && Array.isArray((data as any).notifications)) {
        notifs = (data as any).notifications;
      }
      setNotifications(notifs);
    } catch (error) {
      console.log('Failed to fetch notifications', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load notifications',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    try {
      await notificationsApi.markAsRead(id);
      await fetchNotifications();
    } catch (error) {
      console.log('Failed to mark as read', error);
      // Revert if error
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: false } : n)
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    const previous = [...notifications];
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await notificationsApi.markAllAsRead();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'All notifications marked as read',
      });
    } catch (error) {
      console.log('Failed to mark all as read', error);
      setNotifications(previous);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to mark all as read',
      });
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const isUnread = item.is_read === false || (item.is_read === undefined && !(item as any).read);
    const date = new Date(item.created_at);
    
    // Very simple relative time formatting
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    let timeText = '';
    if (isNaN(date.getTime())) {
      timeText = 'Recently';
    } else if (diffHours < 1) {
      timeText = 'Just now';
    } else if (diffHours < 24) {
      timeText = `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      timeText = `${diffDays}d ago`;
    }

    return (
      <TouchableOpacity
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        onPress={() => isUnread && handleMarkAsRead(item.id)}
        activeOpacity={isUnread ? 0.7 : 1}
        disabled={!isUnread}
      >
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            {isUnread && <View style={styles.dotIndicator} />}
            <AppText variant="bodyMedium" style={[styles.title, isUnread && styles.unreadTitle]}>
              {item.title}
            </AppText>
          </View>
          <AppText variant="bodyMedium" style={[styles.message, isUnread ? styles.unreadMessage : styles.readMessage]}>
            {item.message || (item as any).body || (item as any).content}
          </AppText>
          <View style={styles.footerRow}>
            <Clock color={isUnread ? Colors.primary[400] : Colors.neutral[400]} size={14} />
            <AppText variant="caption" style={styles.timeText}>
              {timeText}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const hasUnread = notifications.some(n => n.is_read === false || (n.is_read === undefined && !(n as any).read));

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: 'center'}}>Notifications</AppText>
        <View style={{ width: 28 }} />
      </View>

      {hasUnread && (
        <View style={styles.subHeaderRow}>
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllTextBtn}>
            <AppText variant="bodySmall" color={Colors.primary[600]} weight="semiBold" style={{ fontSize: fontScale(13) }}>
              Mark all as read
            </AppText>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary[500]]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Bell color={Colors.neutral[300]} size={48} />
              </View>
              <AppText variant="h6" style={styles.emptyTitle}>No Notifications</AppText>
              <AppText variant="bodyMedium" style={styles.emptyMessage}>
                You're all caught up! Check back later for new updates.
              </AppText>
            </View>
          }
        />
      )}
    </SafeAreaView>
    </>
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
    backgroundColor: Colors.primary[500],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backBtn: {
    padding: moderateScale(4),
  },
  headerTitle: {
    color: Colors.neutral[0],
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(2),
  },
  markAllTextBtn: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(4),
  },
  listContainer: {
    flexGrow: 1,
    padding: moderateScale(16),
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    alignItems: 'flex-start',
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#ECE7FE', // Darker purple tint for unread
  },
  dotIndicator: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: Colors.primary[500],
    marginRight: horizontalScale(8),
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  title: {
    color: Colors.neutral[800],
    flex: 1,
    fontFamily: FontFamily.medium,
  },

  unreadTitle: {
    color: Colors.neutral[900],
    // fontWeight: '700',
    fontFamily: FontFamily.medium,
  },
  message: {
    marginBottom: verticalScale(8),
    lineHeight: 20,
  },
  unreadMessage: {
    color: Colors.neutral[800],
  },
  readMessage: {
    color: Colors.neutral[800],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: Colors.neutral[400],
    marginLeft: horizontalScale(4),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  emptyTitle: {
    color: Colors.neutral[800],
    marginBottom: verticalScale(8),
  },
  emptyMessage: {
    color: Colors.neutral[500],
    textAlign: 'center',
    paddingHorizontal: horizontalScale(40),
  },
});
