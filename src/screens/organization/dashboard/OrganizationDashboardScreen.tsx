import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api, getFullImageUrl } from '../../../api/client';
import { authApi, UserProfileResponse } from '../../../api/auth';
import { formatDate } from '../../../utils/dateFormatter';
import { CategoryIcon } from '../../../components/CategoryIcon';
import { Menu, Bell, Plus, Lock, Calendar, Pill, ChevronRight, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { horizontalScale, verticalScale, moderateScale } from '../../../utils/responsive';

// Mock Data

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'confirmed' || s === 'completed' || s === 'accepted') return { text: '#16A34A', bg: '#DCFCE7' };
  if (s === 'pending' || s === 'in progress') return { text: '#D97706', bg: '#FEF3C7' };
  if (s === 'cancelled') return { text: Colors.error, bg: '#FEF2F2' };
  return { text: Colors.primary[600], bg: Colors.primary[50] };
};



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

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const [requestsData, statsData, profData] = await Promise.all([
        api.get<any[]>('/help_requests?scope=organization'),
        api.get<any>('/dashboard/stats?role=organization'),
        authApi.getProfile()
      ]);
      setRequests(requestsData);
      setStats(statsData);
      setProfile(profData);
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
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      {Platform.OS === 'ios' && <SafeAreaView />}
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary[600]]} />
        }
      >
        
        {/* Header */}
        <View style={styles.header}>
         <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{profile?.active_profile?.organization_name || profile?.first_name || 'Organization'}</Text>
        </View>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.notificationBadge} />
            <Bell color={Colors.neutral[900]} size={24} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        {/* <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{MOCK_ORG_NAME} 👋</Text>
        </View> */}

        {/* Impact Overview Card */}
        <View style={styles.impactCard}>
          <View style={styles.impactCardTop}>
            <Text style={styles.impactTitle}>Impact Overview</Text>
          </View>
          <View style={styles.impactCardBottom}>
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

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.raiseRequestButton}
          onPress={() => navigation.navigate('SelectCategory')}
        >
          <Plus color={Colors.neutral[0]} size={20} style={{ marginRight: 8 }} />
          <Text style={styles.raiseRequestButtonText}>Raise a Request</Text>
        </TouchableOpacity>

        {/* My Requests Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Requests</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RequestsTab')}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Request List */}
        <View style={styles.requestList}>
          {loading ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: Colors.neutral[500] }}>Loading...</Text>
          ) : requests.length > 0 ? (
            requests.map((request) => {
              const statusDisplay = request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Pending';
              const statusStyle = getStatusColor(statusDisplay);
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
                        <CategoryIcon title={request.category?.title} color={Colors.primary[600]} size={24} />
                      )}
                    </View>
                    <View style={styles.cardTitleContainer}>
                      <Text style={[styles.cardTitle, { marginBottom: 4 }]}>{request.category?.title || 'Help Request'}</Text>
                      <Text style={{ ...Typography.caption, color: Colors.neutral[600], marginBottom: 6 }}>
                        #{request.reference_number || request.id}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, alignSelf: 'flex-start' }]}>
                      <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                        {statusDisplay}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 4 }}>
                    <View style={styles.row}>
                      <Calendar color={Colors.neutral[500]} size={14} />
                      <Text style={styles.cardSubtitle}>
                        {formatDate(request.preferred_date || request.preferred_start_date)} • {vCount} {vCount === 1 ? 'Volunteer' : 'Volunteers'}
                      </Text>
                    </View>
                    <View style={[styles.row, { alignItems: 'flex-start', marginTop: 4 }]}>
                      <View style={{ marginTop: 2 }}>
                        <MapPin color={Colors.neutral[500]} size={14} />
                      </View>
                      <Text style={[styles.cardSubtitle, { flex: 1, marginLeft: 6 }]} numberOfLines={1}>
                        {request.address || request.location?.address || request.meeting_location || 'Location TBD'}
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
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
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
  greetingContainer: {
    marginBottom: 24,
  },
  welcomeText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  nameText: {
    ...Typography.h3,
    color: Colors.neutral[900],
  },
  impactCard: {
    borderRadius: 16,
    backgroundColor: Colors.neutral[0],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  impactCardTop: {
    backgroundColor: Colors.primary[600],
    padding: 20,
    paddingBottom: 24,
  },
  impactTitle: {
    ...Typography.labelLarge,
    color: Colors.neutral[0],
    fontFamily: FontFamily.semiBold,
  },
  impactCardBottom: {
    backgroundColor: Colors.neutral[0],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: -10, // Slight overlap effect if needed, but here just negative margin to bring it up
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.neutral[200],
  },
  raiseRequestButton: {
    backgroundColor: Colors.primary[600],
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
    color: Colors.primary[600],
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
    color: Colors.neutral[600],
    marginLeft: horizontalScale(4) || 4,
  },
  statusBadge: {
    paddingHorizontal: horizontalScale(10) || 12,
    paddingVertical: verticalScale(4) || 4,
    borderRadius: moderateScale(12) || 12,
  },
  statusBadgeText: {
    ...Typography.labelSmall,
    fontFamily: FontFamily.semiBold || 'Inter-SemiBold',
  },
});
