import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  PanResponder,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path, Circle, Rect, Polyline} from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';

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
  color = Colors.primary[500],
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

const CustomSlider = ({ value, onValueChange, min = 0, max = 100 }: { value: number, onValueChange: (val: number) => void, min?: number, max?: number }) => {
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
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
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

  const [firstName, setFirstName] = useState('');
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
        setCategories(cats || []);
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

    if (selectedCategories.length === 0) {
      newErrors.category = 'Please select at least one category';
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
          location: {
            address: 'mnmnmn',
            latitude: 0.90,
            longitude: 0.80,
            zip_code: zipCode
          }
        }
      };

      try {
        setIsSubmitting(true);
        await authApi.saveRoleProfile({
          role_profile: {
            selected_roles: selectedRoles,
            roles: [currentRoleData],
          }
        });

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
          navigation.navigate('Success' as any, { selectedRoles });
        }
      } catch (error: any) {
        Alert.alert('Error', error?.message || 'Failed to save profile');
      } finally {
        setIsSubmitting(false);
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
            {/* <UpliftLogo size={moderateScale(0.8, 0.3)} /> */}
            <AppText variant="h2" center color={Colors.primary[900]} style={styles.title}>
              Volunteer Setup
            </AppText>
            <AppText
              variant="bodyMedium"
              center
              color={Colors.neutral[500]}
              style={styles.subtitle}>
              let's setup Volunteer profile
            </AppText>
          </View>


          {/* Form Fields */}
          <View style={styles.sectionContainer}>
            {/* Name Row */}
              <View style={styles.nameColumn}>
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
              </View>
              <View style={styles.nameSpacer} />
              <View style={styles.nameColumn}>
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
            />

            {/* Phone Number with Tooltip */}
            <View style={styles.phoneInputWrapper}>
              <View style={styles.labelRow}>
                <AppText variant="labelMedium" color={Colors.neutral[700]} style={{marginBottom: Spacing.xs}}>
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
              label="ZIP Code (Home Location)"
              placeholder="Enter your home ZIP code"
              leftIcon={<LocationPinIcon />}
              value={zipCode}
              onChangeText={(text) => {
                setZipCode(text);
                if (errors.zipCode) setErrors({...errors, zipCode: ''});
              }}
              keyboardType="number-pad"
              error={errors.zipCode}
            />

            <View style={{ marginBottom: Spacing.lg }}>
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
            </View>

            <Input
              label="Community Service Hours Goal per Week (Optional)"
              placeholder="Enter number of hours (e.g., 2)"
              leftIcon={<ClockIcon />}
              rightIcon={<AppText variant="caption" color={Colors.neutral[500]}>hrs/week</AppText>}
              value={hours}
              onChangeText={setHours}
              keyboardType="number-pad"
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
                  <TouchableOpacity style={{marginLeft: 6}}>
                    <InfoCircleIcon size={16} color={Colors.primary[500]} />
                  </TouchableOpacity>
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
              
              <CustomSlider value={radiusWithin} onValueChange={setRadiusWithin} min={5} max={50} />
              
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
              
              <CustomSlider value={radiusOutside} onValueChange={setRadiusOutside} min={5} max={50} />
              
              <View style={styles.sliderLimitsRow}>
                <AppText variant="caption" color={Colors.neutral[500]}>5 miles</AppText>
                <AppText variant="caption" color={Colors.neutral[500]}>50 miles</AppText>
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
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

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
    height: 20,
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    width: '100%',
  },
  sliderFill: {
    height: 4,
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.neutral[0],
    borderWidth: 2,
    borderColor: Colors.primary[500],
    marginLeft: -8, // Center thumb
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
});
