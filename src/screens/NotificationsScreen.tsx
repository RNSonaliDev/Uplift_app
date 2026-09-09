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
import { Typography } from '../theme/typography';
import { AppText } from '../components/AppText';
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';
import { notificationsApi, AppNotification } from '../api/notifications';
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
      const data = await notificationsApi.getNotifications();
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
    const isUnread = !item.is_read;
    const date = new Date(item.created_at);
    
    // Very simple relative time formatting
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    let timeText = '';
    if (diffHours < 1) {
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
        disabled={!isUnread}
      >
        <View style={styles.iconContainer}>
          <Bell color={isUnread ? Colors.primary[500] : Colors.neutral[400]} size={24} />
          {isUnread && <View style={styles.unreadDotBadge} />}
        </View>
        <View style={styles.contentContainer}>
          <AppText variant="labelLarge" style={[styles.title, !isUnread && styles.readText]}>
            {item.title}
          </AppText>
          <AppText variant="bodyMedium" style={[styles.message, !isUnread && styles.readText]}>
            {item.message}
          </AppText>
          <View style={styles.footerRow}>
            <Clock color={Colors.neutral[400]} size={14} />
            <AppText variant="caption" style={styles.timeText}>
              {timeText}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Notifications</AppText>
        
        {notifications.some(n => !n.is_read) ? (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllBtn}>
            <CheckCircle color={Colors.primary[500]} size={22} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

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
  markAllBtn: {
    padding: moderateScale(4),
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
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  unreadCard: {
    borderColor: Colors.primary[200],
    backgroundColor: '#F5F3FF', // Very light purple tint
  },
  iconContainer: {
    marginRight: horizontalScale(16),
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: verticalScale(2),
  },
  unreadDotBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.neutral[0],
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: Colors.neutral[900],
    marginBottom: verticalScale(4),
  },
  message: {
    color: Colors.neutral[700],
    marginBottom: verticalScale(8),
    lineHeight: 20,
  },
  readText: {
    color: Colors.neutral[500],
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
    paddingTop: verticalScale(80),
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
