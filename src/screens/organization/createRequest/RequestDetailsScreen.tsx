import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckSquare, Square } from 'lucide-react-native';
import DatePicker from 'react-native-date-picker';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';

export const RequestDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  
  const { categoryId, categoryTitle } = route.params || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ title: '', description: '', time: '' });
  const [helpType, setHelpType] = useState<'single' | 'multiple'>('single');
  const [isMultipleDates, setIsMultipleDates] = useState(false);
  
  const [startDate, setStartDate] = useState(new Date());
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);

  const [startTime, setStartTime] = useState(new Date());
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);

  const [endDate, setEndDate] = useState(new Date());
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  const [endTime, setEndTime] = useState(new Date());
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleContinue = () => {
    let hasError = false;
    const newErrors = { title: '', description: '', time: '' };

    if (!title.trim()) {
      newErrors.title = 'Please enter a request title';
      hasError = true;
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe your request';
      hasError = true;
    }

    const isSingleDate = 
      (helpType === 'single' && !isMultipleDates) || 
      (helpType === 'single' && isMultipleDates && startDate.toDateString() === endDate.toDateString()) ||
      (helpType === 'multiple' && startDate.toDateString() === endDate.toDateString());

    if (isSingleDate) {
      if (startTime.getHours() === endTime.getHours() && startTime.getMinutes() === endTime.getMinutes()) {
        newErrors.time = 'Start and End time must be different';
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    navigation.navigate('LocationVolunteers', {
      categoryId,
      categoryTitle,
      title,
      description,
      helpType,
      startDate: formatDate(startDate),
      startTime: formatTime(startTime),
      endDate: formatDate(endDate),
      endTime: formatTime(endTime),
      startDateISO: startDate.toISOString().split('T')[0],
      startTimeISO: startTime.toTimeString().substring(0, 5),
      endDateISO: endDate.toISOString().split('T')[0],
      endTimeISO: endTime.toTimeString().substring(0, 5),
    });
  };

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
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex1} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: Colors.neutral[100], color: Colors.neutral[500] }
              ]}
              value={categoryTitle}
              editable={false}
            />
          </View>

          {/* Request Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Request Title</Text>
            <TextInput
              style={[styles.input, errors.title ? styles.inputError : null]}
              placeholder="e.g. Grocery Assistance"
              placeholderTextColor={Colors.neutral[400]}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              maxLength={20}
            />
            {!!errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
              placeholder="Describe your request..."
              placeholderTextColor={Colors.neutral[400]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
            />
            <View style={styles.descriptionFooter}>
              {!!errors.description ? (
                <Text style={[styles.errorText, { marginTop: 0 }]}>{errors.description}</Text>
              ) : (
                <View />
              )}
              <Text style={[styles.charCount, { marginTop: 0 }]}>{description.length}/200</Text>
            </View>
          </View>

          {/* Help Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Help Type</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  helpType === 'single' && styles.radioButtonActive,
                ]}
                onPress={() => setHelpType('single')}
              >
                <View style={[styles.radioCircle, helpType === 'single' && styles.radioCircleActive]} />
                <Text style={[styles.radioText, helpType === 'single' && styles.radioTextActive]}>Single</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  helpType === 'multiple' && styles.radioButtonActive,
                ]}
                onPress={() => setHelpType('multiple')}
              >
                <View style={[styles.radioCircle, helpType === 'multiple' && styles.radioCircleActive]} />
                <Text style={[styles.radioText, helpType === 'multiple' && styles.radioTextActive]}>Multiple</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Do you need one or multiple volunteers?</Text>
          </View>

          {/* Dates and Times */}
          {helpType === 'single' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity style={styles.dateInput} onPress={() => setIsStartDatePickerOpen(true)}>
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                  <CalendarIcon color={Colors.neutral[500]} size={20} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setIsMultipleDates(!isMultipleDates)}
              >
                {isMultipleDates ? (
                  <CheckSquare color={Colors.primary[600]} size={20} />
                ) : (
                  <Square color={Colors.neutral[400]} size={20} />
                )}
                <Text style={styles.checkboxText}>Request for multiple dates</Text>
              </TouchableOpacity>

              {isMultipleDates && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>End Date</Text>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setIsEndDatePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                    <CalendarIcon color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8, marginBottom: errors.time ? 8 : 24 }]}>
                  <Text style={styles.label}>Start Time</Text>
                  <TouchableOpacity style={[styles.dateInput, errors.time ? styles.inputError : null]} onPress={() => setIsStartTimePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatTime(startTime)}</Text>
                    <Clock color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8, marginBottom: errors.time ? 8 : 24 }]}>
                  <Text style={styles.label}>End Time</Text>
                  <TouchableOpacity style={[styles.dateInput, errors.time ? styles.inputError : null]} onPress={() => setIsEndTimePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatTime(endTime)}</Text>
                    <Clock color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
              {!!errors.time && <Text style={[styles.errorText, { marginBottom: 24, marginTop: 0 }]}>{errors.time}</Text>}
            </>
          ) : (
            <>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Start Date</Text>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setIsStartDatePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                    <CalendarIcon color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>End Date</Text>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setIsEndDatePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                    <CalendarIcon color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8, marginBottom: errors.time ? 8 : 24 }]}>
                  <Text style={styles.label}>Start Time</Text>
                  <TouchableOpacity style={[styles.dateInput, errors.time ? styles.inputError : null]} onPress={() => setIsStartTimePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatTime(startTime)}</Text>
                    <Clock color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8, marginBottom: errors.time ? 8 : 24 }]}>
                  <Text style={styles.label}>End Time</Text>
                  <TouchableOpacity style={[styles.dateInput, errors.time ? styles.inputError : null]} onPress={() => setIsEndTimePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatTime(endTime)}</Text>
                    <Clock color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
              {!!errors.time && <Text style={[styles.errorText, { marginBottom: 24, marginTop: 0 }]}>{errors.time}</Text>}
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      <DatePicker
        modal
        open={isStartDatePickerOpen}
        date={startDate}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => {
          setIsStartDatePickerOpen(false);
          setStartDate(date);
        }}
        onCancel={() => {
          setIsStartDatePickerOpen(false);
        }}
      />
      <DatePicker
        modal
        open={isStartTimePickerOpen}
        date={startTime}
        mode="time"
        onConfirm={(time) => {
          setIsStartTimePickerOpen(false);
          setStartTime(time);
          if (errors.time) setErrors(prev => ({ ...prev, time: '' }));
        }}
        onCancel={() => {
          setIsStartTimePickerOpen(false);
        }}
      />
      <DatePicker
        modal
        open={isEndDatePickerOpen}
        date={endDate}
        mode="date"
        minimumDate={startDate}
        onConfirm={(date) => {
          setIsEndDatePickerOpen(false);
          setEndDate(date);
        }}
        onCancel={() => {
          setIsEndDatePickerOpen(false);
        }}
      />
      <DatePicker
        modal
        open={isEndTimePickerOpen}
        date={endTime}
        mode="time"
        onConfirm={(time) => {
          setIsEndTimePickerOpen(false);
          setEndTime(time);
          if (errors.time) setErrors(prev => ({ ...prev, time: '' }));
        }}
        onCancel={() => {
          setIsEndTimePickerOpen(false);
        }}
      />

      {/* Footer Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    backgroundColor: Colors.neutral[50],
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  descriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.neutral[500],
    textAlign: 'right',
    marginTop: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    backgroundColor: Colors.neutral[50],
  },
  radioButtonActive: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    marginRight: 8,
  },
  radioCircleActive: {
    borderColor: Colors.primary[500],
    borderWidth: 6,
  },
  radioText: {
    ...Typography.labelMedium,
    color: Colors.neutral[700],
  },
  radioTextActive: {
    color: Colors.primary[600],
  },
  helperText: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.neutral[50],
  },
  dateText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: -8,
  },
  checkboxText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[700],
    marginLeft: 8,
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
