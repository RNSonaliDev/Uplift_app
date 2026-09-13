import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {Button} from '../../../components/Button';
import {ChevronLeft, ClipboardList, Calendar, Clock, MapPin, FileText, AlignLeft} from 'lucide-react-native';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {api} from '../../../api/client';
import {formatDate} from '../../../utils/dateFormatter';

export default function PreviewRequestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const {formData, categoryTitle} = route.params || {};
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        help_request: {
          title: formData.title,
          category_id: parseInt(formData.category_id, 10),
          description: formData.description,
          preferred_date: formData.preferred_date,
          preferred_start_time: formData.preferred_start_time,
          preferred_end_time: formData.preferred_end_time,
          hours_required: parseInt(formData.hours_required, 10),
          meeting_location: formData.meeting_location,
          latitude: formData.latitude ? parseFloat(formData.latitude) : 0.90,
          longitude: formData.longitude ? parseFloat(formData.longitude) : 0.99,
        },
      };

      const response: any = await api.post('/help_requests', payload);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'RequestSubmitted',
            params: { referenceNumber: response?.reference_number },
          }
        ],
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to create request'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInlineRow = (icon: any, label: string, value: string) => (
    <View style={styles.inlineRow}>
      <View style={styles.rowLeft}>
        {icon}
        <AppText variant="bodyMedium" color={Colors.neutral[900]} style={styles.inlineLabel}>{label}</AppText>
      </View>
      {label === 'Category' ? (
        <View style={{ flex: 1, alignItems: 'flex-end', paddingLeft: 16 }}>
          <View style={[styles.categoryBadge, { paddingHorizontal: horizontalScale(12), paddingVertical: verticalScale(6), borderRadius: 16 }]}>
            <AppText variant="labelMedium" color={Colors.primary[600]} style={{ textAlign: 'center' }}>
              {value}
            </AppText>
          </View>
        </View>
      ) : (
        <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.inlineValue}>{value}</AppText>
      )}
    </View>
  );

  const renderColumnRow = (icon: any, label: string, value: string) => (
    <View style={styles.columnRow}>
      <View style={styles.detailLabelRow}>
        {icon}
        <AppText variant="bodyMedium" color={Colors.neutral[900]} style={styles.columnLabel}>{label}</AppText>
      </View>
      <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.columnValue}>{value}</AppText>
    </View>
  );

  const renderNotesRow = (label: string, value: string) => (
    <View style={styles.notesRow}>
      <View style={styles.detailLabelRow}>
        <AlignLeft color={Colors.neutral[700]} size={20} />
        <AppText variant="bodyMedium" color={Colors.neutral[900]} style={styles.columnLabel}>{label}</AppText>
      </View>
      <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.columnValue}>{value}</AppText>
    </View>
  );

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: 'center'}}>Preview Request</AppText>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="bodyMedium" color={Colors.neutral[500]} style={styles.subtitle}>
          Please review all details before submitting.
        </AppText>

        <View style={styles.detailsSection}>
          {renderInlineRow(
            <ClipboardList color={Colors.neutral[700]} size={20} />, 
            'Category', 
            categoryTitle || 'N/A'
          )}
          {renderInlineRow(
            <FileText color={Colors.neutral[700]} size={20} />, 
            'Title', 
            formData?.title || 'N/A'
          )}
          {renderInlineRow(
            <Calendar color={Colors.neutral[700]} size={20} />, 
            'Date', 
            formatDate(formData?.preferred_date)
          )}
          {renderInlineRow(
            <Clock color={Colors.neutral[700]} size={20} />, 
            'Time', 
            `${formData?.preferred_start_time || ''} - ${formData?.preferred_end_time || ''}`
          )}
          {renderColumnRow(
            <MapPin color={Colors.neutral[700]} size={20} />, 
            'Location', 
            formData?.meeting_location || 'N/A'
          )}
          {renderNotesRow(
            'Description',
            formData?.description || 'N/A'
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Submit Request"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />
      </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
  },
  iconButton: {
    padding: moderateScale(4),
  },
  headerTitle: {
    color: Colors.neutral[0],
  },
  content: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(40),
  },
  subtitle: {
    marginBottom: verticalScale(24),
  },
  detailsSection: {
    flex: 1,
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineLabel: {
    marginLeft: horizontalScale(8),
    fontFamily: 'Inter-Medium',
  },
  inlineValue: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  columnRow: {
    flexDirection: 'column',
    marginBottom: verticalScale(20),
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  columnLabel: {
    marginLeft: horizontalScale(8),
    fontFamily: 'Inter-Medium',
  },
  columnValue: {
    marginLeft: horizontalScale(28),
    lineHeight: 22,
  },
  notesRow: {
    flexDirection: 'column',
    marginBottom: verticalScale(20),
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
  },
  footer: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(32),
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
});
