import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, Linking } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { FileText, Link2, Briefcase, Tag, ChevronLeft } from 'lucide-react-native';
import { api } from '../../../api/client';
import Toast from 'react-native-toast-message';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  published: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  draft: { bg: Colors.primary[50], text: Colors.primary[600], border: Colors.primary[100] },
  closed: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
};

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

  const getStatusStyle = (status: string) => STATUS_COLORS[status] || STATUS_COLORS.draft;

  if (!job) return null;
  const statusStyle = getStatusStyle(job.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerAbsoluteCenter}>
          <AppText variant="h5" color={Colors.neutral[900]}>Job Details</AppText>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color={Colors.neutral[900]} size={28} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{width: 50, alignItems: 'flex-end'}}>
          {job.status === 'draft' && (
            <TouchableOpacity onPress={() => navigation.navigate('CreateJob', { job })}>
              <AppText variant="bodyMedium" color={Colors.primary[600]}>Edit</AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={fetchJob} />}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <View style={styles.detailLabelRow}>
              <Briefcase color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Job Title</AppText>
            </View>
            <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{marginLeft: 28, marginTop: 4, lineHeight: 22}}>
              {job.title}
            </AppText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border, marginBottom: 0 }]}>
            <AppText variant="labelSmall" color={statusStyle.text} style={{ textTransform: 'capitalize'}}>{job.status}</AppText>
          </View>
        </View>

        <View style={styles.detailColumnItem}>
          <View style={styles.detailLabelRow}>
            <Tag color={Colors.neutral[600]} size={20} />
            <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Category</AppText>
          </View>
          <View style={[styles.badgeContainer, { marginLeft: 28, marginTop: 8, marginBottom: 0 }]}>
            {(job.job_category?.title) && (
              <View style={styles.badge}>
                <AppText variant="labelSmall" color={Colors.primary[700]}>{job.job_category?.title}</AppText>
              </View>
            )}
          </View>
        </View>

        {(job.job_sub_category?.title) && (
          <View style={styles.detailColumnItem}>
            <View style={styles.detailLabelRow}>
              <Tag color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Sub Category</AppText>
            </View>
            <View style={[styles.badgeContainer, { marginLeft: 28, marginTop: 8, marginBottom: 0 }]}>
              <View style={styles.badgeOutline}>
                <AppText variant="labelSmall" color={Colors.neutral[600]}>{job.job_sub_category?.title}</AppText>
              </View>
            </View>
          </View>
        )}



        <View style={styles.detailColumnItem}>
          <View style={styles.detailLabelRow}>
            <FileText color={Colors.neutral[600]} size={20} />
            <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Description</AppText>
          </View>
          <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{marginLeft: 28, marginTop: 4, lineHeight: 22}}>
            {job.description}
          </AppText>
        </View>
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

      </ScrollView>
      {job.status === 'draft' ? (
        <View style={styles.footer}>
          <Button title="Publish Job" onPress={handlePublish} loading={publishing} />
        </View>
      ) : job.status !== 'closed' ? (
        <View style={styles.footer}>
          <Button title="Close Job" onPress={handleClose} loading={closing} style={{ backgroundColor: Colors.error }} />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: Colors.neutral[200], position: 'relative' },
  headerAbsoluteCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
  iconButton: { padding: 4 },
  content: { padding: 16 },
  statusBadge: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 24, borderWidth: 1 },
  badgeContainer: { flexDirection: 'row', marginBottom: 24, flexWrap: 'wrap', gap: 8 },
  badge: { backgroundColor: Colors.primary[50], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: Colors.primary[100] },
  badgeOutline: { backgroundColor: Colors.neutral[50], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: Colors.neutral[200] },
  detailColumnItem: {
    marginBottom: 20,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: Colors.neutral[200] }
});
