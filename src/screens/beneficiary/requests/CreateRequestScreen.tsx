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
import {ChevronLeft, ShoppingCart, MapPin, Navigation, X, Info} from 'lucide-react-native';
import {Spacing} from '../../../theme/spacing';
import {horizontalScale, verticalScale, moderateScale} from '../../../utils/responsive';
import MapView, { Marker, Circle } from 'react-native-maps';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import { validateAddressType, validateBusinessAddressWithAPI, ValidationResult } from '../../../utils/addressValidation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

// ── Custom Time Picker Modal Component ──────────────────────

interface CustomTimePickerModalProps {
  visible: boolean;
  type: 'start' | 'end';
  selectedDate: Date;
  currentTime: Date;
  startTime?: Date;
  onSelectTime: (time: Date) => void;
  onClose: () => void;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const CustomTimePickerModal: React.FC<CustomTimePickerModalProps> = ({
  visible,
  type,
  selectedDate,
  currentTime,
  startTime,
  onSelectTime,
  onClose,
}) => {
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    let h = currentTime.getHours() % 12;
    return h === 0 ? 12 : h;
  });
  const [selectedMinute, setSelectedMinute] = useState<number>(() => currentTime.getMinutes());
  const [period, setPeriod] = useState<'AM' | 'PM'>(() => (currentTime.getHours() >= 12 ? 'PM' : 'AM'));

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    if (visible) {
      let targetTime = new Date(currentTime);

      // If end time picker and currentTime <= startTime or invalid, default to startTime + 1h
      if (type === 'end' && startTime) {
        const startTotalMin = startTime.getHours() * 60 + startTime.getMinutes();
        const currentTotalMin = targetTime.getHours() * 60 + targetTime.getMinutes();
        if (currentTotalMin <= startTotalMin || currentTotalMin > startTotalMin + 240 || currentTotalMin > 1200) {
          const suggestedEndMin = Math.min(1200, startTotalMin + 60);
          targetTime = new Date(selectedDate);
          targetTime.setHours(Math.floor(suggestedEndMin / 60), suggestedEndMin % 60, 0, 0);
        }
      }

      let targetH24 = targetTime.getHours();
      let targetP: 'AM' | 'PM' = targetH24 >= 12 ? 'PM' : 'AM';

      // Check if current targetP has any valid hours; if not, switch period automatically!
      let validForPeriod = false;
      for (let h = 1; h <= 12; h++) {
        const h24 = get24Hour(h, targetP);
        for (let m = 0; m < 60; m++) {
          if (isTimeValid(h24, m)) {
            validForPeriod = true;
            break;
          }
        }
        if (validForPeriod) break;
      }

      if (!validForPeriod) {
        targetP = targetP === 'AM' ? 'PM' : 'AM';
      }

      let h12 = targetTime.getHours() % 12;
      let initialH = h12 === 0 ? 12 : h12;
      let initialM = targetTime.getMinutes();

      // If current hour in targetP is invalid, find the first valid hour in targetP
      if (!isTimeValid(get24Hour(initialH, targetP), initialM)) {
        for (let h = 1; h <= 12; h++) {
          const check24 = get24Hour(h, targetP);
          let found = false;
          for (let m = 0; m < 60; m++) {
            if (isTimeValid(check24, m)) {
              initialH = h;
              initialM = m;
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }

      setSelectedHour(initialH);
      setSelectedMinute(initialM);
      setPeriod(targetP);

      setTimeout(() => {
        const hourIdx = HOURS.indexOf(initialH);
        if (hourIdx !== -1 && hourScrollRef.current) {
          hourScrollRef.current.scrollTo({ y: hourIdx * 48, animated: true });
        }
        if (minuteScrollRef.current) {
          minuteScrollRef.current.scrollTo({ y: initialM * 48, animated: true });
        }
      }, 200);
    }
  }, [visible, currentTime, startTime, selectedDate, type]);

  const get24Hour = (h12: number, ampm: 'AM' | 'PM') => {
    if (ampm === 'AM') {
      return h12 === 12 ? 0 : h12;
    } else {
      return h12 === 12 ? 12 : h12 + 12;
    }
  };

  const now = new Date();
  const isToday =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();

  const minTodayMinutes = (now.getHours() + 2) * 60 + now.getMinutes();
  const startMinutes = startTime ? startTime.getHours() * 60 + startTime.getMinutes() : 0;

  const isTimeValid = (h24: number, min: number) => {
    const totalMin = h24 * 60 + min;

    // Operating hours: 8 AM (480 min) to 8 PM (1200 min)
    if (totalMin < 480 || totalMin > 1200) {
      return false;
    }

    // Lead time check for today
    if (type === 'start' && isToday && totalMin < minTodayMinutes) {
      return false;
    }

    // End time checks
    if (type === 'end') {
      if (totalMin <= startMinutes) return false;
      if (totalMin > startMinutes + 240) return false;
    }

    return true;
  };

  const isHourValid = (h12: number) => {
    const h24 = get24Hour(h12, period);
    for (let m = 0; m < 60; m++) {
      if (isTimeValid(h24, m)) return true;
    }
    return false;
  };

  const isPeriodValid = (p: 'AM' | 'PM') => {
    for (let h = 1; h <= 12; h++) {
      const h24 = get24Hour(h, p);
      for (let m = 0; m < 60; m++) {
        if (isTimeValid(h24, m)) return true;
      }
    }
    return false;
  };

  const currentH24 = get24Hour(selectedHour, period);
  const isCurrentSelectionValid = isTimeValid(currentH24, selectedMinute);

  const handleConfirm = () => {
    if (!isCurrentSelectionValid) return;
    const finalDate = new Date(selectedDate);
    finalDate.setHours(currentH24, selectedMinute, 0, 0);
    onSelectTime(finalDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.timePickerOverlay}>
        <View style={styles.timePickerModal}>
          {/* Header */}
          <View style={styles.timePickerHeader}>
            <View>
              <AppText variant="h5" color={Colors.neutral[900]}>
                {type === 'start' ? 'Select Start Time' : 'Select End Time'}
              </AppText>
              <AppText variant="caption" color={Colors.neutral[500]} style={{ marginTop: 2 }}>
                Operating hours: 8:00 AM – 8:00 PM
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X color={Colors.neutral[950]} size={24} />
            </TouchableOpacity>
          </View>

          {/* Digital Time Display */}
          <View style={styles.displayRow}>
            <View style={styles.digitalClockBox}>
              <AppText variant="h2" color={isCurrentSelectionValid ? Colors.primary[600] : Colors.error}>
                {String(selectedHour).padStart(2, '0')} : {String(selectedMinute).padStart(2, '0')}
              </AppText>
              <AppText variant="bodyLarge" weight="bold" color={Colors.primary[700]} style={{ marginLeft: 8 }}>
                {period}
              </AppText>
            </View>
          </View>

          {!isCurrentSelectionValid && (
            <View style={styles.warningBanner}>
              <AppText variant="caption" color={Colors.error} center>
                Selected time is outside allowed hours (8am–8pm) or invalid.
              </AppText>
            </View>
          )}

          {/* 3 Columns Side-by-Side in a Single Row */}
          <View style={styles.pickersRow}>
            {/* Column 1: Hour */}
            <View style={styles.columnContainer}>
              <AppText variant="labelMedium" color={Colors.neutral[700]} style={styles.columnLabel}>
                Hour (1-12)
              </AppText>
              <ScrollView
                ref={hourScrollRef}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={styles.verticalScroll}
                contentContainerStyle={styles.verticalScrollContent}>
                {HOURS.map((h) => {
                  const valid = isHourValid(h);
                  const isSelected = selectedHour === h;
                  return (
                    <TouchableOpacity
                      key={`h-${h}`}
                      style={[
                        styles.columnChip,
                        isSelected && styles.columnChipSelected,
                        !valid && styles.columnChipDisabled,
                      ]}
                      disabled={!valid}
                      onPress={() => setSelectedHour(h)}>
                      <AppText
                        variant="bodyMedium"
                        weight={isSelected ? 'bold' : 'regular'}
                        color={isSelected ? Colors.neutral[0] : !valid ? Colors.neutral[400] : Colors.neutral[900]}>
                        {String(h).padStart(2, '0')}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Column 2: Minute */}
            <View style={styles.columnContainer}>
              <AppText variant="labelMedium" color={Colors.neutral[700]} style={styles.columnLabel}>
                Minute (0-59)
              </AppText>
              <ScrollView
                ref={minuteScrollRef}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={styles.verticalScroll}
                contentContainerStyle={styles.verticalScrollContent}>
                {MINUTES.map((m) => {
                  const valid = isTimeValid(currentH24, m);
                  const isSelected = selectedMinute === m;
                  return (
                    <TouchableOpacity
                      key={`m-${m}`}
                      style={[
                        styles.columnChip,
                        isSelected && styles.columnChipSelected,
                        !valid && styles.columnChipDisabled,
                      ]}
                      disabled={!valid}
                      onPress={() => setSelectedMinute(m)}>
                      <AppText
                        variant="bodyMedium"
                        weight={isSelected ? 'bold' : 'regular'}
                        color={isSelected ? Colors.neutral[0] : !valid ? Colors.neutral[400] : Colors.neutral[900]}>
                        :{String(m).padStart(2, '0')}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Column 3: Period */}
            <View style={styles.columnContainer}>
              <AppText variant="labelMedium" color={Colors.neutral[700]} style={styles.columnLabel}>
                Period
              </AppText>
              <View style={styles.verticalPeriodContainer}>
                <TouchableOpacity
                  style={[
                    styles.columnChip,
                    styles.periodColumnChip,
                    period === 'AM' && styles.columnChipSelected,
                    !isPeriodValid('AM') && styles.columnChipDisabled,
                  ]}
                  disabled={!isPeriodValid('AM')}
                  onPress={() => setPeriod('AM')}>
                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    color={period === 'AM' ? Colors.neutral[0] : !isPeriodValid('AM') ? Colors.neutral[400] : Colors.neutral[800]}>
                    AM
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.columnChip,
                    styles.periodColumnChip,
                    period === 'PM' && styles.columnChipSelected,
                    !isPeriodValid('PM') && styles.columnChipDisabled,
                  ]}
                  disabled={!isPeriodValid('PM')}
                  onPress={() => setPeriod('PM')}>
                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    color={period === 'PM' ? Colors.neutral[0] : !isPeriodValid('PM') ? Colors.neutral[400] : Colors.neutral[800]}>
                    PM
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <View style={{ marginTop: verticalScale(16) }}>
            <Button
              title={`Confirm ${type === 'start' ? 'Start' : 'End'} Time (${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')} ${period})`}
              onPress={handleConfirm}
              disabled={!isCurrentSelectionValid}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

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

  const getInitialDate = () => {
    const now = new Date();
    if (now.getHours() >= 18) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return now;
  };

  const [date, setDate] = useState(getInitialDate);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(10, 0, 0, 0);
    return d;
  });
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(11, 0, 0, 0);
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

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAfVdKkV8tvaV4yQnLLtCKZ91qbuRWFBR0'; // TODO: Provide your Google Maps API Key here

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
        const address = data.results[0].formatted_address;
        console.log('Selected Address:', address);

        // Validate address using Address Validation API
        const validationData = await validateBusinessAddressWithAPI(address, GOOGLE_MAPS_API_KEY);
        setAddressValidation(validationData);

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
    } else if (addressValidation?.addressType === 'residential' || addressValidation?.isBusinessAddress === false) {
      newErrors.meeting_location = 'For your safety, please use the business address';
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
        <TouchableOpacity 
          onPress={() => {
            if (route.params?.fromDashboard) {
              navigation.navigate('BeneficiaryTabs', { screen: 'BeneficiaryDashboard' });
            } else {
              navigation.goBack();
            }
          }} 
          style={styles.backBtn}
        >
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: 'center'}}>Create Help Request</AppText>
        <View style={{width: 28}} />
      </View>

      <KeyboardAwareScrollView
        style={{flex: 1, backgroundColor: Colors.neutral[50]}}
        contentContainerStyle={styles.content} 
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
      >
          <AppText variant="bodyMedium" color={Colors.neutral[500]} style={styles.subtitle}>
            Fill out the details below to request assistance from a Volunteer.
          </AppText>

          <TouchableOpacity onPress={() => setIsCategoryModalVisible(true)} activeOpacity={0.7}>
            <View pointerEvents="none">
              <Input
                label="What can we help you with?"
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
            required={true}
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
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
              <AppText variant="labelLarge" color={Colors.neutral[700]}>
                Meeting Location <AppText color={Colors.error}>*</AppText>
              </AppText>
              {(formData.latitude && formData.longitude) ? (
                <TouchableOpacity onPress={() => setIsMapModalVisible(true)}>
                  <AppText variant="bodyMedium" color={Colors.primary[500]} style={{ textDecorationLine: 'underline' }}>
                    Show on map
                  </AppText>
                </TouchableOpacity>
              ) : null}
            </View>
            <GooglePlacesAutocomplete
              ref={googlePlacesRef}
              placeholder="e.g. 123 Main St, Beverly Hills, CA"
              fetchDetails={true}
              onPress={async (data, details = null) => {
                if (details) {
                  console.log("Selected Address Details: ", details);
                  const validationData = await validateBusinessAddressWithAPI(data.description, GOOGLE_MAPS_API_KEY);
                  setAddressValidation(validationData);
                  
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
                onChangeText: (text) => {
                  handleChange('meeting_location', text);
                  setAddressValidation(null);
                  if (errors.meeting_location) {
                    setErrors(prev => ({ ...prev, meeting_location: '' }));
                  }
                },
              }}
              {...({
                listViewProps: {
                  nestedScrollEnabled: true,
                },
              } as any)}
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
              <View style={{
                flexDirection: 'row', 
                alignItems: 'flex-start', 
                backgroundColor: addressValidation.addressType === 'business' 
                  ? Colors.secondary[50] 
                  : (addressValidation.addressType === 'residential' || addressValidation.isBusinessAddress === false)
                    ? '#FEE2E2'
                    : Colors.primary[50],
                borderRadius: 8,
                padding: 12,
                marginTop: 8,
                borderWidth: (addressValidation.addressType === 'residential' || addressValidation.isBusinessAddress === false) ? 1 : 0,
                borderColor: '#FCA5A5',
              }}>
                <Info 
                  color={addressValidation.addressType === 'business' 
                    ? Colors.success 
                    : (addressValidation.addressType === 'residential' || addressValidation.isBusinessAddress === false)
                      ? Colors.error
                      : Colors.info} 
                  size={20} 
                  style={{marginTop: 0, marginRight: 8}} 
                />
                <AppText 
                  variant="bodySmall" 
                  color={addressValidation.addressType === 'business' 
                    ? Colors.success 
                    : (addressValidation.addressType === 'residential' || addressValidation.isBusinessAddress === false)
                      ? Colors.error
                      : Colors.info} 
                  style={{flex: 1, lineHeight: 18}}
                >
                  {addressValidation.message}
                </AppText>
              </View>
            ) : null}


          </View>

        </KeyboardAwareScrollView>
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

      <CustomTimePickerModal
        visible={isStartTimePickerOpen}
        type="start"
        selectedDate={date}
        currentTime={startTime}
        onSelectTime={(selectedTime) => {
          setStartTime(selectedTime);
          handleChange('preferred_start_time', formatTime(selectedTime));

          // Automatically adjust end time to start time + 1 hour (clamped to 8 PM)
          const newEnd = new Date(selectedTime);
          const endHour = Math.min(20, selectedTime.getHours() + 1);
          newEnd.setHours(endHour, selectedTime.getMinutes(), 0, 0);
          setEndTime(newEnd);
          handleChange('preferred_end_time', formatTime(newEnd));
        }}
        onClose={() => setIsStartTimePickerOpen(false)}
      />

      <CustomTimePickerModal
        visible={isEndTimePickerOpen}
        type="end"
        selectedDate={date}
        currentTime={endTime}
        startTime={startTime}
        onSelectTime={(selectedTime) => {
          setEndTime(selectedTime);
          handleChange('preferred_end_time', formatTime(selectedTime));
        }}
        onClose={() => setIsEndTimePickerOpen(false)}
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
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(36),
    maxHeight: '70%',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  displayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
    padding: moderateScale(14),
    marginBottom: verticalScale(12),
  },
  digitalClockBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ampmToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[200],
    borderRadius: 12,
    padding: 3,
  },
  ampmBtn: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(8),
    borderRadius: 10,
  },
  ampmBtnActive: {
    backgroundColor: Colors.primary[500],
  },
  ampmBtnDisabled: {
    opacity: 0.4,
  },
  periodRow: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },
  periodBtn: {
    flex: 1,
    height: verticalScale(44),
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  periodBtnDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[200],
    opacity: 0.45,
  },
  warningBanner: {
    backgroundColor: '#FEE2E2',
    padding: verticalScale(8),
    borderRadius: 8,
    marginBottom: verticalScale(8),
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: horizontalScale(10),
    marginVertical: verticalScale(8),
  },
  columnContainer: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    marginBottom: verticalScale(6),
    textAlign: 'center',
  },
  verticalScroll: {
    height: verticalScale(200),
    width: '100%',
    backgroundColor: Colors.neutral[50],
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  verticalScrollContent: {
    alignItems: 'center',
    paddingVertical: verticalScale(6),
    gap: verticalScale(6),
    paddingHorizontal: horizontalScale(4),
  },
  columnChip: {
    width: '100%',
    height: verticalScale(42),
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnChipSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  columnChipDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[200],
    opacity: 0.45,
  },
  verticalPeriodContainer: {
    height: verticalScale(200),
    width: '100%',
    backgroundColor: Colors.neutral[50],
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: moderateScale(8),
    justifyContent: 'center',
    gap: verticalScale(12),
  },
  periodColumnChip: {
    height: verticalScale(50),
  },
  chipDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[200],
    opacity: 0.45,
  },
  minutesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(8),
    justifyContent: 'space-between',
  },
  minuteChip: {
    width: '23%',
    height: verticalScale(40),
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  fineTuneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(14),
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
});
