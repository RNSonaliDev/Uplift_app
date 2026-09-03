import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
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
  color = Colors.primary[900],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

const BuildingOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 21V5C6 4.44772 6.44772 4 7 4H17C17.5523 4 18 4.44772 18 5V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3 21H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M10 21V17C10 16.4477 10.4477 16 11 16H13C13.5523 16 14 16.4477 14 17V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M10 8H10.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 8H14.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M10 12H10.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 12H14.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

const ORGANIZATION_TYPES = [
  'school',
  'company',
  'volunteer_center',
  'nonprofit',
  'government',
  'other',
];

const formatType = (type: string) => {
  if (!type) return '';
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ── Main Component ───────────────────────────────────────
export const OrganizationSetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  const [orgType, setOrgType] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  
  const [isTypeModalVisible, setTypeModalVisible] = useState(false);
  
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authApi.getProfile();
        // The Organization Setup doesn't have an independent contactName mapping, 
        // but we can map first_name + last_name to contactName
        const contact = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        if (contact) {
          setContactName(contact);
        }
        setContactEmail(profile.email || '');
        if (profile.phone) {
          const digits = profile.phone.replace('+1', '');
          setContactPhone(digits);
        }
      } catch (error) {
        // Handle error or ignore
      }
    };
    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!orgType.trim()) newErrors.orgType = 'Organization type is required';
    if (!orgName.trim()) newErrors.orgName = 'Organization name is required';
    if (!orgAddress.trim()) newErrors.orgAddress = 'Organization address is required';
    if (!contactName.trim()) newErrors.contactName = 'Contact name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!orgEmail.trim()) {
      newErrors.orgEmail = 'Organization email is required';
    } else if (!emailRegex.test(orgEmail)) {
      newErrors.orgEmail = 'Please enter a valid email address';
    }

    if (!contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!emailRegex.test(contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    const phoneDigits = contactPhone.replace(/\D/g, '');
    if (!contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (phoneDigits.length < 10) {
      newErrors.contactPhone = 'Phone number must be at least 10 digits';
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
        role: 'organization',
        profile: {
          organization_type: orgType,
          organization_name: orgName,
          email: orgEmail,
          address: orgAddress,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: `+1${contactPhone.replace(/\D/g, '')}`,
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
          
          {/* Header with Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <BackArrowIcon size={moderateScale(24)} />
          </TouchableOpacity>

          {/* Logo & Title */}
          <View style={styles.headerSection}>
            <AppText variant="h2" center color={Colors.primary[900]} style={styles.title}>
              Organization Setup
            </AppText>
            <AppText
              variant="bodyMedium"
              center
              color={Colors.neutral[500]}
              style={styles.subtitle}>
              let's setup Organization profile
            </AppText>
          </View>

          {/* Encryption Banner */}
          <View style={styles.bannerContainer}>
            <ShieldCheckIcon size={20} color={Colors.primary[600]} />
            <AppText variant="caption" color={Colors.neutral[800]} style={styles.bannerText}>
              We use industry-standard encryption to keep your information secure.
            </AppText>
          </View>

          {/* Organization Form Fields */}
          <View style={styles.formSection}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setTypeModalVisible(true)}>
              <View pointerEvents="none">
                <Input
                  label="Organization Type"
                  placeholder="Select organization type"
                  value={formatType(orgType)}
                  editable={false}
                  rightIcon={<ChevronDownIcon size={20} />}
                  error={errors.orgType}
                />
              </View>
            </TouchableOpacity>

            <Input
              label="Organization Name"
              placeholder="Enter organization name"
              leftIcon={<BuildingOutlineIcon />}
              value={orgName}
              onChangeText={(text) => {
                setOrgName(text);
                if (errors.orgName) setErrors({...errors, orgName: ''});
              }}
              error={errors.orgName}
            />

            <Input
              label="Organization Email"
              placeholder="Enter organization email"
              leftIcon={<MailOutlineIcon />}
              value={orgEmail}
              onChangeText={(text) => {
                setOrgEmail(text);
                if (errors.orgEmail) setErrors({...errors, orgEmail: ''});
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.orgEmail}
            />

            <Input
              label="Organization Address"
              placeholder="Enter organization address"
              leftIcon={<LocationPinIcon />}
              value={orgAddress}
              onChangeText={(text) => {
                setOrgAddress(text);
                if (errors.orgAddress) setErrors({...errors, orgAddress: ''});
              }}
              error={errors.orgAddress}
            />
          </View>

          {/* Primary Contact Section */}
          <View style={styles.contactSection}>
            <AppText variant="h3" color={Colors.primary[900]} weight="bold" style={styles.sectionHeader}>
              Primary Contact
            </AppText>

            <Input
              label="Contact Name"
              placeholder="Enter contact name"
              leftIcon={<UserOutlineIcon />}
              value={contactName}
              onChangeText={(text) => {
                setContactName(text);
                if (errors.contactName) setErrors({...errors, contactName: ''});
              }}
              error={errors.contactName}
            />

            <Input
              label="Contact Email"
              placeholder="Enter contact email"
              leftIcon={<MailOutlineIcon />}
              value={contactEmail}
              onChangeText={(text) => {
                setContactEmail(text);
                if (errors.contactEmail) setErrors({...errors, contactEmail: ''});
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.contactEmail}
            />

            <Input
              label="Contact Phone"
              placeholder="(201) 555-0198"
              leftIcon={<PhonePrefixPrefix />}
              value={contactPhone}
              onChangeText={(text) => {
                setContactPhone(text);
                if (errors.contactPhone) setErrors({...errors, contactPhone: ''});
              }}
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.contactPhone}
            />
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

      {/* Organization Type Picker Modal */}
      <Modal
        visible={isTypeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTypeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <AppText variant="h3" style={styles.modalHeader}>
              Select Organization Type
            </AppText>
            <FlatList
              data={ORGANIZATION_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setOrgType(item);
                    if (errors.orgType) setErrors({...errors, orgType: ''});
                    setTypeModalVisible(false);
                  }}
                >
                  <AppText
                    variant="bodyLarge"
                    color={orgType === item ? Colors.primary[500] : Colors.neutral[800]}
                    weight={orgType === item ? 'bold' : 'regular'}
                  >
                    {formatType(item)}
                  </AppText>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  formSection: {
    marginBottom: verticalScale(8),
  },
  contactSection: {
    marginTop: verticalScale(8),
  },
  sectionHeader: {
    fontSize: fontScale(18),
    marginBottom: verticalScale(16),
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
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(24),
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    paddingVertical: verticalScale(16),
    maxHeight: '80%',
  },
  modalHeader: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalItem: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
});
