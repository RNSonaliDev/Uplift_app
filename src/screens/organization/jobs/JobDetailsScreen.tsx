import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, Linking } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { FileText, Link2, Briefcase, Tag, ChevronLeft, Building, DollarSign, Clock, Edit2, Info } from 'lucide-react-native';
import { api } from '../../../api/client';
import Toast from 'react-native-toast-message';
import { formatStatus, getStatusColors } from '../../../utils/statusUtils';

export const JobDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [job, setJob] = useState<any>(route.params?.job || null);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchJob = useCallback(async () => {
    if (!job?.id) return;
    try {
      setLoading(true);
      const data = await api.get(`/job_posts/${job.id}`);
      setJob(data);
    } catch (error) {
      console.error('Failed to fetch job details', error);
    } finally {
      setLoading(false);
    }
  }, [job?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchJob();
    }, [fetchJob])
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

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await api.post(`/job_posts/${job.id}/publish`);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Job published successfully!' });
      fetchJob();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'Failed to publish job.' });
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
          <AppText variant="bodyMedium" color={statusStyle.text} style={{flex: 1, textAlign: 'right', marginLeft: 16}}>
            {formatStatus(job.status)}
          </AppText>
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

      </ScrollView>
      {job.status === 'draft' ? (
        <View style={styles.footer}>
          <Button title="Publish Job" onPress={handlePublish} loading={publishing} size="lg" fullWidth />
        </View>
      ) : job.status !== 'closed' ? (
        <View style={styles.footer}>
          <Button title="Close Job" onPress={handleClose} loading={closing} size="lg" fullWidth style={{ backgroundColor: Colors.error }} />
        </View>
      ) : null}
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: Colors.primary[500], borderBottomWidth: 1, borderBottomColor: Colors.primary[500], position: 'relative' },
  headerAbsoluteCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
  iconButton: { padding: 4 },
  content: { padding: 16 },
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
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: Colors.neutral[200] }
});
