import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Pressable, Platform, Keyboard, KeyboardAvoidingView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { ChevronDown, ChevronLeft, Check } from 'lucide-react-native';
import { api } from '../../../api/client';
import { useFormScrollToError } from '../../../utils/useFormScrollToError';

const DEFAULT_DEPARTMENTS = [
  { id: 1, title: 'Administration' },
  { id: 2, title: 'Creative & Design' },
  { id: 3, title: 'Customer Service' },
  { id: 4, title: 'Education & Tutoring' },
];

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

// URL format matching URI::DEFAULT_PARSER.make_regexp(%w[http https])
const URL_FORMAT = /^https?:\/\/(?:localhost|(?:\d{1,3}\.){3}\d{1,3}|(?:[a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,})(?::\d+)?(?:\/[^\s]*)?$/i;

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

  const [companyName, setCompanyName] = useState(editJob?.company_name || '');
  const [companyUrl, setCompanyUrl] = useState(editJob?.company_url || '');
  const [jobUrl, setJobUrl] = useState(editJob?.job_url || '');

  const companyNameRef = useRef<TextInput>(null);
  const titleInputRef = useRef<TextInput>(null);
  const descInputRef = useRef<TextInput>(null);
  const companyUrlInputRef = useRef<TextInput>(null);
  const jobUrlInputRef = useRef<TextInput>(null);
  
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  
  const [loading] = useState(false);

  const [activeModal, setActiveModal] = useState<'department' | 'jobType' | 'workSetting' | 'compensation' | null>(null);

  const { scrollViewRef, registerInput, registerField, scrollToFirstError } = useFormScrollToError();

  const handleBack = () => {
    navigation.goBack();
  };

  const [departments, setDepartments] = useState<any[]>(DEFAULT_DEPARTMENTS);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await api.get<any>('/job_categories');
        const list = Array.isArray(data) ? data : (data?.job_categories || data?.categories || []);
        if (list && list.length > 0) {
          setDepartments(list);
        }
      } catch (error) {
        console.error('Failed to fetch departments', error);
      }
    };
    fetchDepartments();
  }, []);

  const handlePreview = () => {
    const newFieldErrors: { [key: string]: string } = {};
    
    if (!companyName.trim()) newFieldErrors.companyName = 'Company Name is required';
    if (!title.trim()) newFieldErrors.title = 'Job Title is required';
    if (!description.trim()) newFieldErrors.description = 'Description is required';
    if (!department) newFieldErrors.department = 'Department is required';
    if (!jobType) newFieldErrors.jobType = 'Job Type is required';
    if (!workSetting) newFieldErrors.workSetting = 'Work Setting is required';
    if (!compensation) newFieldErrors.compensation = 'Compensation is required';
    if (!companyUrl.trim()) {
      newFieldErrors.companyUrl = 'Company URL is required';
    } else if (!URL_FORMAT.test(companyUrl.trim())) {
      newFieldErrors.companyUrl = 'Please enter a valid URL (e.g. https://example.com)';
    }

    if (jobUrl.trim() && !URL_FORMAT.test(jobUrl.trim())) {
      newFieldErrors.jobUrl = 'Please enter a valid URL (e.g. https://example.com)';
    }

    setFieldErrors(newFieldErrors);

    if (Object.keys(newFieldErrors).length > 0) {
      // Find the first invalid field in visual order
      const fieldOrder = [
        'companyName',
        'title',
        'description',
        'department',
        'jobType',
        'workSetting',
        'compensation',
        'companyUrl',
        'jobUrl',
      ];
      scrollToFirstError(newFieldErrors, fieldOrder);
      return;
    }

    const selectedDeptObj = departments.find(d => 
      String(d.id) === String(department) || d.title === department
    );
    const departmentTitle = selectedDeptObj ? selectedDeptObj.title : (department || '');

    const trimmedCompanyName = companyName.trim();
    const trimmedCompanyUrl = companyUrl.trim();
    const trimmedJobUrl = jobUrl.trim();

    const payload = {
      job_post: {
        title: title.trim(),
        description: description.trim(),
        department_id: department,
        job_type: jobType,
        work_setting: workSetting,
        compensation: compensation,
        company_name: trimmedCompanyName,
        company_url: trimmedCompanyUrl,
        job_url: trimmedJobUrl,
      }
    };

    const jobPreviewObj = {
      id: editJob?.id,
      title: title.trim(),
      description: description.trim(),
      department: selectedDeptObj || departmentTitle,
      job_type: jobType,
      work_setting: workSetting,
      compensation: compensation,
      company_name: trimmedCompanyName,
      company_url: trimmedCompanyUrl,
      job_url: trimmedJobUrl,
    };

    navigation.navigate('JobPreview', { 
      job: jobPreviewObj,
      payload,
      isEditing,
      editJobId: editJob?.id,
    });
  };

  const renderDropdown = (
    label: string, 
    field: string, 
    value: string | number | null, 
    setValue: (val: any) => void, 
    options: any[]
  ) => {
    const isModalOpen = activeModal === field;
    const error = fieldErrors[field];
    const selectedItem = options.find(o => String(o.id) === String(value) || o.title === value);
    const displayText = selectedItem ? selectedItem.title : (label === 'Compensation' ? 'Select Compensation' : `Select a ${label}`);

    return (
      <View 
        key={field} 
        {...registerField(field)}
        style={{ position: 'relative', zIndex: isModalOpen ? 10 : 1 }}
      >
        <Text style={[styles.label, { marginTop: 16 }]}>{label} <Text style={{ color: Colors.error }}>*</Text></Text>
        <TouchableOpacity 
          style={[
            styles.dropdownInput, 
            error ? styles.inputError : null,
            isModalOpen ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 } : null,
            { zIndex: 2 }
          ]} 
          onPress={() => setActiveModal(isModalOpen ? null : (field as any))}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.dropdownText, 
              !selectedItem && { color: Colors.neutral[400] },
              !!selectedItem && { color: Colors.neutral[900], fontFamily: FontFamily.medium }
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayText}
          </Text>
          <ChevronDown color={isModalOpen ? Colors.primary[600] : Colors.neutral[400]} size={20} />
        </TouchableOpacity>
        {isModalOpen && (
          <View style={{ zIndex: 10 }}>
            <View style={styles.inlineDropdownContent}>
              <ScrollView 
                nestedScrollEnabled={true} 
                keyboardShouldPersistTaps="handled" 
                showsVerticalScrollIndicator={true}
                bounces={false}
                style={{ maxHeight: 220 }}
              >
                {options.map(item => {
                  const isSelected = String(item.id) === String(value) || item.title === value;
                  return (
                    <TouchableOpacity
                      key={String(item.id)}
                      style={[styles.modalOption, isSelected && { backgroundColor: Colors.primary[50] }]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setValue(item.id);
                        setActiveModal(null);
                        if (error) {
                          setFieldErrors(prev => ({ ...prev, [field]: '' }));
                        }
                      }}
                    >
                      <Text style={[styles.modalOptionText, isSelected && { color: Colors.primary[600], fontFamily: FontFamily.semiBold }]}>
                        {item.title}
                      </Text>
                      {isSelected && (
                        <Check color={Colors.primary[600]} size={18} strokeWidth={2.5} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
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
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
        extraHeight={30}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
      >
        <View style={{ flex: 1 }}>
            
            <View {...registerField('companyName')}>
              <Text style={[styles.label, { marginTop: 8, marginBottom: 0 }]}>Company Name <Text style={{ color: Colors.error }}>*</Text></Text>
              <TextInput 
                ref={(r) => {
                  companyNameRef.current = r;
                  registerInput('companyName')(r);
                }}
                style={[styles.input, fieldErrors.companyName ? styles.inputError : null, { marginTop: 6 }]} 
                value={companyName} 
                onChangeText={(text) => {
                  setCompanyName(text);
                  if (fieldErrors.companyName) setFieldErrors(prev => ({ ...prev, companyName: '' }));
                }} 
                placeholder="e.g. Acme Corp" 
                placeholderTextColor={Colors.neutral[400]}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => titleInputRef.current?.focus()}
              />
              {fieldErrors.companyName ? <Text style={styles.fieldErrorText}>{fieldErrors.companyName}</Text> : null}
            </View>

            <View {...registerField('title')}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: fieldErrors.companyName ? 0 : 4 }}>
                <Text style={[styles.label, { marginTop: 0, marginBottom: 0 }]}>Job Title <Text style={{ color: Colors.error }}>*</Text></Text>
                <Text style={styles.charCount}>{title.length}/20</Text>
              </View>
              <TextInput 
                ref={(r) => {
                  titleInputRef.current = r;
                  registerInput('title')(r);
                }}
                style={[styles.input, fieldErrors.title ? styles.inputError : null, { marginTop: 6 }]} 
                value={title} 
                maxLength={20}
                onChangeText={(text) => {
                  setTitle(text);
                  if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: '' }));
                }} 
                placeholder="e.g. Summer Intern" 
                placeholderTextColor={Colors.neutral[400]}
                returnKeyType="next"
                onSubmitEditing={() => descInputRef.current?.focus()}
              />
              {fieldErrors.title ? <Text style={styles.fieldErrorText}>{fieldErrors.title}</Text> : null}
            </View>
            
            <View {...registerField('description')}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: fieldErrors.title ? 0 : 4 }}>
                <Text style={[styles.label, { marginTop: 0, marginBottom: 0 }]}>Description <Text style={{ color: Colors.error }}>*</Text></Text>
                <Text style={styles.charCount}>{description.length}/200</Text>
              </View>
              <TextInput 
                ref={(r) => {
                  descInputRef.current = r;
                  registerInput('description')(r);
                }}
                style={[styles.input, { height: 100, textAlignVertical: 'top', marginTop: 6 }, fieldErrors.description ? styles.inputError : null]} 
                value={description} 
                maxLength={200}
                onChangeText={(text) => {
                  setDescription(text);
                  if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: '' }));
                }} 
                placeholder="Job description..." 
                placeholderTextColor={Colors.neutral[400]}
                multiline 
                returnKeyType="next"
                blurOnSubmit={true}
                onSubmitEditing={() => companyUrlInputRef.current?.focus()}
              />
              {fieldErrors.description ? <Text style={styles.fieldErrorText}>{fieldErrors.description}</Text> : null}
            </View>
            
            {renderDropdown('Department', 'department', department, setDepartment, departments)}
            {renderDropdown('Job Type', 'jobType', jobType, setJobType, JOB_TYPES)}
            {renderDropdown('Work Setting', 'workSetting', workSetting, setWorkSetting, WORK_SETTINGS)}
            {renderDropdown('Compensation', 'compensation', compensation, setCompensation, COMPENSATIONS)}

            <View {...registerField('companyUrl')}>
              <Text style={[styles.label, { marginTop: 16 }]}>Company URL <Text style={{ color: Colors.error }}>*</Text></Text>
              <TextInput 
                ref={(r) => {
                  companyUrlInputRef.current = r;
                  registerInput('companyUrl')(r);
                }}
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
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => jobUrlInputRef.current?.focus()}
              />
              {fieldErrors.companyUrl ? <Text style={styles.fieldErrorText}>{fieldErrors.companyUrl}</Text> : null}
            </View>

            <View {...registerField('jobUrl')}>
              <Text style={styles.label}>Job URL – Apply here (optional)</Text>
              <TextInput 
                ref={(r) => {
                  jobUrlInputRef.current = r;
                  registerInput('jobUrl')(r);
                }}
                style={[styles.input, fieldErrors.jobUrl ? styles.inputError : null]} 
                value={jobUrl} 
                onChangeText={(text) => {
                  setJobUrl(text);
                  if (fieldErrors.jobUrl) setFieldErrors(prev => ({ ...prev, jobUrl: '' }));
                }} 
                placeholder="https://..." 
                placeholderTextColor={Colors.neutral[400]}
                keyboardType="url" 
                autoCapitalize="none" 
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {fieldErrors.jobUrl ? <Text style={styles.fieldErrorText}>{fieldErrors.jobUrl}</Text> : null}
            </View>

          </View>
      </KeyboardAwareScrollView>
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
    flex: 1,
    marginRight: 8,
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
    zIndex: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOptionText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[700],
    flex: 1,
    marginRight: 12,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
});
