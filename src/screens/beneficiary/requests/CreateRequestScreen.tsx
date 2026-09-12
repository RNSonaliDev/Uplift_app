import React, {useState, useRef} from 'react';
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
  LogBox,
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
import {ChevronLeft, ShoppingCart, MapPin, Navigation, X} from 'lucide-react-native';
import {Spacing} from '../../../theme/spacing';
import {horizontalScale, verticalScale, moderateScale} from '../../../utils/responsive';
import MapView, { Marker, Circle } from 'react-native-maps';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import { validateAddressType, ValidationResult } from '../../../utils/addressValidation';

LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

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
  const [addressValidation, setAddressValidation] = useState<ValidationResult | null>(null);

  const [date, setDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);

  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAd20tmxrXZ1VCyhZx4q9aK0ejZtQtE92s'; // TODO: Provide your Google Maps API Key here

  const googlePlacesRef = useRef<GooglePlacesAutocompleteRef>(null);

  const handleCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setRegion({
          ...region,
          latitude,
          longitude,
        });
        handleChange('latitude', latitude.toString());
        handleChange('longitude', longitude.toString());
        handleChange('meeting_location', 'Current Location');
        googlePlacesRef.current?.setAddressText('Current Location');
      },
      (error) => console.log(error.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMarkerDragEnd = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    handleChange('latitude', latitude.toString());
    handleChange('longitude', longitude.toString());
    setRegion({
      ...region,
      latitude,
      longitude,
    });
    
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        console.log("Address", data.results[0]);
        const address = data.results[0].formatted_address;
        const types = data.results[0].types || [];
        setAddressValidation(validateAddressType(types));
        handleChange('meeting_location', address);
        googlePlacesRef.current?.setAddressText(address);
      }
    } catch (error) {
      console.log('Reverse geocoding error:', error);
    }
  };

  const formatTime = (dateToFormat: Date) => {
    let hours = dateToFormat.getHours();
    const minutes = String(dateToFormat.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
  };

  const getMinTimeForPicker = (pickerDate: Date, selectedDate: Date) => {
    const min = new Date(pickerDate);
    min.setHours(8, 0, 0, 0);
    
    const now = new Date();
    const isToday = 
      selectedDate.getFullYear() === now.getFullYear() && 
      selectedDate.getMonth() === now.getMonth() && 
      selectedDate.getDate() === now.getDate();
      
    if (isToday) {
      const minCurrentTime = new Date(pickerDate);
      minCurrentTime.setHours(now.getHours() + 2, now.getMinutes(), 0, 0);
      const max = new Date(pickerDate);
      max.setHours(20, 0, 0, 0);
      
      if (minCurrentTime > max) return max;
      if (minCurrentTime > min) return minCurrentTime;
    }
    return min;
  };

  const getMaxTimeForPicker = (pickerDate: Date) => {
    const max = new Date(pickerDate);
    max.setHours(20, 0, 0, 0);
    return max;
  };

  React.useEffect(() => {
    if (route.params?.category_id) {
      setFormData(prev => ({ ...prev, category_id: route.params.category_id }));
    }
  }, [route.params?.category_id]);

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

  const getPlaceholders = (categoryId: string) => {
    const name = getCategoryName(categoryId).toLowerCase();
    
    if (name.includes('airport')) {
      return {
        title: 'e.g. Help carry two suitcases and help with check-in',
        desc: 'e.g. Meet at departure/arrival door for Delta Airlines',
      };
    }
    if (name.includes('home improvement')) {
      return {
        title: 'e.g. Help carry mulch and garden tools',
        desc: 'e.g. Help select and carry the plants, garden tools and mulch to the car',
      };
    }
    if (name.includes('mall visit')) {
      return {
        title: 'e.g. Help with elevators and carrying bags',
        desc: 'e.g. Take to 2-3 clothing shops and help carry bag to the parking lot',
      };
    }
    if (name.includes('companionship')) {
      return {
        title: 'e.g. Meet for a walk, company over coffee or play board game at a library',
        desc: 'e.g. Short walk followed by talking for some time',
      };
    }
    if (name.includes('shopping')) {
      return {
        title: 'e.g. Buy furniture or electronics',
        desc: 'e.g. Help explore options',
      };
    }
    if (name.includes('errands')) {
      return {
        title: 'e.g. Help at post office, library, or store returns',
        desc: 'e.g. Help return items at the post office',
      };
    }

    return {
      title: 'e.g. Grocery Pickup',
      desc: 'e.g. Need groceries picked up',
    };
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
    else if (formData.title.length > 20) newErrors.title = 'Maximum 20 characters allowed';
    
    if (!formData.category_id) newErrors.category_id = 'Required';
    
    if (!formData.description) newErrors.description = 'Required';
    else if (formData.description.length > 200) newErrors.description = 'Maximum 200 characters allowed';
    
    if (!formData.preferred_date) newErrors.preferred_date = 'Required';
    if (!formData.preferred_start_time) newErrors.preferred_start_time = 'Required';
    if (!formData.preferred_end_time) newErrors.preferred_end_time = 'Required';
    // if (!formData.hours_required) newErrors.hours_required = 'Required';
    if (!formData.meeting_location || formData.meeting_location === 'Current Location') {
      newErrors.meeting_location = 'Please add a valid address';
    }
    
    if (formData.preferred_start_time && formData.preferred_end_time) {
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
      
      const now = new Date();
      if (
        date.getFullYear() === now.getFullYear() && 
        date.getMonth() === now.getMonth() && 
        date.getDate() === now.getDate()
      ) {
         const currentMinutes = now.getHours() * 60 + now.getMinutes();
         if (startMinutes < currentMinutes + 120) {
            newErrors.preferred_start_time = 'Start time must be at least 2 hours from now';
         }
      }

      if (startTime.getHours() < 8 || endTime.getHours() > 20 || (endTime.getHours() === 20 && endTime.getMinutes() > 0)) {
        newErrors.preferred_start_time = 'Time must be between 8 AM and 8 PM';
        newErrors.preferred_end_time = 'Time must be between 8 AM and 8 PM';
      } else if (endMinutes - startMinutes <= 0) {
        newErrors.preferred_end_time = 'End time must be after start time';
      } else if (endMinutes - startMinutes > 240) {
        newErrors.preferred_end_time = 'Request cannot exceed 4 hours';
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
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" color={Colors.neutral[0]} style={styles.headerTitle}>Create Help Request</AppText>
        <View style={{width: 28}} />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: Colors.neutral[50]}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
            bottomRight={<AppText variant="caption" color={Colors.neutral[500]}>{formData.title.length}/20</AppText>}
            placeholder={getPlaceholders(formData.category_id).title}
            value={formData.title}
            onChangeText={v => handleChange('title', v)}
            maxLength={20}
            multiline={true}
            style={{ minHeight: 60, textAlignVertical: 'top' }}
            error={errors.title}
          />

          <Input
            label="Information for your volunteer."
            bottomRight={<AppText variant="caption" color={Colors.neutral[500]}>{formData.description.length}/200</AppText>}
            placeholder={getPlaceholders(formData.category_id).desc}
            value={formData.description}
            onChangeText={v => handleChange('description', v)}
            multiline
            maxLength={200}
            style={{height: 80, textAlignVertical: 'top'}}
            error={errors.description}
          />

          <TouchableOpacity onPress={() => setIsDatePickerOpen(true)} activeOpacity={0.7}>
            <View pointerEvents="none">
              <Input
                label="Preferred Date"
                placeholder="MM/DD/YYYY"
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

          <View style={styles.addressSection}>
            <AppText variant="labelLarge" color={Colors.neutral[700]} style={{marginBottom: 8}}>
              Meeting Location <AppText color={Colors.error}>*</AppText>
            </AppText>
            <GooglePlacesAutocomplete
              ref={googlePlacesRef}
              placeholder="e.g. 123 Main St, Beverly Hills, CA"
              fetchDetails={true}
              onPress={(data, details = null) => {
                if (details) {
                  console.log("Selected Address Details: ", details);
                  setAddressValidation(validateAddressType(details.types));
                  handleChange('meeting_location', data.description);
                  handleChange('latitude', details.geometry.location.lat.toString());
                  handleChange('longitude', details.geometry.location.lng.toString());
                  setRegion({
                    ...region,
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                  });
                }
              }}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
              }}
              styles={{
                container: { flex: 0 },
                textInputContainer: {
                  ...styles.placesInputContainer,
                  borderColor: errors.meeting_location ? Colors.error : Colors.neutral[200],
                },
                textInput: styles.placesInput,
                listView: styles.placesListView,
              }}
              textInputProps={{
                placeholderTextColor: Colors.neutral[400],
              }}
              listViewProps={{
                nestedScrollEnabled: true,
              }}
              renderLeftButton={() => (
                <View style={styles.leftIconContainer}>
                  <MapPin color={Colors.primary[500]} size={20} />
                </View>
              )}
              renderRightButton={() => (
                <TouchableOpacity style={styles.locationBtn} onPress={handleCurrentLocation}>
                  <Navigation color={Colors.primary[500]} size={20} />
                </TouchableOpacity>
              )}
            />
            {errors.meeting_location ? (
              <AppText variant="bodySmall" color={Colors.error} style={{marginTop: 4}}>
                {errors.meeting_location}
              </AppText>
            ) : addressValidation?.message ? (
              <AppText 
                variant="bodySmall" 
                color={addressValidation.addressType === 'business' ? Colors.success : Colors.warning} 
                style={{marginTop: 4}}
              >
                {addressValidation.message}
              </AppText>
            ) : null}

            {(formData.latitude && formData.longitude) ? (
              <TouchableOpacity onPress={() => setIsMapModalVisible(true)} style={{ marginTop: Spacing.sm, marginBottom: Spacing.md, alignSelf: 'flex-end' }}>
                <AppText variant="bodyMedium" color={Colors.primary[500]} style={{ textDecorationLine: 'underline' }}>
                  Show on map
                </AppText>
              </TouchableOpacity>
            ) : null}
          </View>

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
          handleChange('preferred_date', `${month}/${day}/${year}`);
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
        minuteInterval={30}
        minimumDate={getMinTimeForPicker(startTime, date)}
        maximumDate={getMaxTimeForPicker(startTime)}
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
        minuteInterval={30}
        minimumDate={getMinTimeForPicker(endTime, date)}
        maximumDate={getMaxTimeForPicker(endTime)}
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
              <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)} style={{flexDirection: 'row', alignItems: 'center'}}>
                {/* <AppText color={Colors.primary[500]} style={{marginRight: 4}}>Close</AppText> */}
                <X color={Colors.neutral[950]} size={30} />
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

      <Modal visible={isMapModalVisible} transparent animationType="slide">
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <AppText variant="h5" style={{ color: Colors.neutral[900] }}>Location on Map</AppText>
            <TouchableOpacity onPress={() => setIsMapModalVisible(false)} style={{ padding: 4 }}>
              <X color={Colors.neutral[500]} size={24} />
            </TouchableOpacity>
          </View>
          <MapView
            style={{ flex: 1 }}
            region={{
              latitude: Number(formData.latitude) || region.latitude,
              longitude: Number(formData.longitude) || region.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker 
              draggable
              coordinate={{ latitude: Number(formData.latitude) || region.latitude, longitude: Number(formData.longitude) || region.longitude }} 
              onDragEnd={handleMarkerDragEnd}
            />
            <Circle
              center={{ latitude: Number(formData.latitude) || region.latitude, longitude: Number(formData.longitude) || region.longitude }}
              radius={200}
              fillColor="rgba(79, 70, 229, 0.2)"
              strokeColor="rgba(79, 70, 229, 0.5)"
            />
          </MapView>
          <View style={{ padding: Spacing.md, backgroundColor: Colors.neutral[0], paddingBottom: Math.max(Spacing.md, 24) }}>
             <Button title="Done" onPress={() => setIsMapModalVisible(false)} fullWidth />
          </View>
        </View>
      </Modal>
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
  backBtn: {
    padding: moderateScale(4),
  },
  headerTitle: {
    color: Colors.neutral[0],
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
  addressSection: {
    marginBottom: Spacing.xl,
    zIndex: 99,
  },
  leftIconContainer: {
    justifyContent: 'center',
    paddingLeft: moderateScale(12),
  },
  placesInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  placesInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    backgroundColor: 'transparent',
    height: verticalScale(48),
    paddingHorizontal: horizontalScale(8),
    margin: 0,
  },
  placesListView: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(12),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: verticalScale(4),
    maxHeight: verticalScale(200),
  },
  locationBtn: {
    padding: moderateScale(8),
  },
  mapContainer: {
    marginTop: verticalScale(16),
    height: verticalScale(200),
    width: '100%',
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    marginTop: Platform.OS === 'ios' ? 50 : 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 5,
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[0],
  },
});
