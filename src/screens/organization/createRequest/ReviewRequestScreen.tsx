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
} from 'lucide-react-native';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';

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

  const SummaryItem = ({ icon: Icon, title, value, color = Colors.primary[600], bgColor = Colors.primary[50] }: any) => (
    <View style={styles.summaryItem}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Icon color={color} size={20} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      {Platform.OS === 'ios' && <SafeAreaView />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.instructions}>
          Please review your request details before submitting.
        </Text>

        <View style={styles.card}>
          <SummaryItem 
            icon={ShoppingBag} 
            title="Category" 
            value={params.categoryTitle || 'Grocery Assistance'} 
          />
          <View style={styles.divider} />
          
          <SummaryItem 
            icon={FileText} 
            title="Request Title" 
            value={params.title || 'Grocery Assistance for Community Center'} 
          />
          <View style={styles.divider} />
          
          <SummaryItem 
            icon={AlignLeft} 
            title="Description" 
            value={params.description || 'We need help with groceries for our upcoming weekend community meal program.'} 
          />
          <View style={styles.divider} />
          
          <SummaryItem 
            icon={Users} 
            title="Help Type" 
            value={params.helpType === 'multiple' ? 'Multiple Volunteers' : 'Single Volunteer'} 
          />
          <View style={styles.divider} />
          
          <SummaryItem 
            icon={Calendar} 
            title="Dates & Times" 
            value={params.endDate === '' 
              ? `${params.startDate}\n${params.startTime} to ${params.endTime}`
              : `${params.startDate} at ${params.startTime}\nto ${params.endDate} at ${params.endTime}`
            } 
          />
          <View style={styles.divider} />
          
          <SummaryItem 
            icon={MapPin} 
            title="Location" 
            value={params.address} 
          />
          <View style={styles.divider} />
          
          <SummaryItem 
            icon={Users} 
            title="Volunteers Needed" 
            value={`${params.volunteersNeeded || 2} Volunteers`} 
          />
          <View style={styles.divider} />
          
          <SummaryItem 
            icon={AlertTriangle} 
            title="Urgency" 
            value={params.urgency || 'High'} 
            color={params.urgency === 'Urgent' ? Colors.error : params.urgency === 'High' ? Colors.warning : Colors.primary[600]}
            bgColor={params.urgency === 'Urgent' ? '#FEF2F2' : params.urgency === 'High' ? '#FFFBEB' : Colors.primary[50]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50], // Slightly off-white for the review screen bg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
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
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginBottom: 4,
  },
  itemValue: {
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
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
    backgroundColor: Colors.primary[600],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.buttonLarge,
    color: Colors.neutral[0],
  },
});
