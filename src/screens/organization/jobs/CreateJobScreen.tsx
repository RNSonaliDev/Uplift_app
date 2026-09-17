import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, TouchableWithoutFeedback, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { api } from '../../../api/client';
import Toast from 'react-native-toast-message';


const JOB_TYPES = [
  { id: 'Full-Time', title: 'Full-Time' },
  { id: 'Part-Time', title: 'Part-Time' },
  { id: 'Internship', title: 'Internship' },
  { id: 'Temporary', title: 'Temporary' },
];

const WORK_SETTINGS = [
  { id: 'Onsite', title: 'Onsite' },
  { id: 'Remote', title: 'Remote' },
  { id: 'Hybrid', title: 'Hybrid' },
];

const COMPENSATIONS = [
  { id: 'Paid - Hourly', title: 'Paid - Hourly' },
  { id: 'Paid - Salary', title: 'Paid - Salary' },
  { id: 'Unpaid', title: 'Unpaid' },
];

export const CreateJobScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editJob = route.params?.job;
  const isEditing = !!editJob;

  const [title, setTitle] = useState(editJob?.title || '');
  const [description, setDescription] = useState(editJob?.description || '');
  const [department, setDepartment] = useState<string | number | null>(
    editJob?.department ? (typeof editJob.department === 'object' ? editJob.department.id : editJob.department) : null
  );
  const [jobType, setJobType] = useState<string | null>(editJob?.job_type || null);
  const [workSetting, setWorkSetting] = useState<string | null>(editJob?.work_setting || null);
  const [compensation, setCompensation] = useState<string | null>(editJob?.compensation || null);
  const [companyUrl, setCompanyUrl] = useState(editJob?.company_url || '');
  const [jobUrl, setJobUrl] = useState(editJob?.job_url || '');
  
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  
  const [loading, setLoading] = useState(false);

  const [activeModal, setActiveModal] = useState<'department' | 'jobType' | 'workSetting' | 'compensation' | null>(null);

  const handleBack = () => {
    Alert.alert(
      'Save as Draft?',
      'Would you like to save your changes as a draft before leaving?',
      [
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
        {
          text: 'Save as Draft',
          onPress: async () => {
            const payload = {
              job_post: {
                title,
                description,
                department_id: department,
                job_type: jobType,
                work_setting: workSetting,
                compensation,
                company_url: companyUrl,
                job_url: jobUrl,
              }
            };

            try {
              setLoading(true);
              if (isEditing) {
                await api.patch(`/job_posts/${editJob.id}`, payload);
              } else {
                await api.post('/job_posts', payload);
              }
              Toast.show({ type: 'success', text1: 'Success', text2: 'Saved successfully!' });
              navigation.goBack();
            } catch (error: any) {
              Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'Failed to save.' });
            } finally {
              setLoading(false);
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await api.get<any[]>('/job_categories');
        setDepartments(data);
      } catch (error) {
        console.error('Failed to fetch departments', error);
      }
    };
    fetchDepartments();
  }, []);

  const handlePreview = async () => {
    const newFieldErrors: { [key: string]: string } = {};
    
    if (!title.trim()) newFieldErrors.title = 'Job Title is required';
    if (!description.trim()) newFieldErrors.description = 'Description is required';
    if (!department) newFieldErrors.department = 'Department is required';
    if (!jobType) newFieldErrors.jobType = 'Job Type is required';
    if (!workSetting) newFieldErrors.workSetting = 'Work Setting is required';
    if (!compensation) newFieldErrors.compensation = 'Compensation is required';
    if (!companyUrl.trim()) newFieldErrors.companyUrl = 'Company URL is required';

    setFieldErrors(newFieldErrors);

    if (Object.keys(newFieldErrors).length > 0) {
      return;
    }

    const payload = {
      job_post: {
        title,
        description,
        department_id: department,
        job_type: jobType,
        work_setting: workSetting,
        compensation,
        company_url: companyUrl,
        job_url: jobUrl,
      }
    };

    try {
      setLoading(true);
      let data;
      if (isEditing) {
        data = await api.patch<any>(`/job_posts/${editJob.id}`, payload);
      } else {
        data = await api.post<any>('/job_posts', payload);
      }
      navigation.navigate('JobPreview', { 
        job: data
      });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.data?.errors?.[0] || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (label: string, field: string, value: string | null, options: any[]) => {
    const isModalOpen = activeModal === field;
    const error = fieldErrors[field];
    return (
      <View key={field}>
        <Text style={[styles.label, { marginTop: 16 }]}>{label} <Text style={{ color: Colors.error }}>*</Text></Text>
        <TouchableOpacity 
          style={[
            styles.dropdownInput, 
            error ? styles.inputError : null,
            isModalOpen ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 } : null
          ]} 
          onPress={() => setActiveModal(isModalOpen ? null : (field as any))}
        >
          <Text style={[styles.dropdownText, !value && { color: Colors.neutral[400] }]}>
            {options.find(o => o.id === value)?.title || (label === 'Compensation' ? 'Select Compensation' : `Select a ${label}`)}
          </Text>
          <ChevronDown color={Colors.neutral[400]} size={20} />
        </TouchableOpacity>
        {isModalOpen && (
          <ScrollView style={styles.inlineDropdownContent} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
            {options.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.modalOption}
                onPress={() => {
                  if (field === 'department') setDepartment(item.id);
                  if (field === 'jobType') setJobType(item.id);
                  if (field === 'workSetting') setWorkSetting(item.id);
                  if (field === 'compensation') setCompensation(item.id);
                  setActiveModal(null);
                  if (error) setFieldErrors(prev => ({ ...prev, [field]: '' }));
                }}
              >
                <Text style={[styles.modalOptionText, value === item.id && { color: Colors.primary[600], fontFamily: FontFamily.semiBold }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerAbsoluteCenter}>
          <AppText variant="h5" color={Colors.neutral[0]}>{isEditing ? 'Edit Job' : 'Create Job'}</AppText>
        </View>
        <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
          <ChevronLeft color={Colors.neutral[0]} size={28} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{width: 40}} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback 
          onPress={() => setActiveModal(null)}
          accessible={false}
        >
          <View style={{ flex: 1 }}>
            
            <Text style={[styles.label, { marginTop: 8 }]}>Job Title <Text style={{ color: Colors.error }}>*</Text></Text>
            <TextInput 
              style={[styles.input, fieldErrors.title ? styles.inputError : null]} 
              value={title} 
              onChangeText={(text) => {
                setTitle(text);
                if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: '' }));
              }} 
              placeholder="e.g. Summer Intern" 
              placeholderTextColor={Colors.neutral[400]}
            />
            {fieldErrors.title ? <Text style={styles.fieldErrorText}>{fieldErrors.title}</Text> : null}
            
            <Text style={styles.label}>Description <Text style={{ color: Colors.error }}>*</Text></Text>
            <TextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top' }, fieldErrors.description ? styles.inputError : null]} 
              value={description} 
              onChangeText={(text) => {
                setDescription(text);
                if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: '' }));
              }} 
              placeholder="Job description..." 
              placeholderTextColor={Colors.neutral[400]}
              multiline 
            />
            {fieldErrors.description ? <Text style={styles.fieldErrorText}>{fieldErrors.description}</Text> : null}
            
            {renderDropdown('Department', 'department', department, departments)}
            {renderDropdown('Job Type', 'jobType', jobType, JOB_TYPES)}
            {renderDropdown('Work Setting', 'workSetting', workSetting, WORK_SETTINGS)}
            {renderDropdown('Compensation', 'compensation', compensation, COMPENSATIONS)}

            <Text style={[styles.label, { marginTop: 16 }]}>Company URL <Text style={{ color: Colors.error }}>*</Text></Text>
            <TextInput 
              style={[styles.input, fieldErrors.companyUrl ? styles.inputError : null]} 
              value={companyUrl} 
              onChangeText={(text) => {
                setCompanyUrl(text);
                if (fieldErrors.companyUrl) setFieldErrors(prev => ({ ...prev, companyUrl: '' }));
              }} 
              placeholder="https://..." 
              placeholderTextColor={Colors.neutral[400]}
              keyboardType="url" 
              autoCapitalize="none" 
            />
            {fieldErrors.companyUrl ? <Text style={styles.fieldErrorText}>{fieldErrors.companyUrl}</Text> : null}

            <Text style={styles.label}>Job URL – Apply here (optional)</Text>
            <TextInput 
              style={styles.input} 
              value={jobUrl} 
              onChangeText={setJobUrl} 
              placeholder="https://..." 
              placeholderTextColor={Colors.neutral[400]}
              keyboardType="url" 
              autoCapitalize="none" 
            />

          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <View style={styles.footer}>
        <Button 
          title="Preview Job" 
          onPress={handlePreview} 
          loading={loading}
          size="lg"
          fullWidth
        />
      </View>
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
  label: { ...Typography.labelMedium, marginBottom: 8, color: Colors.neutral[700] },
  input: { ...Typography.bodyMedium, color: Colors.neutral[900], backgroundColor: '#FFF', borderWidth: 1, borderColor: Colors.neutral[200], borderRadius: 8, padding: 12, marginBottom: 16 },
  inputError: {
    borderColor: Colors.error,
    marginBottom: 4,
  },
  fieldErrorText: {
    color: Colors.error,
    ...Typography.bodySmall,
    marginBottom: 16,
    marginTop: 4,
  },
  dropdownInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
  },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: Colors.neutral[200] },
  inlineDropdownContent: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.neutral[200],
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 16,
    maxHeight: 250,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  modalOptionText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[700],
  }
});
