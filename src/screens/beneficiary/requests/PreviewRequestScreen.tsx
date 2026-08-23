import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {Button} from '../../../components/Button';
import {ChevronLeft, Edit2} from 'lucide-react-native';
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
          hours_required: parseInt(formData.hours_required, 10),
          meeting_location: formData.meeting_location,
          latitude: formData.latitude ? parseFloat(formData.latitude) : 0.90,
          longitude: formData.longitude ? parseFloat(formData.longitude) : 0.99,
        },
      };

      await api.post('/help_requests', payload);
      Alert.alert('Success', 'Your request has been created.', [
        {
          text: 'OK', 
          onPress: () => {
            navigation.navigate('MyRequests');
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label: string, value: string) => (
    <View style={styles.fieldContainer}>
      <AppText variant="labelMedium" color={Colors.neutral[600]} style={styles.fieldLabel}>
        {label}
      </AppText>
      <AppText variant="bodyLarge" color={Colors.neutral[900]}>
        {value}
      </AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Preview Request</AppText>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Edit2 color={Colors.primary[500]} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="bodyMedium" color={Colors.neutral[500]} style={styles.subtitle}>
          Review your request details before submitting.
        </AppText>

        <View style={styles.card}>
          {renderField('Title', formData?.title)}
          {renderField('Category', categoryTitle || 'N/A')}
          {renderField('Description', formData?.description)}
          {renderField('Preferred Date', formatDate(formData?.preferred_date))}
          {renderField('Hours Required', formData?.hours_required)}
          {renderField('Meeting Location', formData?.meeting_location)}
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
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  iconButton: {
    padding: moderateScale(4),
  },
  headerTitle: {
    color: Colors.neutral[900],
  },
  content: {
    padding: horizontalScale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(40),
  },
  subtitle: {
    marginBottom: verticalScale(24),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  fieldContainer: {
    marginBottom: verticalScale(20),
  },
  fieldLabel: {
    marginBottom: verticalScale(4),
  },
  footer: {
    padding: moderateScale(24),
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
});
