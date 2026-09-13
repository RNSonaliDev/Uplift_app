import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { api } from '../../../api/client';
import {
  ArrowLeft,
  ShoppingBag,
  AlignLeft,
  Users,
  Calendar,
  MapPin,
  AlertTriangle,
  FileText,
  Clock,
} from 'lucide-react-native';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { horizontalScale, verticalScale } from '../../../utils/responsive';
import { AppText } from '../../../components';

export const ReviewRequestScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  
  const params = route.params || {};
  console.log("@@@paramsparamsparams===============", params)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const payload = {
        help_request: {
          category_id: params.categoryId || 1,
          title: params.title || 'Grocery pickup',
          request_type: 'organization',
          description: params.description || '',
          help_type: params.helpType || 'single',
          ...(params.helpType === 'multiple' ? {
            preferred_start_date: params.startDateISO || new Date().toISOString().split('T')[0],
            preferred_end_date: params.endDateISO || new Date().toISOString().split('T')[0],
          } : {
            preferred_date: params.startDateISO || new Date().toISOString().split('T')[0],
          }),
          preferred_start_time: params.startTimeISO || '09:00',
          preferred_end_time: params.endTimeISO || '11:00',
          address: params.address || '',
          meeting_location: params.address || '',
          latitude: params.latitude ? Number(params.latitude) : 34.07362,
          longitude: params.longitude ? Number(params.longitude) : -118.400356,
          volunteers_needed: params.volunteersNeeded || 1,
          urgency: params.urgency ? params.urgency.toLowerCase() : 'high'
        }
      };

      await api.post('/help_requests', payload);
      
      navigation.navigate('RequestCreated');
    } catch (error: any) {
      console.error('Error creating request:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to create request',
        text2: error?.data?.errors?.[0] || error.message || 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SummaryItem = ({ icon: Icon, title, value, type = 'horizontal' }: any) => {
    if (type === 'vertical') {
      return (
        <View style={styles.summaryItemVertical}>
          <View style={styles.summaryItemTitleRow}>
            {Icon && <Icon color={Colors.neutral[600]} size={20} />}
            <Text style={[styles.itemTitleDark, Icon ? { marginLeft: 8 } : null]}>{title}</Text>
          </View>
          <View style={Icon ? { paddingLeft: 28 } : null}>
            <Text style={styles.itemValueLight}>{value}</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.summaryItemHorizontal}>
        <View style={styles.summaryItemTitleRow}>
          {Icon && <Icon color={Colors.neutral[600]} size={20} />}
          <Text style={[styles.itemTitleDark, Icon ? { marginLeft: 8 } : null]}>{title}</Text>
        </View>
        {title === 'Category' ? (
          <View style={{ flex: 1, alignItems: 'flex-end', paddingLeft: 16 }}>
            <View style={[styles.categoryBadge, { paddingHorizontal: horizontalScale(12), paddingVertical: verticalScale(6), borderRadius: 16 }]}>
              <Text style={{ ...Typography.labelMedium, color: Colors.primary[600], textAlign: 'center' }}>
                {value}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.itemValueLightRight}>{value}</Text>
        )}
      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={Colors.neutral[0]} size={24} />
        </TouchableOpacity>
        <AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: 'center'}}>Preview Request</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.instructions}>
          Please review all details before submitting.
        </Text>

        <View style={styles.detailsSection}>
          <SummaryItem 
            icon={ShoppingBag} 
            title="Category" 
            value={params.categoryTitle || 'Grocery Assistance'} 
          />
          
          <SummaryItem 
            icon={FileText} 
            title="Title" 
            value={params.title || 'Grocery Assistance for Community Center'} 
          />
          
          <SummaryItem 
            icon={Calendar} 
            title="Date" 
            value={params.startDate !== params.endDate ? `${params.startDate} - ${params.endDate}` : params.startDate} 
          />
          
          <SummaryItem 
            icon={Clock} 
            title="Time" 
            value={`${params.startTime} - ${params.endTime}`} 
          />
          
          <SummaryItem 
            icon={Users} 
            title="Number of positions" 
            value={params.helpType === 'multiple' ? 'Multiple Volunteers' : 'Single Volunteer'} 
          />
          
          <SummaryItem 
            icon={Users} 
            title="Volunteers Needed" 
            value={`${params.volunteersNeeded || 2} Volunteers`} 
          />
          
          <SummaryItem 
            icon={AlertTriangle} 
            title="Urgency" 
            value={params.urgency || 'High'} 
          />

          <SummaryItem 
            icon={AlignLeft} 
            title="Description" 
            value={params.description || 'We need help with groceries for our upcoming weekend community meal program.'}
            type="vertical" 
          />

          <SummaryItem 
            icon={MapPin} 
            title="Location" 
            value={params.address}
            type="vertical" 
          />
        </View>

      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.neutral[0]} />
          ) : (
            <Text style={styles.primaryButtonText}>Submit Request</Text>
          )}
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[0],
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  instructions: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    marginBottom: 24,
  },
  detailsSection: {
    flex: 1,
  },
  summaryItemHorizontal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  summaryItemVertical: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginBottom: verticalScale(20),
  },
  summaryItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitleDark: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.medium,
    color: Colors.neutral[900],
  },
  itemValueLightRight: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  itemValueLight: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    marginTop: 4,
    lineHeight: 22,
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginVertical: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.buttonLarge,
    color: Colors.neutral[0],
  },
});
