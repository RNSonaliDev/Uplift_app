import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path, Circle, Rect, Polyline} from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';

import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {UpliftLogo} from '../components/UpliftLogo';
import {button_user} from '../assets/images';
import {authApi} from '../api';
import {Colors} from '../theme/colors';
import {persistAuthToken} from '../api/client';
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
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronDownIcon: React.FC<{size?: number; color?: string}> = ({
  size = 16,
  color = Colors.neutral[600],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="6 9 12 15 18 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LocationPinIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="10"
      r="3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CameraIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="13"
      r="4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoCircleIcon: React.FC<{size?: number; color?: string}> = ({
  size = 18,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <Path
      d="M12 16V12"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
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
export const CreateProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateProfile'>>();
  const verificationToken = route.params?.verificationToken;
  const emailOrPhone = route.params?.emailOrPhone || '';
  
  const isEmail = emailOrPhone.includes('@');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(isEmail ? emailOrPhone : '');
  const [phoneNumber, setPhoneNumber] = useState(!isEmail ? emailOrPhone.replace('+1', '') : '');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Info tooltip visibility
  const [showPhoneInfo, setShowPhoneInfo] = useState(false);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneDigits.length < 10) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    // Validation
    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('email', email);
      formData.append('phone', `+1${phoneNumber}`);
      formData.append('country_code', 'US');
      
      if (profilePhoto) {
        formData.append('profile_image', {
          uri: profilePhoto,
          type: 'image/jpeg',
          name: 'profile.jpg',
        } as any);
      } else {
        formData.append('profile_image', '');
      }

      if (!verificationToken) {
        throw new Error('Verification token is missing');
      }

      const response = await authApi.register(formData, verificationToken);
      
      console.log('register response', response);
      const token = response?.access_token
      console.log('register token', token);
      if (token) {
        await persistAuthToken(token);
      }
      
      navigation.navigate('SelectRoles');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to create profile'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    
    if (result.assets && result.assets.length > 0) {
      setProfilePhoto(result.assets[0].uri || null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={isIOS ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          <TouchableWithoutFeedback onPress={() => {
            if (showPhoneInfo) setShowPhoneInfo(false);
          }}>
            <View style={{flex: 1}}>
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
                  Create Your Profile
                </AppText>
                <AppText
                  variant="bodyMedium"
                  center
                  color={Colors.neutral[500]}
                  style={styles.subtitle}>
                  Tell us a little about yourself. This helps us{'\n'}personalize your experience and keep you safe.
                </AppText>
              </View>

              {/* Profile Photo Section */}
              <View style={styles.sectionContainer}>
                <AppText variant="labelLarge" color={Colors.primary[900]} weight="bold" style={styles.sectionLabel}>
                  Profile Photo
                </AppText>
                <View style={styles.photoUploadContainer}>
                  <TouchableOpacity style={styles.photoCircle} onPress={handleSelectPhoto}>
                    {profilePhoto ? (
                      <Image source={{ uri: profilePhoto }} style={styles.photoImage} />
                    ) : (
                      <Image source={button_user} style={styles.photoImage} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.photoTextContainer}>
                    <AppText variant="bodySmall" color={Colors.neutral[700]}>
                      Add a clear photo of yourself{'\n'}so others can recognize you.
                    </AppText>
                    <TouchableOpacity style={{marginTop: 8}} onPress={handleSelectPhoto}>
                      <AppText variant="labelMedium" color={Colors.primary[500]} weight="bold">
                        {profilePhoto ? 'Change Photo' : 'Add Photo'}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Form Fields */}
              <View style={styles.sectionContainer}>
                  <View style={styles.nameColumn}>
                    <Input
                      label="First name"
                      placeholder="Enter first name"
                      leftIcon={<UserOutlineIcon />}
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (errors.firstName) setErrors({...errors, firstName: ''});
                      }}
                      error={errors.firstName}
                    />
                  </View>
                  <View style={styles.nameSpacer} />
                  <View style={styles.nameColumn}>
                    <Input
                      label="Last name"
                      placeholder="Enter last name"
                      leftIcon={<UserOutlineIcon />}
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        if (errors.lastName) setErrors({...errors, lastName: ''});
                      }}
                      error={errors.lastName}
                    />
                  </View>

                <Input
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
                  error={errors.email}
                  disabled={isEmail}
                />

                {/* Phone Number with Tooltip */}
                <View style={styles.phoneInputWrapper}>
                  <View style={styles.labelRow}>
                    <AppText variant="labelMedium" color={errors.phoneNumber ? Colors.error : Colors.neutral[700]} style={{marginBottom: Spacing.xs}}>
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
                    placeholder="(201) 555-0123"
                    leftIcon={<PhonePrefixPrefix />}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      if (errors.phoneNumber) setErrors({...errors, phoneNumber: ''});
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                    error={errors.phoneNumber}
                    disabled={!isEmail}
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
              </View>

              {/* Spacer */}
              <View style={styles.spacer} />

              {/* Save & Continue Button */}
              <Button
                title="Save & Continue"
                color="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                onPress={handleSaveAndContinue}
                style={styles.continueButton}
              />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
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
  sectionHeader: {
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
    right: 0,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.md,
    elevation: 4,
    zIndex: 20,
    width: 240, // Fixed width for natural wrapping
  },
  tooltipTriangle: {
    position: 'absolute',
    top: 18,
    left: -10, // Pointing left, sticking out of the container
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: Colors.neutral[0],
  },
  spacer: {
    flex: 1,
    minHeight: verticalScale(32),
  },
  continueButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
  },
});
