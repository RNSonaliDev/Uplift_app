import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  TextInput,
  PanResponder,
  Modal,
  FlatList,
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
import { DatePickerModal } from '../components/DatePickerModal';

import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {UpliftLogo} from '../components/UpliftLogo';
import {authApi} from '../api';
import {Colors} from '../theme/colors';
import {BorderRadius, Spacing} from '../theme/spacing';
import {Shadows} from '../theme/common';
import {FontFamily, FontSize} from '../theme/typography';
import {
  moderateScale,
  fontScale,
  verticalScale,
  horizontalScale,
  isIOS,
} from '../utils/responsive';

// ── Navigation Types ──────────────────────────────────────
type RootStackParamList = {
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

const CalendarIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="1.5" />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
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

const MailOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path
      d="M3 7L12 13L21 7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
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

// ── Main Component ──────────────────────────────────
export const BeneficiarySetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<any>();
  const pendingRoles = route.params?.pendingRoles || [];
  const selectedRoles = route.params?.selectedRoles || [];
  const collectedRolesData = route.params?.collectedRolesData || [];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const zipCodeInputRef = useRef<TextInput>(null);

  const calculateAge = (dobString?: string): number | null => {
    if (!dobString) return null;
    let dobDate: Date;
    const parts = dobString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      dobDate = new Date(year, month, day);
    } else {
      dobDate = new Date(dobString);
    }
    if (isNaN(dobDate.getTime())) return null;
    let age = new Date().getFullYear() - dobDate.getFullYear();
    const m = new Date().getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && new Date().getDate() < dobDate.getDate())) {
      age--;
    }
    return age;
  };

  const getDisplayDob = (dobString?: string) => {
    if (!dobString) return '';
    const parts = dobString.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year.length === 4) {
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
      }
    }
    const d = new Date(dobString);
    if (isNaN(d.getTime())) return dobString;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const getDatePickerDate = (dobString?: string): Date => {
    if (!dobString) return new Date(2000, 0, 1);
    const parts = dobString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    const d = new Date(dobString);
    return isNaN(d.getTime()) ? new Date(2000, 0, 1) : d;
  };

  const initialDob = route.params?.date_of_birth || route.params?.dob || '';
  const initialAge = route.params?.userAge ?? (initialDob ? calculateAge(initialDob) : null);
  const [userAge, setUserAge] = useState<number | null>(initialAge);
  const [dob, setDob] = useState(initialDob);
  const is18Plus = userAge !== null && userAge >= 18;
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleDateConfirm = (selectedDate: Date) => {
    setIsDatePickerOpen(false);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDOB = `${year}-${month}-${day}`;
    
    const computedAge = calculateAge(formattedDOB);
    if (computedAge !== null && computedAge < 14) {
      Toast.show({
        type: 'error',
        text1: 'Age Restriction',
        text2: 'You must be at least 14 years old.',
      });
      return;
    }

    setDob(formattedDOB);
    setUserAge(computedAge);
    if (errors.dob) {
      setErrors(prev => ({ ...prev, dob: '' }));
    }
  };

  const [governmentId, setGovernmentId] = useState<string | null>(null);
  const [showGovernmentIdModal, setShowGovernmentIdModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ uri: string; title: string } | null>(null);

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFileName = (uri: string | null, fallback: string) => {
    if (!uri) return fallback;
    const name = uri.split('/').pop();
    if (!name) return fallback;
    return name.length > 22 ? `${name.substring(0, 16)}...${name.split('.').pop() || 'jpg'}` : name;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authApi.getProfile();
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setEmail(profile.email || '');
        if (profile.phone) {
          const digits = profile.phone.replace('+1', '');
          setPhoneNumber(digits);
        }
        const profileDob = profile.date_of_birth || (profile as any).dob;
        if (profileDob) {
          setDob(profileDob);
          const computedAge = calculateAge(profileDob);
          if (computedAge !== null) {
            setUserAge(computedAge);
          }
        }
        if (profile.profile_image_url) {
          setProfilePhoto(profile.profile_image_url);
        }
      } catch (error) {
        // Handle error or ignore
      }
    };
    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
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

    if (!dob || !dob.trim()) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const age = calculateAge(dob);
      if (age !== null && age < 14) {
        newErrors.dob = 'You must be at least 14 years old';
      }
    }

    if (is18Plus && !governmentId) {
      newErrors.governmentId = 'Government ID photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (validate()) {
      try {
        setIsSubmitting(true);

        const currentRoleData = {
          role: 'beneficiary',
          profile: {
            first_name: firstName,
            last_name: lastName,
            phone: `+1${phoneNumber.replace(/\D/g, '')}`,
            email: email,
            profile_image: profilePhoto || '',
            zip_code: zipCode,
            dob: dob || '',
            government_id: governmentId,
            manual_verification: false,
          }
        };

        const formData = new FormData();
        formData.append('role', 'beneficiary');
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('phone', `+1${phoneNumber.replace(/\D/g, '')}`);
        formData.append('zip_code', zipCode);
        formData.append('dob', dob || '');
        formData.append('manual_verification', 'false');
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
        enableResetScrollToCoords={false}>
          
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
              Beneficiary Setup
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
          <View style={styles.formSection}>
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
            <View style={styles.phoneInputWrapper}>
              <View style={styles.labelRow}>
                <AppText variant="labelMedium" color={Colors.neutral[900]} style={{marginBottom: Spacing.xs}}>
                  Phone number
                </AppText>
                <TouchableOpacity 
                  style={{marginLeft: 6, marginBottom: Spacing.xs}}
                  onPress={() => setShowPhoneInfo(!showPhoneInfo)}
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
                <View style={styles.tooltipContainer}>
                  {/* Left pointing triangle */}
                  <View style={styles.tooltipTriangle} />
                  <AppText variant="caption" color={Colors.neutral[800]} style={{lineHeight: 18}}>
                    We use your phone number to verify your identity and enable important safety notifications.
                  </AppText>
                </View>
              )}
            </View>

            {/* Date of Birth Input */}
            <View style={{ marginBottom: Spacing.md, position: 'relative' }}>
              <Input
                label="Date of birth"
                placeholder="MM/DD/YYYY"
                leftIcon={<CalendarIcon size={20} color={Colors.primary[500]} />}
                value={getDisplayDob(dob)}
                editable={false}
                error={errors.dob}
              />
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setIsDatePickerOpen(true);
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 10,
                  elevation: 10,
                }}
              />
            </View>

            <Input
              ref={zipCodeInputRef}
              label="ZIP Code"
              placeholder="Enter ZIP code"
              leftIcon={<LocationPinIcon />}
              value={zipCode}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, '').slice(0, 5);
                setZipCode(numeric);
                if (errors.zipCode) setErrors({...errors, zipCode: ''});
              }}
              keyboardType="number-pad"
              maxLength={5}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              error={errors.zipCode}
            />

            {/* Government ID Photo (Required for Ages 18+) */}
            {is18Plus && (
              <View style={{ marginTop: verticalScale(16) }}>
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
                          onPress={() => setShowGovernmentIdModal(true)}
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
                      onPress={() => setShowGovernmentIdModal(true)}
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

            {/* Additional Notes (Multiline) */}
            {/* <View style={{ marginBottom: Spacing.lg }}>
              <AppText variant="labelMedium" color={Colors.neutral[900]} style={{marginBottom: Spacing.xs}}>
                Additional Notes (Optional)
              </AppText>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Tell us anything we should know"
                  placeholderTextColor={Colors.neutral[400]}
                  multiline
                  maxLength={300}
                  value={notes}
                  onChangeText={setNotes}
                />
                <AppText variant="caption" color={Colors.neutral[400]} style={styles.charCount}>
                  {notes.length}/300
                </AppText>
              </View>
            </View> */}
          </View>

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

        <DatePickerModal
          open={isDatePickerOpen}
          date={getDatePickerDate(dob)}
          mode="date"
          maximumDate={new Date()}
          onConfirm={handleDateConfirm}
          onCancel={() => setIsDatePickerOpen(false)}
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
    marginTop: verticalScale(0),
  },
  title: {
    marginTop: verticalScale(16),
  },
  subtitle: {
    marginTop: verticalScale(8),
  },
  sectionContainer: {
    marginTop: verticalScale(32),
    marginBottom: verticalScale(24),
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
  formSection: {
    marginBottom: verticalScale(8),
    marginTop: verticalScale(20),
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
    top: 32,
    left: 0,
    right: 0,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.md,
    elevation: 4,
    zIndex: 20,
  },
  tooltipTriangle: {
    position: 'absolute',
    top: -10,
    left: 130,
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
  textAreaContainer: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral[0],
    minHeight: verticalScale(100),
    padding: Spacing.md,
  },
  textArea: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.neutral[900],
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: Spacing.lg, // Space for the char count
  },
  charCount: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.md,
  },
  spacer: {
    flex: 1,
    minHeight: verticalScale(32),
  },
  continueButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
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
