import React, { useState, useRef, useEffect } from 'react';
import { PanResponder } from 'react-native';
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
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckSquare, Square, MapPin, Crosshair, Map as MapIcon, Minus, Plus, Navigation, X, Info } from 'lucide-react-native';
import MapView, { Marker, Circle as MapCircle } from 'react-native-maps';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import DatePicker from 'react-native-date-picker';
import { validateAddressType, ValidationResult } from '../../../utils/addressValidation';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';

export const RequestDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  
  const { categoryId, categoryTitle } = route.params || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ title: '', description: '', time: '' });
  const [addressValidation, setAddressValidation] = useState<ValidationResult | null>(null);
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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getMinTimeForPicker = (pickerDate: Date, selectedDate: Date) => {
    const min = new Date(pickerDate);
    min.setHours(0, 0, 0, 0);
    
    const now = new Date();
    const isToday = 
      selectedDate.getFullYear() === now.getFullYear() && 
      selectedDate.getMonth() === now.getMonth() && 
      selectedDate.getDate() === now.getDate();
      
    if (isToday) {
      const minCurrentTime = new Date(pickerDate);
      minCurrentTime.setHours(now.getHours() + 2, now.getMinutes(), 0, 0);
      return minCurrentTime;
    }
    return min;
  };

  const getMaxTimeForPicker = (pickerDate: Date) => {
    const max = new Date(pickerDate);
    max.setHours(23, 59, 59, 999);
    return max;
  };

  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [radius, setRadius] = useState(10); // in km
  const [trackWidth, setTrackWidth] = useState(0);
  const radiusRef = useRef(radius);

  useEffect(() => {
    radiusRef.current = radius;
  }, [radius]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        if (trackWidth > 0) {
          const tapX = evt.nativeEvent.locationX - 16; // account for paddingHorizontal
          const percentage = Math.max(0, Math.min(1, tapX / trackWidth));
          const newRadius = Math.round(1 + percentage * 24);
          setRadius(newRadius);
          radiusRef.current = newRadius;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (trackWidth > 0) {
          const percentageChange = gestureState.dx / trackWidth;
          const newRadius = Math.round(radiusRef.current + percentageChange * 24);
          setRadius(Math.max(1, Math.min(25, newRadius)));
        }
      },
    })
  ).current;

  const [volunteersNeeded, setVolunteersNeeded] = useState(1);
  const [urgency, setUrgency] = useState<'Normal' | 'High' | 'Urgent'>('High');

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAd20tmxrXZ1VCyhZx4q9aK0ejZtQtE92s';
  const googlePlacesRef = useRef<GooglePlacesAutocompleteRef>(null);

  const handleCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setRegion({
          ...region,
          latitude: lat,
          longitude: lng,
        });
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setAddress('Current Location');
        googlePlacesRef.current?.setAddressText('Current Location');
      },
      (error) => console.log(error.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMarkerDragEnd = async (e: any) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setRegion({
      ...region,
      latitude: lat,
      longitude: lng,
    });
    setLatitude(lat.toString());
    setLongitude(lng.toString());
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const fetchedAddress = data.results[0].formatted_address;
        const types = data.results[0].types || [];
        setAddressValidation(validateAddressType(types));
        setAddress(fetchedAddress);
        googlePlacesRef.current?.setAddressText(fetchedAddress);
      }
    } catch (error) {
      console.error('Error fetching reverse geocoding:', error);
    }
  };

  const getPlaceholders = () => {
    const name = (categoryTitle || '').toLowerCase();
    
    if (name.includes('community')) {
      return {
        title: 'e.g. Weekly Food Drive',
        desc: 'e.g. Help distribute food to local families in need at the community center',
      };
    }
    if (name.includes('event')) {
      return {
        title: 'e.g. Annual Charity Run',
        desc: 'e.g. Assist with registration and handing out water bottles to runners',
      };
    }
    if (name.includes('volunteer')) {
      return {
        title: 'e.g. Mentorship Program',
        desc: 'e.g. Spend an hour a week mentoring high school students',
      };
    }

    return {
      title: 'e.g. General Assistance',
      desc: 'Describe your request...',
    };
  };

  const placeholders = getPlaceholders();

  const incrementVolunteers = () => setVolunteersNeeded(v => v + 1);
  const decrementVolunteers = () => setVolunteersNeeded(v => Math.max(1, v - 1));

  
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

    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    if (endMinutes - startMinutes <= 0) {
      newErrors.time = 'End time must be after start time';
      hasError = true;
    } 
    // else 
    //   if (endMinutes - startMinutes > 240) {
    //   newErrors.time = 'Request cannot exceed 4 hours';
    //   hasError = true;
    // }  
      if (!address.trim()) {
      setAddressError('Please enter an address');
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    navigation.navigate('ReviewRequest', {
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
      address,
      latitude,
      longitude,
      radius,
      volunteersNeeded,
      urgency,
    });
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
            <Text style={styles.label}>Category <Text style={{color: Colors.error}}>*</Text></Text>
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
            <Text style={styles.label}>Title <Text style={{color: Colors.error}}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.title ? styles.inputError : null]}
              placeholder={placeholders.title}
              placeholderTextColor={Colors.neutral[400]}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              maxLength={20}
            />
            <View style={styles.descriptionFooter}>
              {!!errors.title ? (
                <Text style={[styles.errorText, { marginTop: 0 }]}>{errors.title}</Text>
              ) : (
                <View />
              )}
              <Text style={[styles.charCount, { marginTop: 0 }]}>{title.length}/20</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description <Text style={{color: Colors.error}}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
              placeholder={placeholders.desc}
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
            <Text style={styles.label}>Number of positions <Text style={{color: Colors.error}}>*</Text></Text>
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
       {/* Volunteers Needed */}
        {helpType !== 'single' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Volunteers Needed <Text style={{color: Colors.error}}>*</Text></Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity style={styles.counterButton} onPress={decrementVolunteers}>
                <Minus color={Colors.neutral[900]} size={24} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{volunteersNeeded}</Text>
              <TouchableOpacity style={styles.counterButton} onPress={incrementVolunteers}>
                <Plus color={Colors.neutral[900]} size={24} />
              </TouchableOpacity>
            </View>
          </View>
        )}
          {/* Dates and Times */}
          {helpType === 'single' ? (
            <>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8, marginBottom: 0 }]}>
                  <Text style={styles.label}>{isMultipleDates ? 'Start Date' : 'Date'} <Text style={{color: Colors.error}}>*</Text></Text>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setIsStartDatePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                    <CalendarIcon color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
                {isMultipleDates && (
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8, marginBottom: 0 }]}>
                    <Text style={styles.label}>End Date <Text style={{color: Colors.error}}>*</Text></Text>
                    <TouchableOpacity style={styles.dateInput} onPress={() => setIsEndDatePickerOpen(true)}>
                      <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                      <CalendarIcon color={Colors.neutral[500]} size={20} />
                    </TouchableOpacity>
                  </View>
                )}
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
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8, marginBottom: errors.time ? 8 : 24 }]}>
                  <Text style={styles.label}>Start Time <Text style={{color: Colors.error}}>*</Text></Text>
                  <TouchableOpacity style={[styles.dateInput, errors.time ? styles.inputError : null]} onPress={() => setIsStartTimePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatTime(startTime)}</Text>
                    <Clock color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8, marginBottom: errors.time ? 8 : 24 }]}>
                  <Text style={styles.label}>End Time <Text style={{color: Colors.error}}>*</Text></Text>
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
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8, marginBottom: 24 }]}>
                  <Text style={styles.label}>Start Date <Text style={{color: Colors.error}}>*</Text></Text>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setIsStartDatePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                    <CalendarIcon color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8, marginBottom: 24 }]}>
                  <Text style={styles.label}>End Date <Text style={{color: Colors.error}}>*</Text></Text>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setIsEndDatePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                    <CalendarIcon color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8, marginBottom: errors.time ? 8 : 24 }]}>
                  <Text style={styles.label}>Start Time <Text style={{color: Colors.error}}>*</Text></Text>
                  <TouchableOpacity style={[styles.dateInput, errors.time ? styles.inputError : null]} onPress={() => setIsStartTimePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatTime(startTime)}</Text>
                    <Clock color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8, marginBottom: errors.time ? 8 : 24 }]}>
                  <Text style={styles.label}>End Time <Text style={{color: Colors.error}}>*</Text></Text>
                  <TouchableOpacity style={[styles.dateInput, errors.time ? styles.inputError : null]} onPress={() => setIsEndTimePickerOpen(true)}>
                    <Text style={styles.dateText}>{formatTime(endTime)}</Text>
                    <Clock color={Colors.neutral[500]} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
              {!!errors.time && <Text style={[styles.errorText, { marginBottom: 24, marginTop: 0 }]}>{errors.time}</Text>}
            </>
          )}

        
        {/* Address */}
        <View style={styles.inputGroup}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
            <Text style={[styles.label, {marginBottom: 0}]}>Address <Text style={{color: Colors.error}}>*</Text></Text>
            {(latitude && longitude) ? (
              <TouchableOpacity onPress={() => setIsMapModalVisible(true)}>
                <AppText variant="bodyMedium" color={Colors.primary[500]} style={{ textDecorationLine: 'underline' }}>
                  Show on map
                </AppText>
              </TouchableOpacity>
            ) : null}
          </View>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="Enter address"
            fetchDetails={true}
            onPress={(data, details = null) => {
              if (addressError) setAddressError('');
              if (details) {
                console.log("Selected Address Details: ", details);
                setAddressValidation(validateAddressType(details.types));
                setAddress(data.description);
                setLatitude(details.geometry.location.lat.toString());
                setLongitude(details.geometry.location.lng.toString());
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
                backgroundColor: Colors.neutral[50],
                borderRadius: 12,
                borderWidth: 1,
                borderColor: addressError ? Colors.error : Colors.neutral[200],
                height: 52,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
              },
              textInput: {
                color: Colors.neutral[900],
                fontSize: 16,
                height: 50,
                marginLeft: 8,
                flex: 1,
                backgroundColor: 'transparent',
              },
              listView: {
                backgroundColor: Colors.neutral[0],
                borderWidth: 1,
                borderColor: Colors.neutral[200],
                borderRadius: 8,
                marginTop: 4,
              },
            }}
            textInputProps={{
              placeholderTextColor: Colors.neutral[400],
              onChangeText: (text) => {
                setAddress(text);
                if (addressError) setAddressError('');
              }
            }}
            renderLeftButton={() => (
              <View style={{marginRight: 4}}>
                <MapPin color={Colors.primary[500]} size={20} />
              </View>
            )}
            renderRightButton={() => (
              <TouchableOpacity style={{padding: 4}} onPress={handleCurrentLocation}>
                <Navigation color={Colors.primary[500]} size={20} />
              </TouchableOpacity>
            )}
          />
          {!!addressError ? (
            <Text style={styles.errorText}>{addressError}</Text>
          ) : addressValidation?.message ? (
            <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 4}}>
              <Info 
                color={addressValidation.addressType === 'business' ? Colors.success : Colors.warning} 
                size={16} 
                style={{marginTop: 2, marginRight: 4}} 
              />
              <AppText 
                variant="bodySmall" 
                color={addressValidation.addressType === 'business' ? Colors.success : Colors.warning} 
                style={{flex: 1}}
              >
                {addressValidation.message}
              </AppText>
            </View>
          ) : null}
        </View>



 

        {/* Urgency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Urgency <Text style={{color: Colors.error}}>*</Text></Text>
          <View style={styles.urgencyGroup}>
            {['Normal', 'High', 'Urgent'].map((level) => {
              const isActive = urgency === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.urgencyButton, isActive && styles.urgencyButtonActive]}
                  onPress={() => setUrgency(level as any)}
                >
                  <Text style={[styles.urgencyText, isActive && styles.urgencyTextActive]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
        minimumDate={getMinTimeForPicker(startTime, startDate)}
        maximumDate={getMaxTimeForPicker(startTime)}
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
        minimumDate={getMinTimeForPicker(endTime, endDate)}
        maximumDate={getMaxTimeForPicker(endTime)}
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

      {/* Map Modal */}
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
              latitude: Number(latitude) || region.latitude,
              longitude: Number(longitude) || region.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker 
              draggable
              coordinate={{ latitude: Number(latitude) || region.latitude, longitude: Number(longitude) || region.longitude }} 
              onDragEnd={handleMarkerDragEnd}
            />
            <MapCircle
              center={{ latitude: Number(latitude) || region.latitude, longitude: Number(longitude) || region.longitude }}
              radius={radius * 1000} // converting km to meters
              fillColor="rgba(91, 77, 255, 0.2)"
              strokeColor="rgba(91, 77, 255, 0.5)"
            />
          </MapView>
          <View style={{ padding: 16, backgroundColor: Colors.neutral[0], paddingBottom: Math.max(16, 24) }}>
             <Button title="Done" onPress={() => setIsMapModalVisible(false)} fullWidth />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </>
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
    marginTop: 8,
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
    borderTopColor: Colors.neutral[200],
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[0],
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

  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 12,
    backgroundColor: Colors.neutral[50],
  },
  addressText: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
  },
  iconButton: {
    padding: 8,
  },
  mapContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#E5E5CA', // Map-like background color
  },
  mapBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  mapRadiusCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(91, 77, 255, 0.2)', // Primary color with opacity
    borderWidth: 1,
    borderColor: 'rgba(91, 77, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPin: {
    marginTop: -12,
  },
  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  radiusValue: {
    ...Typography.labelMedium,
    color: Colors.primary[600],
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    position: 'relative',
    marginBottom: 16,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary[600],
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary[600],
    top: -8,
    marginLeft: -10, // Center thumb
    borderWidth: 2,
    borderColor: Colors.neutral[0],
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.neutral[50],
  },
  counterButton: {
    padding: 16,
  },
  counterValue: {
    ...Typography.h4,
    color: Colors.neutral[900],
  },
  urgencyGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    backgroundColor: Colors.neutral[50],
  },
  urgencyButtonActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  urgencyText: {
    ...Typography.labelMedium,
    color: Colors.neutral[700],
  },
  urgencyTextActive: {
    color: Colors.neutral[0],
  },

});
