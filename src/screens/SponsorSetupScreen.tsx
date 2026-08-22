import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path, Circle, Rect, Polyline} from 'react-native-svg';

import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {UpliftLogo} from '../components/UpliftLogo';
import {authApi} from '../api';
import {Colors} from '../theme/colors';
import {BorderRadius, Spacing} from '../theme/spacing';
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
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShieldCheckIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12L11 14L15 10"
      stroke={color}
      strokeWidth="1.5"
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

// ── Components ───────────────────────────────────────────
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

// ── Main Component ───────────────────────────────────────
export const SponsorSetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [anonymity, setAnonymity] = useState<'show' | 'hide'>('show');
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const route = useRoute<any>();
  const pendingRoles = route.params?.pendingRoles || [];
  const selectedRoles = route.params?.selectedRoles || [];
  const collectedRolesData = route.params?.collectedRolesData || [];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (validate()) {
      const currentRoleData = {
        role: 'sponsor',
        profile: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: `+1${phoneNumber.replace(/\D/g, '')}`,
          anonymous: anonymity === 'hide',
        }
      };
      const newCollectedRolesData = [...collectedRolesData, currentRoleData];

      if (pendingRoles.length > 0) {
        const nextRoles = [...pendingRoles];
        const nextRole = nextRoles.shift();
        const routeParams = {
          pendingRoles: nextRoles,
          selectedRoles,
          collectedRolesData: newCollectedRolesData,
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
        try {
          setIsSubmitting(true);
          await authApi.saveRoleProfile({
            role_profile: {
              selected_roles: selectedRoles,
              roles: newCollectedRolesData,
            }
          });
          navigation.navigate('Success' as any, { selectedRoles });
        } catch (error: any) {
          Alert.alert('Error', error?.message || 'Failed to save profiles');
        } finally {
          setIsSubmitting(false);
        }
      }
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
            {/* <UpliftLogo size={moderateScale(0.8, 0.3)} /> */}
            <AppText variant="h2" center color={Colors.primary[900]} style={styles.title}>
              Sponsor Setup
            </AppText>
            <AppText
              variant="bodyMedium"
              center
              color={Colors.neutral[500]}
              style={styles.subtitle}>
              let's setup Sponsor profile
            </AppText>
          </View>

          {/* Encryption Banner */}
          <View style={styles.bannerContainer}>
            <ShieldCheckIcon size={20} color={Colors.primary[600]} />
            <AppText variant="caption" color={Colors.neutral[800]} style={styles.bannerText}>
              We use industry-standard encryption to keep your information secure.
            </AppText>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Input
              label="First Name"
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
              label="Last Name"
              placeholder="Enter your last name"
              leftIcon={<UserOutlineIcon />}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) setErrors({...errors, lastName: ''});
              }}
              error={errors.lastName}
            />

            <Input
              label="Email Address"
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
            />

            <Input
              label="Phone number"
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
            />
          </View>

          {/* Anonymity Preference Section */}
          <View style={styles.anonymitySection}>
            <AppText variant="labelLarge" color={Colors.neutral[900]} weight="bold" style={styles.sectionLabel}>
              Anonymity Preference
            </AppText>

            <View style={styles.radioGroup}>
              <RadioCard
                title="Show my name"
                description="Display my name on the platform"
                isSelected={anonymity === 'show'}
                onPress={() => setAnonymity('show')}
              />
              <RadioCard
                title="Remain anonymous"
                description="Hide my name from others"
                isSelected={anonymity === 'hide'}
                onPress={() => setAnonymity('hide')}
              />
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
            loading={isSubmitting}
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
  },
  subtitle: {
    marginTop: verticalScale(8),
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: BorderRadius.md,
    marginTop: verticalScale(24),
    marginBottom: verticalScale(24),
  },
  bannerText: {
    marginLeft: horizontalScale(12),
    flex: 1,
    lineHeight: fontScale(18),
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
  formSection: {
    marginBottom: verticalScale(8),
  },
  anonymitySection: {
    marginTop: verticalScale(8),
  },
  sectionLabel: {
    marginBottom: verticalScale(12),
  },
  radioGroup: {
    gap: verticalScale(12),
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[0],
  },
  radioCardSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  radioIconContainer: {
    marginRight: horizontalScale(16),
  },
  radioTextContainer: {
    flex: 1,
    justifyContent: 'center',
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
