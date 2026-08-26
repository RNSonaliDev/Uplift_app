import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Dimensions,
  Text,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {Typography, FontFamily} from '../../../theme/typography';
import {AppText} from '../../../components/AppText';
import {Input} from '../../../components/Input';
import {Button} from '../../../components/Button';
import DatePicker from 'react-native-date-picker';
import {api, getFullImageUrl} from '../../../api/client';
import {authApi, CategoryResponse} from '../../../api/auth';
import {ChevronLeft, ShoppingCart} from 'lucide-react-native';
import {Spacing} from '../../../theme/spacing';
import {horizontalScale, verticalScale, moderateScale} from '../../../utils/responsive';

export default function CreateRequestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category_id: route.params?.category_id || '',
    description: '',
    preferred_date: '',
    preferred_start_time: '',
    preferred_end_time: '',
    hours_required: '',
    meeting_location: '',
    latitude: '',
    longitude: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [date, setDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [startTime, setStartTime] = useState(new Date());
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);

  const formatTime = (dateToFormat: Date) => {
    let hours = dateToFormat.getHours();
    const minutes = String(dateToFormat.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await authApi.getCategories();
      const beneficiaryCategories = data.filter((cat) => cat.category_type === 'beneficiary');
      setCategories(beneficiaryCategories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const getCategoryName = (id: string) => {
    const category = categories.find(c => c.id.toString() === id);
    return category ? category.title : 'Select a Category';
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({...prev, [key]: value}));
    if (errors[key]) {
      setErrors(prev => ({...prev, [key]: ''}));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Required';
    if (!formData.category_id) newErrors.category_id = 'Required';
    if (!formData.description) newErrors.description = 'Required';
    if (!formData.preferred_date) newErrors.preferred_date = 'Required';
    if (!formData.preferred_start_time) newErrors.preferred_start_time = 'Required';
    if (!formData.preferred_end_time) newErrors.preferred_end_time = 'Required';
    // if (!formData.hours_required) newErrors.hours_required = 'Required';
    if (!formData.meeting_location) newErrors.meeting_location = 'Required';
    
    if (formData.preferred_start_time && formData.preferred_end_time) {
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
      
      if (endMinutes - startMinutes < 60) {
        newErrors.preferred_end_time = 'Must be at least 1 hour after start time';
      }
    }
    
    // Basic validation for numbers
    if (formData.latitude && isNaN(Number(formData.latitude))) newErrors.latitude = 'Must be a number';
    if (formData.longitude && isNaN(Number(formData.longitude))) newErrors.longitude = 'Must be a number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (!validate()) return;
    
    navigation.navigate('PreviewRequest', {
      formData,
      categoryTitle: getCategoryName(formData.category_id),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Create Help Request</AppText>
        <View style={{width: 28}} />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: Colors.neutral[50]}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppText variant="bodyMedium" color={Colors.neutral[500]} style={styles.subtitle}>
            Fill out the details below to request assistance from a Volunteer.
          </AppText>

          <TouchableOpacity onPress={() => setIsCategoryModalVisible(true)} activeOpacity={0.7}>
            <View pointerEvents="none">
              <Input
                label="What can we help you?"
                placeholder="Select a Category"
                value={formData.category_id ? getCategoryName(formData.category_id) : ''}
                editable={false}
                error={errors.category_id}
              />
            </View>
          </TouchableOpacity>

          <Input
            label={formData.category_id ? `Tell us what kind of ${getCategoryName(formData.category_id)} help you need` : "Tell us what kind of help you need"}
            placeholder="e.g. Grocery Pickup"
            value={formData.title}
            onChangeText={v => handleChange('title', v)}
            error={errors.title}
          />

          <Input
            label="Information for your volunteer."
            placeholder="e.g. Need groceries picked up"
            value={formData.description}
            onChangeText={v => handleChange('description', v)}
            multiline
            style={{height: 80, textAlignVertical: 'top'}}
            error={errors.description}
          />

          <TouchableOpacity onPress={() => setIsDatePickerOpen(true)} activeOpacity={0.7}>
            <View pointerEvents="none">
              <Input
                label="Preferred Date"
                placeholder="DD-MM-YYYY"
                value={formData.preferred_date}
                editable={false}
                error={errors.preferred_date}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={[styles.halfInput, {marginRight: Spacing.sm}]}>
              <TouchableOpacity onPress={() => setIsStartTimePickerOpen(true)} activeOpacity={0.7}>
                <View pointerEvents="none">
                  <Input
                    label="Start Time"
                    placeholder="HH:MM AM"
                    value={formData.preferred_start_time}
                    editable={false}
                    error={errors.preferred_start_time}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={[styles.halfInput, {marginLeft: Spacing.sm}]}>
              <TouchableOpacity onPress={() => setIsEndTimePickerOpen(true)} activeOpacity={0.7}>
                <View pointerEvents="none">
                  <Input
                    label="End Time"
                    placeholder="HH:MM AM"
                    value={formData.preferred_end_time}
                    editable={false}
                    error={errors.preferred_end_time}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* <Input
            label="Hours Required"
            placeholder="e.g. 2"
            value={formData.hours_required}
            onChangeText={v => handleChange('hours_required', v)}
            keyboardType="numeric"
            error={errors.hours_required}
          /> */}

          <Input
            label="Meeting Location"
            placeholder="e.g. 123 Main St, Beverly Hills, CA"
            value={formData.meeting_location}
            onChangeText={v => handleChange('meeting_location', v)}
            error={errors.meeting_location}
          />

        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <Button
          title="Preview Request"
          onPress={handlePreview}
        />
      </View>

      <DatePicker
        modal
        open={isDatePickerOpen}
        date={date}
        minimumDate={new Date()}
        mode="date"
        onConfirm={(selectedDate) => {
          setIsDatePickerOpen(false);
          setDate(selectedDate);
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const year = selectedDate.getFullYear();
          handleChange('preferred_date', `${day}-${month}-${year}`);
        }}
        onCancel={() => {
          setIsDatePickerOpen(false);
        }}
      />

      <DatePicker
        modal
        open={isStartTimePickerOpen}
        date={startTime}
        mode="time"
        onConfirm={(selectedTime) => {
          setIsStartTimePickerOpen(false);
          setStartTime(selectedTime);
          handleChange('preferred_start_time', formatTime(selectedTime));
        }}
        onCancel={() => {
          setIsStartTimePickerOpen(false);
        }}
      />

      <DatePicker
        modal
        open={isEndTimePickerOpen}
        date={endTime}
        mode="time"
        onConfirm={(selectedTime) => {
          setIsEndTimePickerOpen(false);
          setEndTime(selectedTime);
          handleChange('preferred_end_time', formatTime(selectedTime));
        }}
        onCancel={() => {
          setIsEndTimePickerOpen(false);
        }}
      />

      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="labelLarge">Select Category</AppText>
              <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)}>
                <AppText color={Colors.primary[500]}>Close</AppText>
              </TouchableOpacity>
            </View>
            {loadingCategories ? (
              <ActivityIndicator size="large" color={Colors.primary[500]} style={{padding: 20}} />
            ) : (
              <FlatList
                data={categories}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                contentContainerStyle={{ padding: moderateScale(8) }}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      handleChange('category_id', item.id.toString());
                      setIsCategoryModalVisible(false);
                    }}>
                    <View style={styles.iconContainer}>
                      {item.logo_url ? (
                        <Image 
                          source={{ uri: getFullImageUrl(item.logo_url) as string }}
                          style={{ width: 32, height: 32 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <ShoppingCart color={Colors.primary[500]} size={32} />
                      )}
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
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
  backBtn: {
    padding: moderateScale(4),
  },
  headerTitle: {
    color: Colors.neutral[900],
  },
  content: {
    padding: horizontalScale(24),
    paddingBottom: verticalScale(40),
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    padding: moderateScale(24),
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    maxHeight: '50%',
    paddingBottom: verticalScale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  categoryItem: {
    flex: 1,
    margin: moderateScale(8),
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(4)},
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(12),
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    minHeight: verticalScale(140),
  },
  iconContainer: {
    marginBottom: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
});
