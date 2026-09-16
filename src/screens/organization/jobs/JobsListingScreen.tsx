import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Briefcase, Link2 } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { api } from '../../../api/client';
import { formatStatus, getStatusColors } from '../../../utils/statusUtils';

export const JobsListingScreen = () => {
  const navigation = useNavigation<any>();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/job_posts?scope=organization');
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('active');
      fetchJobs();
    }, [fetchJobs])
  );

  const renderJobCard = (job: any) => {
    const statusStyle = getStatusColors(job.status);
    return (
      <TouchableOpacity
        key={job.id}
        style={styles.card}
        onPress={() => navigation.navigate('JobDetails', { job })}
        activeOpacity={0.7}
      >
        <View style={styles.cardRow}>
          <View style={styles.cardIconContainer}>
            <Briefcase color={Colors.primary[600]} size={20} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <AppText variant="labelLarge" color={Colors.neutral[900]} numberOfLines={1} style={{flex: 1}}>
                {job.title}
              </AppText>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.text }]}>
                <AppText variant="labelSmall" color={statusStyle.text}>
                  {formatStatus(job.status)}
                </AppText>
              </View>
            </View>

            {(job.department || job.job_type) && (
              <View style={styles.badgeRow}>
                {job.department && (
                  <View style={styles.categoryBadge}>
                    <AppText variant="labelSmall" color={Colors.primary[700]}>
                      {typeof job.department === 'object' && job.department !== null ? job.department.title : job.department}
                    </AppText>
                  </View>
                )}
                {job.job_type && (
                  <View style={styles.subCategoryBadge}>
                    <AppText variant="labelSmall" color={Colors.neutral[600]}>
                      {job.job_type}
                    </AppText>
                  </View>
                )}
              </View>
            )}

            {job.company_url ? (
              <View style={styles.urlRow}>
                <Link2 color={Colors.neutral[400]} size={14} />
                <AppText variant="bodySmall" color={Colors.neutral[500]} style={{marginLeft: 6, flex: 1}} numberOfLines={1}>
                  {job.company_url}
                </AppText>
              </View>
            ) : null}

            {job.description ? (
              <AppText variant="bodySmall" color={Colors.neutral[500]} numberOfLines={2} style={{marginTop: 6, lineHeight: 18}}>
                {job.description}
              </AppText>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: 'center'}}>Jobs</AppText>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <AppText variant="labelMedium" color={activeTab === 'active' ? Colors.primary[600] : Colors.neutral[500]}>
            Active
          </AppText>
          {activeTab === 'active' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'closed' && styles.activeTab]}
          onPress={() => setActiveTab('closed')}
        >
          <AppText variant="labelMedium" color={activeTab === 'closed' ? Colors.primary[600] : Colors.neutral[500]}>
            Closed
          </AppText>
          {activeTab === 'closed' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchJobs} />}
      >
        {jobs.filter(job => activeTab === 'active' ? job.status !== 'closed' : job.status === 'closed').length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Briefcase color={Colors.neutral[300]} size={48} />
            <AppText variant="bodyMedium" color={Colors.neutral[500]} style={{marginTop: 16}}>
              No jobs found.
            </AppText>
            <AppText variant="bodySmall" color={Colors.neutral[400]} style={{marginTop: 4}}>
              Tap + to create your first job post.
            </AppText>
          </View>
        ) : (
          jobs.filter(job => activeTab === 'active' ? job.status !== 'closed' : job.status === 'closed').map(job => renderJobCard(job))
        )}
      </ScrollView>
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateJob')}
        activeOpacity={0.8}
      >
        <Plus color="#FFF" size={24} />
      </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.primary[500], backgroundColor: Colors.primary[500] },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTab: {
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary[600],
  },
  content: { padding: 16 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  subCategoryBadge: {
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary[500],
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
