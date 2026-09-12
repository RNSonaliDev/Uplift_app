import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { ChevronDown, X, ChevronLeft } from 'lucide-react-native';
import { api } from '../../../api/client';
import Toast from 'react-native-toast-message';

export const CreateJobScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editJob = route.params?.job;
  const isEditing = !!editJob;

  const [title, setTitle] = useState(editJob?.title || '');
  const [description, setDescription] = useState(editJob?.description || '');
  const [companyUrl, setCompanyUrl] = useState(editJob?.company_url || '');
  
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(editJob?.job_category_id || editJob?.job_category?.id || null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(editJob?.job_sub_category_id || editJob?.job_sub_category?.id || null);
  
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get<any[]>('/job_categories');
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      } finally {
        setFetchingCats(false);
      }
    };
    fetchCategories();
  }, []);

  // When category changes, reset sub-category
  const handleCategorySelect = (id: number) => {
    setSelectedCategoryId(id);
    setSelectedSubCategoryId(null);
    setCategoryModalVisible(false);
    
    // Clear error for category if it exists
    if (fieldErrors.category) {
      setFieldErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedSubCategory = selectedCategory?.sub_categories?.find((s: any) => s.id === selectedSubCategoryId);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);

  const handlePreview = async () => {
    const newFieldErrors: { [key: string]: string } = {};
    if (!selectedCategoryId) {
      newFieldErrors.category = 'Category is required';
    } else if (selectedCategory && selectedCategory.sub_categories && selectedCategory.sub_categories.length > 0 && !selectedSubCategoryId) {
      newFieldErrors.subCategory = 'Sub Category is required';
    }
    
    if (!title.trim()) newFieldErrors.title = 'Job Title is required';
    if (!description.trim()) newFieldErrors.description = 'Description is required';
    if (!companyUrl.trim()) newFieldErrors.companyUrl = 'Company URL is required';

    setFieldErrors(newFieldErrors);

    if (Object.keys(newFieldErrors).length > 0) {
      return;
    }

    const payload = {
      job_post: {
        title,
        description,
        company_url: companyUrl,
        job_category_id: selectedCategoryId,
        job_sub_category_id: selectedSubCategoryId || null
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
        job: data,
        categoryName: selectedCategory?.title,
        subCategoryName: selectedSubCategory?.title
      });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error?.data?.errors[0]  });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerAbsoluteCenter}>
          <AppText variant="bodyLarge" color={Colors.neutral[900]}>{isEditing ? 'Edit Job' : 'Create Job'}</AppText>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color={Colors.neutral[900]} size={28} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{width: 40}} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback 
          onPress={() => {
            setCategoryModalVisible(false);
            setSubCategoryModalVisible(false);
          }}
          accessible={false}
        >
          <View style={{ flex: 1 }}>
        
        {/* Categories Section */}
        <Text style={[styles.label, { marginTop: 8 }]}>Category *</Text>
        {fetchingCats ? (
          <ActivityIndicator size="small" color={Colors.primary[500]} style={{alignSelf: 'flex-start', marginVertical: 8}} />
        ) : (
          <>
            <TouchableOpacity 
              style={[
                styles.dropdownInput, 
                fieldErrors.category ? styles.inputError : null,
                categoryModalVisible ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 } : null
              ]} 
              onPress={() => setCategoryModalVisible(!categoryModalVisible)}
            >
              <Text style={[styles.dropdownText, !selectedCategoryId && { color: Colors.neutral[300] }]}>
                {selectedCategoryId ? selectedCategory?.title : 'Select a Category'}
              </Text>
              <ChevronDown color={Colors.neutral[400]} size={20} />
            </TouchableOpacity>
            {categoryModalVisible && (
              <View style={styles.inlineDropdownContent}>
                {categories.map(item => (
                  <TouchableOpacity
                    key={item.id.toString()}
                    style={styles.modalOption}
                    onPress={() => {
                      handleCategorySelect(item.id);
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, selectedCategoryId === item.id && { color: Colors.primary[600], fontFamily: FontFamily.semiBold }]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {fieldErrors.category ? <Text style={styles.fieldErrorText}>{fieldErrors.category}</Text> : null}
          </>
        )}

        {/* Sub Categories Section */}
        {selectedCategory && selectedCategory.sub_categories && selectedCategory.sub_categories.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: 16 }]}>Sub Category *</Text>
            <TouchableOpacity 
              style={[
                styles.dropdownInput, 
                fieldErrors.subCategory ? styles.inputError : null,
                subCategoryModalVisible ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 } : null
              ]} 
              onPress={() => setSubCategoryModalVisible(!subCategoryModalVisible)}
            >
              <Text style={[styles.dropdownText, !selectedSubCategoryId && { color: Colors.neutral[300] }]}>
                {selectedSubCategoryId ? selectedSubCategory?.title : 'Select a Sub Category'}
              </Text>
              <ChevronDown color={Colors.neutral[400]} size={20} />
            </TouchableOpacity>
            {subCategoryModalVisible && (
              <View style={styles.inlineDropdownContent}>
                {selectedCategory.sub_categories.map((item: any) => (
                  <TouchableOpacity
                    key={item.id.toString()}
                    style={styles.modalOption}
                    onPress={() => {
                      setSelectedSubCategoryId(item.id);
                      setSubCategoryModalVisible(false);
                      if (fieldErrors.subCategory) {
                        setFieldErrors(prev => ({ ...prev, subCategory: '' }));
                      }
                    }}
                  >
                    <Text style={[styles.modalOptionText, selectedSubCategoryId === item.id && { color: Colors.primary[600], fontFamily: FontFamily.semiBold }]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {fieldErrors.subCategory ? <Text style={styles.fieldErrorText}>{fieldErrors.subCategory}</Text> : null}
          </>
        )}

        <Text style={[styles.label, { marginTop: 16 }]}>Job Title *</Text>
        <TextInput 
          style={[styles.input, fieldErrors.title ? styles.inputError : null]} 
          value={title} 
          onChangeText={(text) => {
            setTitle(text);
            if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: '' }));
          }} 
          placeholder="e.g. Summer Intern" 
        />
        {fieldErrors.title ? <Text style={styles.fieldErrorText}>{fieldErrors.title}</Text> : null}
        
        <Text style={styles.label}>Description *</Text>
        <TextInput 
          style={[styles.input, { height: 100, textAlignVertical: 'top' }, fieldErrors.description ? styles.inputError : null]} 
          value={description} 
          onChangeText={(text) => {
            setDescription(text);
            if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: '' }));
          }} 
          placeholder="Job description..." 
          multiline 
        />
        {fieldErrors.description ? <Text style={styles.fieldErrorText}>{fieldErrors.description}</Text> : null}
        
        <Text style={styles.label}>Company URL *</Text>
        <TextInput 
          style={[styles.input, fieldErrors.companyUrl ? styles.inputError : null]} 
          value={companyUrl} 
          onChangeText={(text) => {
            setCompanyUrl(text);
            if (fieldErrors.companyUrl) setFieldErrors(prev => ({ ...prev, companyUrl: '' }));
          }} 
          placeholder="https://..." 
          keyboardType="url" 
          autoCapitalize="none" 
        />
        {fieldErrors.companyUrl ? <Text style={styles.fieldErrorText}>{fieldErrors.companyUrl}</Text> : null}




          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Preview Job" onPress={handlePreview} loading={loading} />
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
  label: { ...Typography.labelMedium, marginBottom: 8, color: Colors.neutral[700] },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: Colors.neutral[200], borderRadius: 8, padding: 12, marginBottom: 16 },
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
