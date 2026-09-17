import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image, RefreshControl, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api, getFullImageUrl } from '../../../api/client';
import { authApi, UserProfileResponse } from '../../../api/auth';
import { formatDate, formatTime12Hour } from '../../../utils/dateFormatter';
import { formatStatus, getStatusColors } from '../../../utils/statusUtils';
import { CategoryIcon } from '../../../components/CategoryIcon';
import { Menu, Bell, Plus, Lock, Calendar, Pill, ChevronRight, MapPin, Users, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { horizontalScale, verticalScale, moderateScale } from '../../../utils/responsive';

// Mock Data





export const OrganizationDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [requests, setRequests] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [stats, setStats] = useState<any>({
    help_requests_total: 0,
    help_requests_completed: 0,
    volunteers_helped: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const [requestsData, statsData, profData, notifData] = await Promise.all([
        api.get<any[]>('/help_requests?scope=organization'),
        api.get<any>('/dashboard/stats?role=organization'),
        authApi.getProfile(),
        api.get<any>('/notifications')
      ]);
      setRequests(requestsData);
      setStats(statsData);
      setProfile(profData);
      setUnreadNotificationsCount(notifData?.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.primary[500]} barStyle="light-content" />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary[500]]} />
        }
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View style={{justifyContent: 'center'}}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.nameText}>{profile?.profiles?.organization?.organization_name || profile?.active_profile?.organization_name || profile?.first_name || 'Organization'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              {unreadNotificationsCount > 0 && <View style={styles.notificationBadge} />}
              <Bell color={Colors.neutral[0]} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Impact Card */}
        <View style={styles.impactCardWrapper}>
          <View style={styles.impactCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.help_requests_total || 0}</Text>
                <Text style={styles.statLabel}>Requests</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.help_requests_completed || 0}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.volunteers_helped || 0}</Text>
                <Text style={styles.statLabel}>Volunteers{'\n'}Helped</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity 
            style={styles.raiseRequestButton}
            onPress={() => navigation.navigate('SelectCategory')}
          >
            <Plus color={Colors.neutral[0]} size={20} style={{ marginRight: 8 }} />
            <Text style={styles.raiseRequestButtonText}>Create an opportunity</Text>
          </TouchableOpacity>
        </View>

        {/* My Requests Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Requests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrganizationTabs', { screen: 'RequestsTab' })}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {/* Request List */}
          <View style={styles.requestList}>
          {loading ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: Colors.neutral[500] }}>Loading...</Text>
          ) : requests.length > 0 ? (
            requests.map((request) => {
              const statusDisplay = formatStatus(request.status);
              const statusStyle = getStatusColors(request.status);
              const vCount = request.volunteers_needed || 1;
              return (
                <TouchableOpacity 
                  key={request.id.toString()} 
                  style={styles.card}
                  onPress={() => navigation.navigate('OrgRequestDetails', { request })}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      {request.category?.logo_url ? (
                        <Image 
                          source={{ uri: getFullImageUrl(request.category.logo_url) as string }}
                          style={{ width: 24, height: 24 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <CategoryIcon title={request.category?.title} color={Colors.primary[500]} size={24} />
                      )}
                    </View>
                    <View style={styles.cardTitleContainer}>
                      <Text style={[styles.cardTitle, { marginBottom: 4 }]}>{request.category?.title || 'Help Request'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, alignSelf: 'flex-start' }]}>
                      <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                        {statusDisplay}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 4 }}>
                    {request.title ? (
                      <Text style={{ ...Typography.bodyMedium, color: Colors.neutral[800], marginBottom: 4, fontFamily: FontFamily.medium }}>
                        {request.title}
                      </Text>
                    ) : null}
                    <Text style={{ ...Typography.caption, color: Colors.neutral[600], marginBottom: 12 }}>
                      #{request.reference_number || request.id}
                    </Text>
                    <View style={styles.row}>
                      <Calendar color={Colors.neutral[500]} size={14} />
                      <Text style={styles.cardSubtitle}>
                        {formatDate(request.preferred_date || request.preferred_start_date)}
                      </Text>
                    </View>
                    {(request.preferred_start_time || request.preferred_end_time || request.hours_required) ? (
                      <View style={[styles.row, { marginTop: 4 }]}>
                        <Clock color={Colors.neutral[500]} size={14} />
                        <Text style={styles.cardSubtitle}>
                          {request.preferred_start_time ? `${formatTime12Hour(request.preferred_start_time)} - ${formatTime12Hour(request.preferred_end_time)}` : ''}
                          {request.preferred_start_time && request.hours_required ? ' ' : ''}
                          {request.hours_required ? `(${request.hours_required} hours)` : ''}
                        </Text>
                      </View>
                    ) : null}
                    <View style={[styles.row, { alignItems: 'flex-start', marginTop: 4 }]}>
                      <View style={{ marginTop: 2 }}>
                        <MapPin color={Colors.neutral[500]} size={14} />
                      </View>
                      <Text style={[styles.cardSubtitle, { flex: 1, marginLeft: 6 }]} numberOfLines={1}>
                        {request.address || request.location?.address || request.meeting_location || 'Location TBD'}
                      </Text>
                    </View>
                    <View style={[styles.row, { marginTop: 4 }]}>
                      <Users color={Colors.neutral[500]} size={14} />
                      <Text style={styles.cardSubtitle}>
                        {vCount} {vCount === 1 ? 'Volunteer' : 'Volunteers'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: Colors.neutral[500] }}>No requests found.</Text>
          )}
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[500],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(60),
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    zIndex: 1,
  },
  welcomeText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[100],
    marginBottom: 4,
  },
  nameText: {
    ...Typography.h3,
    color: Colors.neutral[0],
  },
  impactCardWrapper: {
    paddingHorizontal: horizontalScale(24),
    marginTop: -verticalScale(40),
  },
  impactCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(20),
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: verticalScale(24),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h3,
    color: Colors.primary[500],
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral[200],
  },
  sectionContainer: {
    paddingHorizontal: horizontalScale(24),
  },
  raiseRequestButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 32,
  },
  raiseRequestButtonText: {
    ...Typography.buttonLarge,
    color: Colors.neutral[0],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
  },
  viewAllText: {
    ...Typography.labelMedium,
    color: Colors.primary[500],
  },
  requestList: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16) || 16,
    padding: moderateScale(20) || 20,
    marginBottom: verticalScale(24) || 24,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: verticalScale(2) || 2 },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8) || 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: verticalScale(20) || 20,
  },
  iconContainer: {
    width: moderateScale(48) || 48,
    height: moderateScale(48) || 48,
    borderRadius: moderateScale(24) || 24,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16) || 16,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.labelLarge,
    fontFamily: FontFamily.semiBold || 'Inter-SemiBold',
    color: Colors.neutral[900],
    marginBottom: verticalScale(4) || 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4) || 4,
  },
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.neutral[800],
    marginLeft: horizontalScale(4) || 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: horizontalScale(10) || 12,
    paddingVertical: verticalScale(4) || 4,
    borderRadius: moderateScale(12) || 12,
  },
  statusBadgeText: {
    ...Typography.labelSmall,
    fontFamily: FontFamily.semiBold || 'Inter-SemiBold',
  },
});
