import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PanResponder,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {Input} from '../../../components/Input';
import {Button} from '../../../components/Button';
import {ChevronLeft, Calendar, MapPin, Clock, Info, Navigation, BadgeCheck, Phone, ChevronDown, Check, X} from 'lucide-react-native';
import {Spacing} from '../../../theme/spacing';
import {authApi} from '../../../api/auth';
import Svg, { Circle } from 'react-native-svg';
import MapView, { Marker, Circle as MapCircle } from 'react-native-maps';

const CustomSlider = ({ value, onValueChange, min = 0, max = 100, onSlidingStart, onSlidingComplete }: { value: number, onValueChange: (val: number) => void, min?: number, max?: number, onSlidingStart?: () => void, onSlidingComplete?: () => void }) => {
  const [width, setWidth] = useState(0);
  const widthRef = React.useRef(0);
  widthRef.current = width;

  const onValueChangeRef = React.useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  const startValue = React.useRef(value);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        if (onSlidingStart) onSlidingStart();
        if (widthRef.current > 0) {
          const locX = evt.nativeEvent.locationX;
          const percent = Math.max(0, Math.min(1, locX / widthRef.current));
          const newValue = min + percent * (max - min);
          startValue.current = newValue;
          onValueChangeRef.current(newValue);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (widthRef.current > 0) {
          const deltaPercent = gestureState.dx / widthRef.current;
          let newValue = startValue.current + deltaPercent * (max - min);
          newValue = Math.max(min, Math.min(max, newValue));
          onValueChangeRef.current(newValue);
        }
      },
      onPanResponderRelease: () => {
        if (onSlidingComplete) onSlidingComplete();
      },
      onPanResponderTerminate: () => {
        if (onSlidingComplete) onSlidingComplete();
      },
    })
  ).current;

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View 
      style={styles.sliderContainer} 
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
      hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }}
    >
      <View style={styles.sliderTrack} pointerEvents="none">
        <View style={[styles.sliderFill, { width: `${percentage}%` }]} />
      </View>
      <View style={[styles.sliderThumb, { left: `${percentage}%` }]} pointerEvents="none" />
    </View>
  );
};

const RadioActiveIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.primary[600],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="5" fill={color} />
  </Svg>
);

const RadioInactiveIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.neutral[300],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
  </Svg>
);

const RadioCard = ({
  title,
  description,
  isSelected,
  onPress,
}: {
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.radioCard, isSelected && styles.radioCardSelected]}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={styles.radioIconContainer}>
      {isSelected ? <RadioActiveIcon /> : <RadioInactiveIcon />}
    </View>
    <View style={styles.radioTextContainer}>
      <AppText
        variant="labelMedium"
        color={isSelected ? Colors.neutral[900] : Colors.neutral[800]}
        weight="bold">
        {title}
      </AppText>
      <AppText variant="caption" color={Colors.neutral[500]}>
        {description}
      </AppText>
    </View>
  </TouchableOpacity>
);

const PhonePrefixPrefix = () => (
  <View style={styles.phonePrefixContainer}>
    <Phone size={18} color={Colors.primary[500]} />
    <AppText variant="bodyMedium" style={{marginLeft: 8, marginRight: 4}}>
      +1
    </AppText>
    <ChevronDown color={Colors.neutral[500]} size={16} />
    <View style={styles.verticalDivider} />
  </View>
);

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentRole = route.params?.role || 'beneficiary';
  const GOOGLE_MAPS_API_KEY = 'AIzaSyAfVdKkV8tvaV4yQnLLtCKZ91qbuRWFBR0';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [showEmailVerifiedInfo, setShowEmailVerifiedInfo] = useState(false);
  const [showPhoneVerifiedInfo, setShowPhoneVerifiedInfo] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTypeModalVisible, setTypeModalVisible] = useState(false);
  const [organizationTypes, setOrganizationTypes] = useState<string[]>([]);
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

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
        handleChange('address', address);
      }
    } catch (error) {
      console.log('Reverse geocoding error:', error);
    }
  };
  const [formData, setFormData] = useState({
    base_first_name: '',
    base_last_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    email_verified: false,
    phone_verified: false,
    zip_code: '',
    dob: '',
    service_radius: '',
    hours_goal_per_week: '',
  });

  const getDisplayDob = (dobStr: string) => {
    if (!dobStr) return '';
    const parts = dobStr.split('-');
    if (parts.length === 3) {
      return `${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}/${parts[0]}`;
    }
    return dobStr;
  };
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile();
        const roleProfile = data.roles?.find((r: any) => r.role === currentRole)?.profile || data.active_profile || {};
        
        setFormData({
          base_first_name: data.first_name || '',
          base_last_name: data.last_name || '',
          first_name: roleProfile.first_name || data.first_name || '',
          last_name: roleProfile.last_name || data.last_name || '',
          phone: data.phone || '',
          email: data.email || '',
          email_verified: data.email_verified || false,
          phone_verified: data.phone_verified || false,
          zip_code: data.zip_code || roleProfile.zip_code || '',
          dob: data.date_of_birth || '',
          service_radius: roleProfile.service_radius ? String(roleProfile.service_radius) : '',
          hours_goal_per_week: roleProfile.hours_goal_per_week ? String(roleProfile.hours_goal_per_week) : '',
          address: roleProfile.address || '',
          anonymity: roleProfile.anonymity || 'hide',
          organization_type: roleProfile.organization_type || '',
          organization_name: roleProfile.organization_name || '',
          contact_name: roleProfile.contact_name || '',
          contact_email: roleProfile.contact_email || '',
          contact_phone: roleProfile.contact_phone || '',
          latitude: roleProfile.latitude ? String(roleProfile.latitude) : '',
          longitude: roleProfile.longitude ? String(roleProfile.longitude) : '',
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }

      if (currentRole === 'organization') {
        try {
          const categoriesData = await authApi.getOrganizationCategories();
          if (categoriesData && Array.isArray(categoriesData)) {
            const mappedTypes = categoriesData.map((c: any) => c.title || c.name || c.category_name || c);
            if (mappedTypes.length > 0) {
              setOrganizationTypes(mappedTypes);
            }
          }
        } catch (error) {
          console.error('Failed to fetch organization categories', error);
        }
      }
      
      setLoading(false);
    };
    fetchProfile();
  }, [currentRole]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { latitude, longitude, base_first_name, base_last_name, ...restProfile } = formData;
      const profilePayload: any = {
        ...restProfile,
        service_radius: Number(formData.service_radius) || 0,
        hours_goal_per_week: Number(formData.hours_goal_per_week) || null,
      };
      
      if (latitude) profilePayload.latitude = Number(latitude);
      if (longitude) profilePayload.longitude = Number(longitude);

      await authApi.updateProfile({
        role_profile: {
          role: currentRole,
          profile: profilePayload
        }
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully',
        onHide: () => navigation.goBack()
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to update profile'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: 'center'}}>Edit Profile</AppText>
        <View style={{width: 28}} />
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: Colors.neutral[50] }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
        scrollEnabled={isScrollEnabled}
      >
          <AppText variant="labelLarge" color={Colors.neutral[900]} weight="bold" style={{ marginBottom: 12 }}>Basic Details</AppText>
          {/* <Input
            label="First Name"
            value={formData.base_first_name}
            disabled={true}
          />
          <Input
            label="Last Name"
            value={formData.base_last_name}
            disabled={true}
          /> */}
          <View style={{position: 'relative', zIndex: 11}}>
            {showEmailVerifiedInfo && (
              <Pressable
                style={{
                  position: 'absolute',
                  top: -Dimensions.get('window').height,
                  bottom: -Dimensions.get('window').height,
                  left: -Dimensions.get('window').width,
                  right: -Dimensions.get('window').width,
                  backgroundColor: 'transparent',
                }}
                onPress={() => setShowEmailVerifiedInfo(false)}
              />
            )}
            <Input
              label="Email Address"
              value={formData.email}
              disabled={true}
              rightIcon={
                formData.email_verified ? (
                  <TouchableOpacity onPress={() => setShowEmailVerifiedInfo(!showEmailVerifiedInfo)}>
                    <BadgeCheck color={Colors.success} size={20} />
                  </TouchableOpacity>
                ) : undefined
              }
            />
            {showEmailVerifiedInfo && (
              <View style={styles.tooltipContainer}>
                <View style={styles.tooltipTriangle} />
                <AppText variant="caption" color={Colors.neutral[800]} style={{lineHeight: 18}}>
                  Email address is verified.
                </AppText>
              </View>
            )}
          </View>
          <View style={{position: 'relative', zIndex: 10}}>
            {showPhoneVerifiedInfo && (
              <Pressable
                style={{
                  position: 'absolute',
                  top: -Dimensions.get('window').height,
                  bottom: -Dimensions.get('window').height,
                  left: -Dimensions.get('window').width,
                  right: -Dimensions.get('window').width,
                  backgroundColor: 'transparent',
                }}
                onPress={() => setShowPhoneVerifiedInfo(false)}
              />
            )}
            <Input
              label="Phone Number"
              value={formData.phone.startsWith('+1') ? formData.phone.slice(2) : formData.phone}
              onChangeText={v => handleChange('phone', v)}
              keyboardType="phone-pad"
              disabled={true}
              leftIcon={<PhonePrefixPrefix />}
              rightIcon={
                formData.phone_verified ? (
                  <TouchableOpacity onPress={() => setShowPhoneVerifiedInfo(!showPhoneVerifiedInfo)}>
                    <BadgeCheck color={Colors.success} size={20} />
                  </TouchableOpacity>
                ) : undefined
              }
            />
            {showPhoneVerifiedInfo && (
              <View style={styles.tooltipContainer}>
                <View style={styles.tooltipTriangle} />
                <AppText variant="labelMedium" weight="bold" color={Colors.neutral[900]} style={{marginBottom: 4}}>
                  Verified
                </AppText>
                <AppText variant="caption" color={Colors.neutral[800]} style={{lineHeight: 18}}>
                  Phone number is verified.
                </AppText>
              </View>
            )}
          </View>
          <Input
            label="Date of Birth"
            value={getDisplayDob(formData.dob)}
            leftIcon={<Calendar color={Colors.neutral[400]} size={20} />}
            disabled={true}
          />

          <AppText variant="labelLarge" color={Colors.neutral[900]} weight="bold" style={{ marginTop: 12, marginBottom: 12 }}>
            {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Details
          </AppText>

          {currentRole !== 'organization' && (
            <>
              <Input
                label="First Name"
                value={formData.first_name}
                onChangeText={v => handleChange('first_name', v)}
                disabled={false}
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChangeText={v => handleChange('last_name', v)}
                disabled={false}
              />
            </>
          )}

          {currentRole === 'beneficiary' && (
            <>

              <Input
                label="ZIP Code"
                value={formData.zip_code}
                onChangeText={v => handleChange('zip_code', v)}
                keyboardType="number-pad"
              />
            </>
          )}

          {currentRole === 'volunteer' && (
            <>
              <Input
                label="ZIP Code"
                value={formData.zip_code}
                onChangeText={v => handleChange('zip_code', v)}
                keyboardType="number-pad"
                leftIcon={<MapPin color={Colors.neutral[400]} size={20} />}
              />
              <Input
                label="Address"
                value={formData.address}
                onChangeText={v => handleChange('address', v)}
              />
              <Input
                label=" Volunteering hours goal per week (Optional)"
                value={formData.hours_goal_per_week}
                onChangeText={v => handleChange('hours_goal_per_week', v)}
                keyboardType="number-pad"
                leftIcon={<Clock color={Colors.neutral[400]} size={20} />}
                rightIcon={<AppText variant="caption" color={Colors.neutral[500]}>hrs/week</AppText>}
              />

              <View style={styles.sliderGroup}>
                <View style={styles.sliderHeaderRow}>
                  <View style={styles.sliderLabelGroup}>
                    <AppText variant="labelMedium" color={Colors.neutral[900]} style={{ flexShrink: 1 }}>
                      Service Radius (within your selected radius)
                    </AppText>
                    {/* <TouchableOpacity style={{marginLeft: 6}}>
                      <Info size={16} color={Colors.primary[500]} />
                    </TouchableOpacity> */}
                  </View>
                  <View style={styles.pillContainer}>
                    <AppText variant="caption" color={Colors.primary[600]} weight="semiBold">
                      {Math.round(Number(formData.service_radius) || 20)} miles
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" color={Colors.neutral[500]} style={styles.sliderSubtitle}>
                  Show opportunities within your current radius.
                </AppText>
                
                <CustomSlider 
                  value={Number(formData.service_radius) || 20} 
                  onValueChange={(val) => handleChange('service_radius', String(Math.round(val)))} 
                  min={5} 
                  max={50}
                  onSlidingStart={() => setIsScrollEnabled(false)}
                  onSlidingComplete={() => setIsScrollEnabled(true)} 
                />
                
                <View style={styles.sliderLimitsRow}>
                  <AppText variant="caption" color={Colors.neutral[500]}>5 miles</AppText>
                  <AppText variant="caption" color={Colors.neutral[500]}>50 miles</AppText>
                </View>
              </View>
            </>
          )}

          {currentRole === 'sponsor' && (
            <>
              <AppText variant="labelLarge" color={Colors.neutral[900]} weight="bold" style={{ marginTop: 4, marginBottom: 12 }}>Anonymity</AppText>
              <View style={styles.radioGroup}>
                <RadioCard
                  title="Share my name"
                  description="Display my name to others"
                  isSelected={formData.anonymity === 'show'}
                  onPress={() => handleChange('anonymity', 'show')}
                />
                <RadioCard
                  title="Stay anonymous"
                  description="Hide my name from others"
                  isSelected={formData.anonymity === 'hide'}
                  onPress={() => handleChange('anonymity', 'hide')}
                />
              </View>
            </>
          )}

          {currentRole === 'organization' && (
            <>
              <View style={{ position: 'relative', zIndex: 9 }}>
                {isTypeModalVisible && (
                  <Pressable
                    style={{
                      position: 'absolute',
                      top: -Dimensions.get('window').height,
                      bottom: -Dimensions.get('window').height,
                      left: -Dimensions.get('window').width,
                      right: -Dimensions.get('window').width,
                      backgroundColor: 'transparent',
                    }}
                    onPress={() => setTypeModalVisible(false)}
                  />
                )}
                <TouchableOpacity activeOpacity={0.8} onPress={() => setTypeModalVisible(!isTypeModalVisible)}>
                  <View pointerEvents="none">
                    <Input
                      label="Organization Type"
                      placeholder="Select organization type"
                      value={formData.organization_type || ''}
                      editable={false}
                      rightIcon={<ChevronDown color={Colors.neutral[500]} size={20} />}
                    />
                  </View>
                </TouchableOpacity>

                {isTypeModalVisible && (
                  <View style={styles.inlineDropdown}>
                    {organizationTypes.map((item, index) => {
                    const isSelected = formData.organization_type === item;
                    const isLast = index === organizationTypes.length - 1;
                    return (
                      <TouchableOpacity
                        key={item + index}
                        style={[styles.dropdownItem, isLast && { borderBottomWidth: 0 }]}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, organization_type: item }));
                          setTypeModalVisible(false);
                        }}
                      >
                        <AppText
                          variant="bodyMedium"
                          color={isSelected ? Colors.primary[500] : Colors.neutral[800]}
                          weight={isSelected ? 'bold' : 'regular'}
                        >
                          {item || ''}
                        </AppText>
                        {isSelected && <Check color={Colors.primary[500]} size={18} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              </View>

              <Input
                label="Organization Name"
                value={formData.organization_name}
                onChangeText={v => handleChange('organization_name', v)}
              />
              <View style={{marginBottom: 16}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                  <AppText variant="labelMedium" color={Colors.neutral[700]}>
                    Address
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
                  placeholder="Enter address"
                  fetchDetails={true}
                  onPress={(data, details = null) => {
                    if (details) {
                      console.log("Selected Address Details: ", details);
                      handleChange('address', data.description);
                      if (details.geometry) {
                        handleChange('latitude', details.geometry.location.lat.toString());
                        handleChange('longitude', details.geometry.location.lng.toString());
                        setRegion({
                          ...region,
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng,
                        });
                      }
                    }
                  }}
                  query={{
                    key: GOOGLE_MAPS_API_KEY,
                    language: 'en',
                  }}
                  styles={{
                    container: { flex: 0 },
                    textInputContainer: {
                      backgroundColor: Colors.neutral[0],
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: Colors.neutral[300],
                      height: 52,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                    },
                    textInput: {
                      color: Colors.neutral[900],
                      fontSize: 16,
                      height: 50,
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
                    value: formData.address || '',
                    onChangeText: (text) => {
                      handleChange('address', text);
                    }
                  }}
                  renderLeftButton={() => (
                    <View style={{ marginRight: 8 }}>
                      <MapPin color={Colors.primary[500]} size={20} />
                    </View>
                  )}
                  renderRightButton={() => (
                    <TouchableOpacity style={{ padding: 4 }} onPress={() => {
                      Toast.show({
                        type: 'info',
                        text1: 'Coming Soon',
                        text2: 'Location feature will be available soon.',
                      });
                    }}>
                      <Navigation color={Colors.primary[500]} size={20} />
                    </TouchableOpacity>
                  )}
                />
              </View>
              <Input
                label="Contact Name"
                value={formData.contact_name}
                onChangeText={v => handleChange('contact_name', v)}
              />
              <Input
                label="Contact Email"
                value={formData.contact_email}
                onChangeText={v => handleChange('contact_email', v)}
                keyboardType="email-address"
              />
              <Input
                label="Contact Phone"
                value={formData.contact_phone?.startsWith('+1') ? formData.contact_phone.slice(2) : formData.contact_phone}
                onChangeText={v => handleChange('contact_phone', v)}
                keyboardType="phone-pad"
                leftIcon={<PhonePrefixPrefix />}
              />
            </>
          )}

      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving || loading}
          disabled={saving || loading}
        />
      </View>

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
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker 
              draggable
              coordinate={{ latitude: Number(formData.latitude) || region.latitude, longitude: Number(formData.longitude) || region.longitude }} 
              onDragEnd={handleMarkerDragEnd}
            />
            <MapCircle
              center={{ latitude: Number(formData.latitude) || region.latitude, longitude: Number(formData.longitude) || region.longitude }}
              radius={1000}
              fillColor="rgba(91, 77, 255, 0.2)"
              strokeColor="rgba(91, 77, 255, 0.5)"
            />
          </MapView>
          <View style={{ padding: 16, backgroundColor: Colors.neutral[0], paddingBottom: Math.max(16, 24) }}>
             <Button title="Done" onPress={() => setIsMapModalVisible(false)} fullWidth />
          </View>
        </View>
      </Modal>

      <DatePicker
        modal
        open={isDatePickerOpen}
        date={date}
        mode="date"
        maximumDate={new Date()}
        onConfirm={(selectedDate) => {
          setIsDatePickerOpen(false);

          const selectedAge = (new Date().getTime() - (selectedDate.getTime() - 24 * 60 * 60 * 1000)) / (1000 * 60 * 60 * 24 * 365.25);
          if (selectedAge < 14) {
            Toast.show({
              type: 'error',
              text1: 'Age Restriction',
              text2: 'You are not allowed but hope to see you when you turn 14.',
            });
            return;
          }

          setDate(selectedDate);
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const year = selectedDate.getFullYear();
          handleChange('dob', `${year}-${month}-${day}`);
        }}
        onCancel={() => {
          setIsDatePickerOpen(false);
        }}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.neutral[0],
  },
  content: {
    padding: 24,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  sliderGroup: {
    marginBottom: 32,
    marginTop: 16,
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  sliderLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  pillContainer: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  sliderSubtitle: {
    marginBottom: 16,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 4,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: 3,
    width: '100%',
  },
  sliderFill: {
    height: 6,
    backgroundColor: Colors.primary[500],
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral[0],
    borderWidth: 3,
    borderColor: Colors.primary[500],
    marginLeft: -14, // Center thumb
  },
  sliderLimitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioGroup: {
    gap: 12,
  },
  radioCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[0],
    marginBottom: 12,
    alignItems: 'center',
  },
  tooltipContainer: {
    position: 'absolute',
    top: 75,
    right: 0,
    backgroundColor: Colors.neutral[0],
    borderRadius: 8,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 20,
    width: 200,
  },
  tooltipTriangle: {
    position: 'absolute',
    top: -10,
    right: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.neutral[0],
  },
  radioCardSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  radioIconContainer: {
    marginRight: 16,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  radioTextContainer: {
    flex: 1,
  },
  phonePrefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.xs,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.neutral[200],
    marginLeft: Spacing.sm,
    marginRight: Spacing.sm,
  },
  inlineDropdown: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginTop: -8, // slightly overlap with input spacing
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
});
