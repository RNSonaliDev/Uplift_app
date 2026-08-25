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
import {ChevronLeft, ClipboardList, Calendar, Clock, MapPin} from 'lucide-react-native';
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
      navigation.navigate('RequestSubmitted', { referenceNumber: response?.reference_number });
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

  const renderInlineRow = (icon: React.ReactNode, label: string, value: string) => (
    <View style={styles.inlineRow}>
      <View style={styles.rowLeft}>
        {icon}
        <AppText variant="labelMedium" style={styles.inlineLabel}>{label}</AppText>
      </View>
      <AppText variant="labelMedium" color={Colors.neutral[500]} style={{flex: 1, textAlign: 'right', marginLeft: 16}} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );

  const renderColumnRow = (icon: React.ReactNode, label: string, value: string) => (
    <View style={styles.columnRow}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.columnContent}>
        <AppText variant="labelMedium" style={styles.columnLabel}>{label}</AppText>
        <AppText variant="bodyMedium" color={Colors.neutral[500]}>{value}</AppText>
      </View>
    </View>
  );

  const renderNotesRow = (label: string, value: string) => (
    <View style={styles.notesRow}>
      <AppText variant="labelMedium" style={styles.notesLabel}>{label}</AppText>
      <AppText variant="bodyMedium" color={Colors.neutral[500]}>{value}</AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Review Your Request</AppText>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="bodyMedium" color={Colors.neutral[500]} style={styles.subtitle}>
          Please review all details before submitting.
        </AppText>

        <View style={styles.card}>
          {renderInlineRow(
            <ClipboardList color={Colors.neutral[700]} size={20} />, 
            'Help Type', 
            categoryTitle || 'N/A'
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
            'Notes',
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
    backgroundColor: Colors.neutral[50],
  },
  iconButton: {
    padding: moderateScale(4),
  },
  headerTitle: {
    color: Colors.neutral[900],
  },
  content: {
    padding: horizontalScale(24),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(40),
  },
  subtitle: {
    marginBottom: verticalScale(24),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    overflow: 'hidden',
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineLabel: {
    marginLeft: horizontalScale(12),
    color: Colors.neutral[900],
  },
  columnRow: {
    flexDirection: 'row',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  iconContainer: {
    marginRight: horizontalScale(12),
    marginTop: verticalScale(2),
  },
  columnContent: {
    flex: 1,
  },
  columnLabel: {
    color: Colors.neutral[900],
    marginBottom: verticalScale(4),
  },
  notesRow: {
    padding: moderateScale(16),
  },
  notesLabel: {
    color: Colors.neutral[900],
    marginBottom: verticalScale(4),
  },
  footer: {
    padding: moderateScale(24),
    backgroundColor: Colors.neutral[50],
  },
});
