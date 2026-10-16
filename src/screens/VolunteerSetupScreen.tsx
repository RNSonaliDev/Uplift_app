import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  PanResponder,
  Modal,
  FlatList,
  Platform,
  Dimensions,
  Pressable,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path, Circle, Rect, Polyline} from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { ImagePickerModal, SelectedImage } from '../components/ImagePickerModal';
import MapView, { Marker, Circle as MapCircle } from 'react-native-maps';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import { Navigation, MapPin, X, Info } from 'lucide-react-native';
import { validateBusinessAddressWithAPI, ValidationResult } from '../utils/addressValidation';
import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {UpliftLogo} from '../components/UpliftLogo';
import {authApi} from '../api';
import {Colors} from '../theme/colors';
import {BorderRadius, Spacing} from '../theme/spacing';
import {Shadows} from '../theme/common';
import {
  moderateScale,
  fontScale,
  verticalScale,
  horizontalScale,
  isIOS,
} from '../utils/responsive';

// ── Navigation Types ──────────────────────────────────────
type RootStackParamList = {
  Welcome: undefined;
  CreateAccount: undefined;
  VerifyAccount: {emailOrPhone: string};
  CreateProfile: undefined;
  SelectRoles: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

// ── Icon Components ──────────────────────────────────────

const BackArrowIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.primary[900],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PhoneOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronDownIcon: React.FC<{size?: number; color?: string}> = ({
  size = 16,
  color = Colors.neutral[600],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="6 9 12 15 18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LocationPinIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CameraIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const InfoCircleIcon: React.FC<{size?: number; color?: string}> = ({
  size = 18,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <Path d="M12 16V12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Circle cx="12" cy="8" r="1" fill={color} />
  </Svg>
);

const ClockIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <Path d="M12 6V12L16 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const GridIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="4" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
    <Rect x="14" y="4" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
    <Rect x="14" y="14" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
    <Path d="M4 14H10V20H4V14Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MailOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

const EyeIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const CloseIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = Colors.neutral[700],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CheckCircleIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 14,
  color = Colors.secondary[600],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={Colors.secondary[50]} />
    <Path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EditPhotoIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 15,
  color = Colors.neutral[700],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Custom Components ──────────────────────────────────
const PhonePrefixPrefix = () => (
  <View style={styles.phonePrefixContainer}>
    <PhoneOutlineIcon size={18} color={Colors.primary[500]} />
    <AppText variant="bodyMedium" style={{marginLeft: 8, marginRight: 4}}>
      +1
    </AppText>
    <ChevronDownIcon />
    <View style={styles.verticalDivider} />
  </View>
);

const CustomSlider = ({ value, onValueChange, min = 0, max = 100, onSlidingStart, onSlidingComplete }: { value: number, onValueChange: (val: number) => void, min?: number, max?: number, onSlidingStart?: () => void, onSlidingComplete?: () => void }) => {
  const [width, setWidth] = useState(0);
  const widthRef = React.useRef(0);
  widthRef.current = width;

  const valueRef = React.useRef(value);
  valueRef.current = value;

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

// ── Main Component ──────────────────────────────────
export const VolunteerSetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<any>();
  const pendingRoles = route?.params?.pendingRoles || [];
  const selectedRoles = route?.params?.selectedRoles || [];
  const collectedRolesData = route?.params?.collectedRolesData || [];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [hours, setHours] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [radiusWithin, setRadiusWithin] = useState(20);
  const [radiusOutside, setRadiusOutside] = useState(10);

  const calculateAge = (dobString?: string): number | null => {
    if (!dobString) return null;
    const dobDate = new Date(dobString);
    if (isNaN(dobDate.getTime())) return null;
    let age = new Date().getFullYear() - dobDate.getFullYear();
    const m = new Date().getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && new Date().getDate() < dobDate.getDate())) {
      age--;
    }
    return age;
  };

  const initialDob = route?.params?.date_of_birth || route?.params?.dob || '';
  const initialAge = route?.params?.userAge ?? (initialDob ? calculateAge(initialDob) : null);
  const [userAge, setUserAge] = useState<number | null>(initialAge);
  const [dob, setDob] = useState(initialDob);
  const is18Plus = userAge !== null && userAge >= 18;

  const [governmentId, setGovernmentId] = useState<string | null>(null);
  const [showGovernmentIdModal, setShowGovernmentIdModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ uri: string; title: string } | null>(null);

  const getFileName = (uri: string | null, fallback: string) => {
    if (!uri) return fallback;
    const name = uri.split('/').pop();
    if (!name) return fallback;
    return name.length > 22 ? `${name.substring(0, 16)}...${name.split('.').pop() || 'jpg'}` : name;
  };

  const [address, setAddress] = useState('');
  const [addressValidation, setAddressValidation] = useState<ValidationResult | null>(null);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAfVdKkV8tvaV4yQnLLtCKZ91qbuRWFBR0';
  const googlePlacesQuery = useMemo(() => ({
    key: GOOGLE_MAPS_API_KEY,
    language: 'en',
  }), []);
  const googlePlacesRef = useRef<GooglePlacesAutocompleteRef>(null);
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const zipCodeInputRef = useRef<TextInput>(null);
  const hoursInputRef = useRef<TextInput>(null);

  const handleCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
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
            setAddress(fetchedAddress);
            googlePlacesRef.current?.setAddressText(fetchedAddress);
            if (errors.address) setErrors(prev => ({...prev, address: ''}));

            const zipComponent = data.results[0].address_components?.find((c: any) => c.types?.includes('postal_code'));
            if (zipComponent) {
              setZipCode(zipComponent.long_name);
              if (errors.zipCode) setErrors(prev => ({...prev, zipCode: ''}));
            }

            try {
              setIsValidatingAddress(true);
              const validationData = await validateBusinessAddressWithAPI(fetchedAddress, GOOGLE_MAPS_API_KEY);
              setAddressValidation(validationData);
            } catch (err) {
              console.log('Error validating current location address:', err);
            } finally {
              setIsValidatingAddress(false);
            }
          } else {
            setAddress('Current Location');
            googlePlacesRef.current?.setAddressText('Current Location');
          }
        } catch (error) {
          console.error('Error reverse geocoding current location:', error);
          setAddress('Current Location');
          googlePlacesRef.current?.setAddressText('Current Location');
        }
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
        setAddress(fetchedAddress);
        googlePlacesRef.current?.setAddressText(fetchedAddress);
        
        const zipComponent = data.results[0].address_components.find((c: any) => c.types.includes('postal_code'));
        if (zipComponent) {
          setZipCode(zipComponent.long_name);
        }

        try {
          setIsValidatingAddress(true);
          const validationData = await validateBusinessAddressWithAPI(fetchedAddress, GOOGLE_MAPS_API_KEY);
          setAddressValidation(validationData);
        } catch (err) {
          console.log('Error validating dragged address:', err);
        } finally {
          setIsValidatingAddress(false);
        }
      }
    } catch (error) {
      console.error('Error fetching reverse geocoding:', error);
    }
  };
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [profile, cats] = await Promise.all([
          authApi.getProfile(),
          authApi.getCategories()
        ]);
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setEmail(profile.email || '');
        if (profile.phone) {
          const digits = profile.phone.replace('+1', '');
          setPhoneNumber(digits);
        }
        if (profile.date_of_birth) {
          setDob(profile.date_of_birth);
          const computedAge = calculateAge(profile.date_of_birth);
          if (computedAge !== null) {
            setUserAge(computedAge);
          }
        }
        if (profile.profile_image_url) {
          setProfilePhoto(profile.profile_image_url);
        }
        const volunteerCategories = (cats || []).filter(
          c => c.category_type && c.category_type.toLowerCase() === 'beneficiary'
        );
        setCategories(volunteerCategories);
      } catch (error) {
        // Handle error or ignore
      }
    };
    fetchInitialData();
  }, []);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneDigits.length < 10) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits';
    }

    const zipDigits = zipCode.replace(/\D/g, '');
    if (!zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (zipDigits.length !== 5) {
      newErrors.zipCode = 'ZIP code must be 5 digits';
    }

    if (!address || !address.trim() || address === 'Current Location') {
      newErrors.address = 'Starting address is required';
    } else if (addressValidation?.addressType === 'residential' || addressValidation?.isBusinessAddress === false) {
      newErrors.address = 'Please use the business address';
    }

    if (is18Plus && !governmentId) {
      newErrors.governmentId = 'Government ID photo is required';
    }

    // if (selectedCategories.length === 0) {
    //   newErrors.category = 'Please select at least one category';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    let currentValidation = addressValidation;
    if (address && address.trim() && address !== 'Current Location' && !currentValidation) {
      try {
        setIsValidatingAddress(true);
        currentValidation = await validateBusinessAddressWithAPI(address, GOOGLE_MAPS_API_KEY);
        setAddressValidation(currentValidation);
      } catch (err) {
        console.log('Error validating address on submit:', err);
      } finally {
        setIsValidatingAddress(false);
      }
    }

    if (currentValidation?.addressType === 'residential' || currentValidation?.isBusinessAddress === false) {
      setErrors(prev => ({
        ...prev,
        address: 'Please use the business address',
      }));
      return;
    }

    if (validate()) {
      const currentRoleData = {
        role: 'volunteer',
        profile: {
          first_name: firstName,
          last_name: lastName,
          phone: `+1${phoneNumber.replace(/\D/g, '')}`,
          email,
          zip_code: zipCode,
          service_radius: radiusWithin,
          category: selectedCategories.join(','),
          hours_goal_per_week: hours,
          government_id: governmentId,
          location: {
            address: address,
            latitude: Number(latitude),
            longitude: Number(longitude),
            zip_code: zipCode
          }
        }
      };

      try {
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('role', 'volunteer');
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('phone', `+1${phoneNumber.replace(/\D/g, '')}`);
        formData.append('zip_code', zipCode);
        formData.append('dob', dob || '');
        formData.append('service_radius', String(radiusWithin));
        formData.append('category', selectedCategories.join(','));
        formData.append('hours_goal_per_week', hours || '');
        formData.append('manual_verification', 'false');
        formData.append('address', address);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        selectedRoles.forEach((role: string) => {
          formData.append('selected_roles[]', role);
        });

        if (governmentId) {
          if (governmentId.startsWith('http://') || governmentId.startsWith('https://')) {
            formData.append('government_id', governmentId);
          } else {
            formData.append('government_id', {
              uri: governmentId,
              type: 'image/jpeg',
              name: 'government_id.jpg',
            } as any);
          }
        } else {
          formData.append('government_id', '');
        }

        await authApi.saveRoleProfile(formData);

        const newCollectedRolesData = [...collectedRolesData, currentRoleData];

        if (pendingRoles.length > 0) {
          const nextRoles = [...pendingRoles];
          const nextRole = nextRoles.shift();
          const routeParams = {
            pendingRoles: nextRoles,
            selectedRoles,
            collectedRolesData: newCollectedRolesData,
            date_of_birth: dob,
            userAge,
          };
          
          if (nextRole === 'volunteer') {
            navigation.navigate('VolunteerSetup' as any, routeParams);
          } else if (nextRole === 'organization') {
            navigation.navigate('OrganizationSetup' as any, routeParams);
          } else if (nextRole === 'sponsor') {
            navigation.navigate('SponsorSetup' as any, routeParams);
          } else if (nextRole === 'beneficiary') {
            navigation.navigate('BeneficiarySetup' as any, routeParams);
          }
        } else {
          navigation.navigate('Success' as any, { selectedRoles });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.data?.errors?.[0] || error?.message || 'Failed to save profile'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Info tooltip visibility
  const [showPhoneInfo, setShowPhoneInfo] = useState(false);
  const [showAddressInfo, setShowAddressInfo] = useState(false);

  const handleOpenGovernmentIdModal = () => {
    Keyboard.dismiss();
    setShowGovernmentIdModal(true);
  };

  const handleGovernmentIdSelected = (image: SelectedImage) => {
    setShowGovernmentIdModal(false);
    setGovernmentId(image.uri);
    if (errors.governmentId) setErrors(prev => ({ ...prev, governmentId: '' }));
  };

  const handleSelectPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
    });
    
    if (result.assets && result.assets.length > 0) {
      setProfilePhoto(result.assets[0].uri || null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        enableOnAndroid={true}
        enableResetScrollToCoords={false}
        scrollEnabled={isScrollEnabled}
      >
          
          {/* Header with Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <BackArrowIcon size={moderateScale(24)} />
          </TouchableOpacity>

          {/* Logo & Title */}
          <View style={styles.headerSection}>
            {/* <UpliftLogo size={moderateScale(0.8, 0.3)} /> */}
            <AppText variant="h2" center color={Colors.primary[900]} style={styles.title}>
              Volunteer Setup
            </AppText>
            <AppText
              variant="bodyMedium"
              center
              color={Colors.neutral[500]}
              style={styles.subtitle}>
              Let’s set up your profile
            </AppText>
          </View>


          {/* Form Fields */}
          <View style={styles.sectionContainer}>
            {/* Name Row */}
              <View style={styles.nameColumn}>
                <Input
                  ref={firstNameInputRef}
                  label="First name"
                  placeholder="Enter your first name"
                  leftIcon={<UserOutlineIcon />}
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (errors.firstName) setErrors({...errors, firstName: ''});
                  }}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => lastNameInputRef.current?.focus()}
                  error={errors.firstName}
                />
              </View>
              <View style={styles.nameSpacer} />
              <View style={styles.nameColumn}>
                <Input
                  ref={lastNameInputRef}
                  label="Last name"
                  placeholder="Enter your last name"
                  leftIcon={<UserOutlineIcon />}
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (errors.lastName) setErrors({...errors, lastName: ''});
                  }}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                  error={errors.lastName}
                />
              </View>

            <Input
              ref={emailInputRef}
              label="Email address"
              placeholder="Enter your email address"
              leftIcon={<MailOutlineIcon />}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({...errors, email: ''});
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => phoneInputRef.current?.focus()}
              error={errors.email}
            />

            {/* Phone Number with Tooltip */}
            <View style={[styles.phoneInputWrapper, showPhoneInfo && { zIndex: 99999, elevation: Platform.OS === 'android' ? 25 : undefined }]}>
              <View style={styles.labelRow}>
                <AppText variant="labelMedium" color={Colors.neutral[700]} style={{marginBottom: Spacing.xs}}>
                  Phone number <AppText color={Colors.error}>*</AppText>
                </AppText>
                <TouchableOpacity 
                  style={{marginLeft: 6, marginBottom: Spacing.xs}}
                  onPress={() => {
                    setShowPhoneInfo(!showPhoneInfo);
                    setShowAddressInfo(false);
                  }}
                >
                  <InfoCircleIcon size={18} color={Colors.primary[500]} />
                </TouchableOpacity>
              </View>

              <Input
                ref={phoneInputRef}
                placeholder="(201) 555-0123"
                leftIcon={<PhonePrefixPrefix />}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (errors.phoneNumber) setErrors({...errors, phoneNumber: ''});
                }}
                keyboardType="phone-pad"
                maxLength={10}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => zipCodeInputRef.current?.focus()}
                error={errors.phoneNumber}
              />

              {/* Floating Tooltip */}
              {showPhoneInfo && (
                <>
                  <Pressable
                    style={{
                      position: 'absolute',
                      top: -Dimensions.get('window').height,
                      bottom: -Dimensions.get('window').height,
                      left: -Dimensions.get('window').width,
                      right: -Dimensions.get('window').width,
                      backgroundColor: 'transparent',
                      zIndex: 99998,
                    }}
                    onPress={() => setShowPhoneInfo(false)}
                  />
                  <View style={[styles.tooltipContainer, { zIndex: 99999, elevation: 25 }]}>
                    {/* Left pointing triangle */}
                    <View style={styles.tooltipTriangle} />
                    <AppText variant="caption" color={Colors.neutral[800]} style={{lineHeight: 18}}>
                      We use your phone number to verify your identity and enable important safety notifications.
                    </AppText>
                  </View>
                </>
              )}
            </View>

            <View style={[styles.phoneInputWrapper, {
              marginBottom: Spacing.lg,
              zIndex: showAddressInfo ? 99999 : 9999,
              elevation: Platform.OS === 'android' ? (showAddressInfo ? 25 : 10) : undefined,
            }]}>
              <View style={[styles.labelRow, {justifyContent: 'space-between', alignItems: 'center'}]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <AppText variant="labelMedium" color={Colors.neutral[700]} style={{marginBottom: Spacing.xs}}>
                     Starting address <AppText color={Colors.error}>*</AppText>
                  </AppText>
                  <TouchableOpacity 
                    style={{marginLeft: 6, marginBottom: Spacing.xs}}
                    onPress={() => {
                      setShowAddressInfo(!showAddressInfo);
                      setShowPhoneInfo(false);
                    }}
                  >
                    <InfoCircleIcon size={18} color={Colors.primary[500]} />
                  </TouchableOpacity>
                </View>

                {(latitude && longitude) ? (
                  <TouchableOpacity onPress={() => setIsMapModalVisible(true)} style={{marginBottom: Spacing.xs}}>
                    <AppText variant="bodySmall" color={Colors.primary[500]} style={{textDecorationLine: 'underline'}}>
                      Show on map
                    </AppText>
                  </TouchableOpacity>
                ) : null}
              </View>

              <GooglePlacesAutocomplete
                ref={googlePlacesRef}
                placeholder="e.g. 123 Main St, Beverly Hills, CA"
                fetchDetails={true}
                enablePoweredByContainer={false}
                keyboardShouldPersistTaps="handled"
                debounce={300}
                minLength={1}
                onFail={(error) => console.log('Google Places Autocomplete Error:', error)}
                onPress={async (data, details = null) => {
                  const selectedAddr = data.description || (data as any).formatted_address || '';
                  setAddress(selectedAddr);
                  googlePlacesRef.current?.setAddressText(selectedAddr);
                  if (errors.address) setErrors(prev => ({...prev, address: ''}));

                  if (details?.geometry?.location) {
                    setLatitude(details.geometry.location.lat.toString());
                    setLongitude(details.geometry.location.lng.toString());
                    setRegion({
                      ...region,
                      latitude: details.geometry.location.lat,
                      longitude: details.geometry.location.lng,
                    });
                  }

                  const zipComp = details?.address_components?.find((c: any) => c.types?.includes('postal_code'));
                  if (zipComp) {
                    setZipCode(zipComp.long_name);
                    if (errors.zipCode) setErrors(prev => ({...prev, zipCode: ''}));
                  }

                  if (selectedAddr) {
                    try {
                      setIsValidatingAddress(true);
                      const validationData = await validateBusinessAddressWithAPI(selectedAddr, GOOGLE_MAPS_API_KEY);
                      setAddressValidation(validationData);
                    } catch (err) {
                      console.log('Error validating selected address:', err);
                    } finally {
                      setIsValidatingAddress(false);
                    }
                  }
                }}
                query={googlePlacesQuery}
                styles={{
                  container: {
                    flex: 0,
                    zIndex: 9999,
                  },
                  textInputContainer: {
                    backgroundColor: Colors.neutral[0],
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: errors.address ? Colors.error : Colors.neutral[300],
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
                    elevation: 10,
                    zIndex: 9999,
                    maxHeight: 220,
                  },
                  row: {
                    backgroundColor: Colors.neutral[0],
                    padding: 12,
                    height: 48,
                    flexDirection: 'row',
                  },
                  description: {
                    color: Colors.neutral[900],
                    fontSize: 14,
                  },
                  separator: {
                    height: 1,
                    backgroundColor: Colors.neutral[100],
                  },
                }}
                textInputProps={{
                  placeholderTextColor: Colors.neutral[400],
                  autoCorrect: false,
                  onChangeText: (text) => {
                    setAddress(text);
                    if (errors.address) setErrors({...errors, address: ''});
                    if (addressValidation) setAddressValidation(null);
                  }
                }}
                listViewProps={{
                  nestedScrollEnabled: true,
                  keyboardShouldPersistTaps: 'always',
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

              {/* Floating Tooltip */}
              {showAddressInfo && (
                <>
                  <Pressable
                    style={{
                      position: 'absolute',
                      top: -Dimensions.get('window').height,
                      bottom: -Dimensions.get('window').height,
                      left: -Dimensions.get('window').width,
                      right: -Dimensions.get('window').width,
                      backgroundColor: 'transparent',
                      zIndex: 99998,
                    }}
                    onPress={() => setShowAddressInfo(false)}
                  />
                  <View style={[styles.tooltipContainer, { zIndex: 99999, elevation: 25 }]}>
                    {/* Left pointing triangle */}
                    <View style={[styles.tooltipTriangle, {left: 145}]} />
                    <AppText variant="caption" color={Colors.neutral[800]} style={{lineHeight: 18}}>
                      Enter a nearby business address to match you with nearby requests— your exact location is never shared with anyone
                    </AppText>
                  </View>
                </>
              )}

              {!!errors.address ? (
                <AppText variant="bodySmall" color={Colors.error} style={{marginTop: 4}}>
                  {errors.address}
                </AppText>
              ) : isValidatingAddress ? (
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
                  <ActivityIndicator size="small" color={Colors.primary[500]} />
                  <AppText variant="caption" color={Colors.neutral[500]} style={{marginLeft: 8}}>
                    Validating address...
                  </AppText>
                </View>
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

            <Input
              ref={zipCodeInputRef}
              label="ZIP Code"
              placeholder="Enter your ZIP code"
              leftIcon={<LocationPinIcon />}
              value={zipCode}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, '').slice(0, 5);
                setZipCode(numeric);
                if (errors.zipCode) setErrors({...errors, zipCode: ''});
              }}
              keyboardType="number-pad"
              maxLength={5}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => hoursInputRef.current?.focus()}
              error={errors.zipCode}
            />

            {/* <View style={{ marginBottom: Spacing.lg }}>
              <View style={styles.labelRow}>
                <AppText variant="labelMedium" color={Colors.neutral[700]}>
                  Category / Type of Help
                </AppText>
                <AppText variant="labelMedium" color={Colors.error} style={{marginLeft: 4}}>
                  *
                </AppText>
              </View>
              <AppText variant="caption" color={Colors.neutral[500]} style={{marginBottom: Spacing.sm, marginTop: 2}}>
                Select at least one category you'd like to help with.
              </AppText>
              <TouchableOpacity onPress={() => setCategoryModalVisible(true)} activeOpacity={0.8}>
                <View pointerEvents="none">
                  <Input
                    editable={false}
                    placeholder="Select one or more categories"
                    leftIcon={<GridIcon />}
                    rightIcon={<ChevronDownIcon size={20} />}
                    value={
                      selectedCategories.length > 0 
                        ? categories.filter(c => selectedCategories.includes(c.id)).map(c => c.title).join(', ') 
                        : ''
                    }
                    containerStyle={{ marginBottom: 0 }}
                    error={errors.category}
                  />
                </View>
              </TouchableOpacity>
            </View> */}

            <Input
              ref={hoursInputRef}
              label=" Volunteering hours goal per week"
              placeholder="Enter number of hours (e.g., 2)"
              leftIcon={<ClockIcon />}
              // rightIcon={<AppText variant="caption" color={Colors.neutral[500]}>hrs/week</AppText>}
              value={hours}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, '');
                setHours(numeric);
              }}
              keyboardType="number-pad"
              maxLength={2}
              required={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          {/* Sliders Section */}
          <View style={styles.slidersContainer}>
            {/* Radius 1 */}
            <View style={styles.sliderGroup}>
              <View style={styles.sliderHeaderRow}>
                <View style={styles.sliderLabelGroup}>
                  <AppText variant="labelMedium" color={Colors.neutral[900]} style={{ flexShrink: 1 }}>
                    Select service radius (within your selected radius)
                  </AppText>
                  {/* <TouchableOpacity style={{marginLeft: 6}}>
                    <InfoCircleIcon size={16} color={Colors.primary[500]} />
                  </TouchableOpacity> */}
                </View>
                <View style={styles.pillContainer}>
                  <AppText variant="caption" color={Colors.primary[600]} weight="semiBold">
                    {Math.round(radiusWithin)} miles
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" color={Colors.neutral[500]} style={styles.sliderSubtitle}>
                Areas you are comfortable serving
              </AppText>
              
              <CustomSlider 
                value={radiusWithin} 
                onValueChange={setRadiusWithin} 
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

            {/* Radius 2 */}
            {/* <View style={styles.sliderGroup}>
              <View style={styles.sliderHeaderRow}>
                <View style={styles.sliderLabelGroup}>
                  <AppText variant="labelMedium" color={Colors.neutral[900]} style={{ flexShrink: 1 }}>
                    Service Radius (outside your selected radius)
                  </AppText>
                  <TouchableOpacity style={{marginLeft: 6}}>
                    <InfoCircleIcon size={16} color={Colors.primary[500]} />
                  </TouchableOpacity>
                </View>
                <View style={styles.pillContainer}>
                  <AppText variant="caption" color={Colors.primary[600]} weight="semiBold">
                    {Math.round(radiusOutside)} miles
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" color={Colors.neutral[500]} style={styles.sliderSubtitle}>
                Show opportunities outside your current radius.
              </AppText>
              
              <CustomSlider 
                value={radiusOutside} 
                onValueChange={setRadiusOutside} 
                min={5} 
                max={50}
                onSlidingStart={() => setIsScrollEnabled(false)}
                onSlidingComplete={() => setIsScrollEnabled(true)} 
              />
              
              <View style={styles.sliderLimitsRow}>
                <AppText variant="caption" color={Colors.neutral[500]}>5 miles</AppText>
                <AppText variant="caption" color={Colors.neutral[500]}>50 miles</AppText>
              </View>
            </View> */}
          </View>

          {/* Government ID Photo (Required for Ages 18+) */}
          {is18Plus && (
            <View style={{ marginTop: verticalScale(16), paddingHorizontal: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <AppText variant="labelMedium" color={Colors.neutral[700]}>
                    Government ID Photo
                  </AppText>
                  <AppText variant="labelMedium" color={Colors.error} style={{ marginLeft: 4 }}>
                    *
                  </AppText>
                </View>
                {governmentId ? (
                  <View style={styles.uploadedFileCard}>
                    <TouchableOpacity
                      style={styles.uploadedFileHeader}
                      activeOpacity={0.75}
                      onPress={() => setPreviewImage({
                        uri: governmentId,
                        title: 'Government ID Photo',
                      })}
                    >
                      <View style={styles.thumbnailWrapper}>
                        <Image
                          source={{ uri: governmentId }}
                          style={styles.uploadedThumbnail}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={styles.uploadedFileName}>
                        <View style={styles.uploadedTitleRow}>
                          <AppText variant="labelMedium" color={Colors.neutral[900]} weight="bold" numberOfLines={1}>
                            Government ID
                          </AppText>
                          <View style={styles.attachedBadge}>
                            <CheckCircleIcon size={12} color={Colors.secondary[600]} />
                            <AppText variant="caption" color={Colors.secondary[700]} weight="bold" style={{ marginLeft: 3 }}>
                              Uploaded
                            </AppText>
                          </View>
                        </View>
                        <AppText variant="caption" color={Colors.neutral[500]} numberOfLines={1} style={{ marginTop: 2 }}>
                          {getFileName(governmentId, 'government_id.jpg')} 
                        </AppText>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.cardDivider} />

                    <View style={styles.uploadedFileActions}>
                      <TouchableOpacity
                        style={styles.viewDocButton}
                        activeOpacity={0.7}
                        onPress={() => setPreviewImage({
                          uri: governmentId,
                          title: 'Government ID Photo',
                        })}
                      >
                        <EyeIcon size={15} color={Colors.primary[600]} />
                        <AppText variant="labelSmall" color={Colors.primary[600]} weight="bold" style={{ marginLeft: 6 }}>
                          View Document
                        </AppText>
                      </TouchableOpacity>

                      <View style={styles.verticalActionDivider} />

                      <TouchableOpacity
                        style={styles.changeDocButton}
                        activeOpacity={0.7}
                        onPress={handleOpenGovernmentIdModal}
                      >
                        <EditPhotoIcon size={14} color={Colors.neutral[700]} />
                        <AppText variant="labelSmall" color={Colors.neutral[700]} weight="bold" style={{ marginLeft: 6 }}>
                          Change Photo
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.idUploadBox,
                      errors.governmentId ? { borderColor: Colors.error } : null
                    ]}
                    onPress={handleOpenGovernmentIdModal}
                    activeOpacity={0.7}
                  >
                    <View style={styles.idUploadPlaceholder}>
                      <View style={styles.idUploadIconCircle}>
                        <CameraIcon size={24} color={Colors.primary[500]} />
                      </View>
                      <AppText variant="labelMedium" color={Colors.primary[900]} weight="bold" style={{ marginTop: 8 }}>
                        Upload Government ID
                      </AppText>
                      <AppText variant="caption" color={Colors.neutral[500]} style={{ marginTop: 2, textAlign: 'center' }}>
                        Driver's License, Passport, or State ID
                      </AppText>
                      <View style={styles.uploadCtaPill}>
                        <AppText variant="caption" color={Colors.primary[600]} weight="bold">
                          Take Photo or Upload
                        </AppText>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                {errors.governmentId ? (
                  <AppText variant="caption" color={Colors.error} style={{ marginTop: 4 }}>
                    {errors.governmentId}
                  </AppText>
                ) : null}
              </View>
          )}

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Continue Button */}
          <Button
            title="Continue"
            color="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleContinue}
            style={styles.continueButton}
          />
      </KeyboardAwareScrollView>

      {/* Category Multi-Select Modal */}
      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="h3" color={Colors.neutral[900]} weight="bold">
                Select Categories
              </AppText>
            </View>
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedCategories.includes(item.id);
                return (
                  <TouchableOpacity
                    style={styles.modalItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedCategories(selectedCategories.filter(id => id !== item.id));
                      } else {
                        setSelectedCategories([...selectedCategories, item.id]);
                        if (errors.category) setErrors({...errors, category: ''});
                      }
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <AppText
                        variant="bodyLarge"
                        color={isSelected ? Colors.primary[500] : Colors.neutral[800]}
                        weight={isSelected ? 'bold' : 'regular'}
                      >
                        {item.title}
                      </AppText>
                      {isSelected && <CheckIcon size={20} color={Colors.primary[500]} />}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
            <View style={styles.modalFooter}>
              <Button 
                title="Done" 
                color="primary" 
                size="md" 
                fullWidth 
                onPress={() => setCategoryModalVisible(false)} 
              />
            </View>
          </View>
        </TouchableOpacity>
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
              latitude: Number(latitude) || region.latitude,
              longitude: Number(longitude) || region.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker 
              draggable
              coordinate={{ latitude: Number(latitude) || region.latitude, longitude: Number(longitude) || region.longitude }} 
              onDragEnd={handleMarkerDragEnd}
            />
            <MapCircle
              center={{ latitude: Number(latitude) || region.latitude, longitude: Number(longitude) || region.longitude }}
              radius={radiusWithin * 1609.34}
              fillColor="rgba(79, 70, 229, 0.2)"
              strokeColor="rgba(79, 70, 229, 0.5)"
            />
          </MapView>
          <View style={{ padding: Spacing.md, backgroundColor: Colors.neutral[0], paddingBottom: Math.max(Spacing.md, 24) }}>
             <Button title="Done" onPress={() => setIsMapModalVisible(false)} fullWidth />
          </View>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <TouchableOpacity
          style={styles.previewModalOverlay}
          activeOpacity={1}
          onPress={() => setPreviewImage(null)}
        >
          <View style={styles.previewModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.previewModalHeader}>
              <AppText variant="h4" color={Colors.primary[900]} weight="bold">
                {previewImage?.title || 'Image Preview'}
              </AppText>
              <TouchableOpacity
                onPress={() => setPreviewImage(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseIcon size={22} color={Colors.neutral[700]} />
              </TouchableOpacity>
            </View>
            {previewImage?.uri ? (
              <Image
                source={{ uri: previewImage.uri }}
                style={styles.previewModalImage}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Government ID Image Picker Modal */}
      <ImagePickerModal
        visible={showGovernmentIdModal}
        onClose={() => setShowGovernmentIdModal(false)}
        onImageSelected={handleGovernmentIdSelected}
        title="Government ID Photo"
        subtitle="Take a photo of your ID (Driver's License, Passport, State ID) or select from gallery"
        cameraType="back"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(32),
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: verticalScale(8),
    padding: moderateScale(4),
  },
  headerSection: {
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  title: {
    marginTop: verticalScale(16),
  },
  subtitle: {
    marginTop: verticalScale(8),
  },
  sectionContainer: {
    marginTop: verticalScale(32),
  },
  sectionLabel: {
    marginBottom: verticalScale(16),
  },
  photoUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoTextContainer: {
    marginLeft: horizontalScale(20),
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameColumn: {
    flex: 1,
  },
  nameSpacer: {
    width: horizontalScale(16),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  phoneInputWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 32, // Vertically aligned slightly below the label
    left: 0,
    right: 0,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.md,
    elevation: 25,
    zIndex: 99999,
  },
  tooltipTriangle: {
    position: 'absolute',
    top: -10,
    left: 130, // Pointing UP, aligned under the icon
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
  slidersContainer: {
    marginTop: verticalScale(12),
  },
  sliderGroup: {
    marginBottom: verticalScale(32),
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  sliderLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  pillContainer: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xl,
  },
  sliderSubtitle: {
    marginBottom: verticalScale(16),
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
  spacer: {
    flex: 1,
    minHeight: verticalScale(32),
  },
  continueButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '85%',
    paddingBottom: verticalScale(isIOS ? 32 : 16),
  },
  modalHeader: {
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  modalOption: {
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    marginTop: isIOS ? 50 : 0,
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
  modalItem: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(24),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalFooter: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  idUploadBox: {
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary[50],
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  idUploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  idUploadIconCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  uploadCtaPill: {
    marginTop: verticalScale(8),
    backgroundColor: Colors.primary[100],
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: BorderRadius.full,
  },
  uploadedFileCard: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
    borderRadius: BorderRadius.xl,
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(8),
    paddingHorizontal: horizontalScale(14),
    ...Shadows.sm,
  },
  uploadedFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailWrapper: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  uploadedThumbnail: {
    width: '100%',
    height: '100%',
  },
  uploadedFileName: {
    marginLeft: horizontalScale(12),
    flex: 1,
    justifyContent: 'center',
  },
  uploadedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary[50],
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.secondary[200],
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginTop: verticalScale(10),
    marginBottom: verticalScale(4),
  },
  uploadedFileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewDocButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(8),
    borderRadius: BorderRadius.md,
  },
  verticalActionDivider: {
    width: 1,
    height: verticalScale(16),
    backgroundColor: Colors.neutral[200],
  },
  changeDocButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(8),
    borderRadius: BorderRadius.md,
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: horizontalScale(20),
  },
  previewModalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: moderateScale(16),
    ...Shadows.lg,
  },
  previewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  previewModalImage: {
    width: '100%',
    height: verticalScale(280),
    borderRadius: BorderRadius.md,
  },
});
