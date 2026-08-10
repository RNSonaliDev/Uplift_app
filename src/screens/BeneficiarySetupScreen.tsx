import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path, Circle, Rect, Polyline} from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';

import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {UpliftLogo} from '../components/UpliftLogo';
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
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.neutral[400],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PhoneOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = Colors.neutral[400],
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
  color = Colors.neutral[400],
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

const CalendarIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.neutral[400],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 2V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 2V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 14H8.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 14H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 14H16.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 18H8.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 18H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 18H16.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Custom Components ──────────────────────────────────
const PhonePrefixPrefix = () => (
  <View style={styles.phonePrefixContainer}>
    <PhoneOutlineIcon size={18} color={Colors.neutral[500]} />
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneDigits.length < 10) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits';
    }

    if (!dob.trim()) newErrors.dob = 'Date of birth is required';

    const zipDigits = zipCode.replace(/\D/g, '');
    if (!zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (zipDigits.length !== 5) {
      newErrors.zipCode = 'ZIP code must be 5 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const route = useRoute<any>();
  const pendingRoles = route.params?.pendingRoles || [];

  const handleContinue = () => {
    if (validate()) {
      if (pendingRoles.length > 0) {
        const nextRoles = [...pendingRoles];
        const nextRole = nextRoles.shift();
        
        if (nextRole === 'volunteer') {
          navigation.navigate('VolunteerSetup' as any, { pendingRoles: nextRoles });
        } else if (nextRole === 'organization') {
          navigation.navigate('OrganizationSetup' as any, { pendingRoles: nextRoles });
        } else if (nextRole === 'sponsor') {
          navigation.navigate('SponsorSetup' as any, { pendingRoles: nextRoles });
        } else if (nextRole === 'beneficiary') {
          navigation.navigate('BeneficiarySetup' as any, { pendingRoles: nextRoles });
        }
      } else {
        navigation.navigate('Success' as any);
      }
    }
  };

  // Info tooltip visibility
  const [showPhoneInfo, setShowPhoneInfo] = useState(false);

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={isIOS ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Header with Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <BackArrowIcon size={moderateScale(24)} />
          </TouchableOpacity>

          {/* Logo & Title */}
          <View style={styles.headerSection}>
            <UpliftLogo size={moderateScale(0.8, 0.3)} />
            <AppText variant="h2" center color={Colors.primary[900]} style={styles.title}>
              Beneficiary setup
            </AppText>
            <AppText
              variant="bodyMedium"
              center
              color={Colors.neutral[500]}
              style={styles.subtitle}>
              Tell us a little more so we can{'\n'}connect you with the right help.
            </AppText>
          </View>

          {/* Profile Photo Section */}
          <View style={styles.sectionContainer}>
            <AppText variant="labelLarge" color={Colors.primary[900]} weight="bold" style={styles.sectionLabel}>
              Profile photo
            </AppText>
            <View style={styles.photoUploadContainer}>
              <TouchableOpacity style={styles.photoCircle} onPress={handleSelectPhoto}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.photoImage} />
                ) : (
                  <CameraIcon />
                )}
              </TouchableOpacity>
              <View style={styles.photoTextContainer}>
                <AppText variant="bodySmall" color={Colors.neutral[900]}>
                  Add a clear photo of yourself{'\n'}so others can recognize you.
                </AppText>
                <TouchableOpacity style={{marginTop: 8}} onPress={handleSelectPhoto}>
                  <AppText variant="labelMedium" color={Colors.primary[600]} weight="bold">
                    {profilePhoto ? 'Change Photo' : 'Add Photo'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Input
              label="First name"
              placeholder="Enter your first name"
              leftIcon={<UserOutlineIcon />}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) setErrors({...errors, firstName: ''});
              }}
              error={errors.firstName}
            />

            <Input
              label="Last name"
              placeholder="Enter your last name"
              leftIcon={<UserOutlineIcon />}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) setErrors({...errors, lastName: ''});
              }}
              error={errors.lastName}
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
                placeholder="(201) 555-0123"
                leftIcon={<PhonePrefixPrefix />}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (errors.phoneNumber) setErrors({...errors, phoneNumber: ''});
                }}
                keyboardType="phone-pad"
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

            <Input
              label="Date of Birth"
              placeholder="MM / DD / YYYY"
              leftIcon={<CalendarIcon />}
              rightIcon={<CalendarIcon color={Colors.neutral[500]} />}
              value={dob}
              onChangeText={(text) => {
                setDob(text);
                if (errors.dob) setErrors({...errors, dob: ''});
              }}
              keyboardType="number-pad"
              error={errors.dob}
            />

            <Input
              label="ZIP Code"
              placeholder="Enter ZIP code"
              leftIcon={<LocationPinIcon />}
              value={zipCode}
              onChangeText={(text) => {
                setZipCode(text);
                if (errors.zipCode) setErrors({...errors, zipCode: ''});
              }}
              keyboardType="number-pad"
              error={errors.zipCode}
            />

            {/* Additional Notes (Multiline) */}
            <View style={{ marginBottom: Spacing.lg }}>
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
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Continue Button */}
          <Button
            title="Continue"
            color="primary"
            size="lg"
            fullWidth
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    fontSize: fontScale(24),
  },
  subtitle: {
    marginTop: verticalScale(8),
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
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
    right: 0,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.md,
    elevation: 4,
    zIndex: 20,
    width: 240,
  },
  tooltipTriangle: {
    position: 'absolute',
    top: 18,
    left: -10,
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
});
