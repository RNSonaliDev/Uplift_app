import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { FileText, Link2, Briefcase, Tag, ChevronLeft } from 'lucide-react-native';
import { api } from '../../../api/client';
import Toast from 'react-native-toast-message';

export const JobPreviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const job = route.params?.job;
  const categoryName = route.params?.categoryName;
  const subCategoryName = route.params?.subCategoryName;
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await api.post(`/job_posts/${job.id}/publish`);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Job published successfully!' });
      navigation.navigate('JobsListing');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'Failed to publish job.' });
    } finally {
      setPublishing(false);
    }
  };

  if (!job) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerAbsoluteCenter}>
          <AppText variant="h5" color={Colors.neutral[900]}>Preview Job</AppText>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color={Colors.neutral[900]} size={28} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{width: 40}} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.detailColumnItem}>
          <View style={styles.detailLabelRow}>
            <Tag color={Colors.neutral[600]} size={20} />
            <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Category</AppText>
          </View>
          <View style={[styles.badgeContainer, { marginLeft: 28, marginTop: 8, marginBottom: 0 }]}>
            {(categoryName || job.job_category?.title) && (
              <View style={styles.badge}>
                <AppText variant="labelSmall" color={Colors.primary[700]}>{categoryName || job.job_category?.title}</AppText>
              </View>
            )}
          </View>
        </View>

        {(subCategoryName || job.job_sub_category?.title) && (
          <View style={styles.detailColumnItem}>
            <View style={styles.detailLabelRow}>
              <Tag color={Colors.neutral[600]} size={20} />
              <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Sub Category</AppText>
            </View>
            <View style={[styles.badgeContainer, { marginLeft: 28, marginTop: 8, marginBottom: 0 }]}>
              <View style={styles.badgeOutline}>
                <AppText variant="labelSmall" color={Colors.neutral[600]}>{subCategoryName || job.job_sub_category?.title}</AppText>
              </View>
            </View>
          </View>
        )}

        <View style={styles.detailColumnItem}>
          <View style={styles.detailLabelRow}>
            <Briefcase color={Colors.neutral[600]} size={20} />
            <AppText variant="bodyMedium" color={Colors.neutral[900]} style={{marginLeft: 8, fontFamily: FontFamily.medium}}>Job Title</AppText>
          </View>
          <AppText variant="bodyMedium" color={Colors.neutral[600]} style={{marginLeft: 28, marginTop: 4, lineHeight: 22}}>
            {job.title}
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
      <View style={styles.footer}>
        <Button title="Publish Job" onPress={handlePublish} loading={publishing} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: Colors.neutral[200], position: 'relative' },
  headerAbsoluteCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
  iconButton: { padding: 4 },
  content: { padding: 16 },
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
