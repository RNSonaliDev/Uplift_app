import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path, Circle, Rect, G} from 'react-native-svg';
import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {UpliftLogo} from '../components/UpliftLogo';
import {Colors} from '../theme/colors';
import {FontFamily} from '../theme/typography';
import {Spacing, BorderRadius} from '../theme/spacing';
import {
  moderateScale,
  fontScale,
  verticalScale,
  horizontalScale,
} from '../utils/responsive';

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

const CheckCircleFilled: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="12" fill={color} />
    <Path
      d="M7 12L10.5 15.5L18 8"
      stroke={Colors.neutral[0]}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CircleOutline: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.neutral[200],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1.5" />
  </Svg>
);

const BeneficiaryIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C12 21 4 14.5 4 8.5C4 5.5 6.5 3 9.5 3C11.2 3 12 4 12 4C12 4 12.8 3 14.5 3C17.5 3 20 5.5 20 8.5C20 14.5 12 21 12 21Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 10.5C9.5 11.5 10 12 11.5 13.5L14.5 10.5M10 15L15 10"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const VolunteerIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C12 21 4 14.5 4 8.5C4 5.5 6.5 3 9.5 3C11.2 3 12 4 12 4C12 4 12.8 3 14.5 3C17.5 3 20 5.5 20 8.5C20 14.5 12 21 12 21Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OrganizationIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21H21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 21V7L12 3L19 7V21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 21V16C9 15.4477 9.44772 15 10 15H14C14.5523 15 15 15.4477 15 16V21"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="9" r="1.5" fill={color} />
  </Svg>
);

const SponsorIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 14.5C12 14.5 7 9.5 7 6.5C7 4.5 8.5 3 10.5 3C11.5 3 12 3.5 12 3.5C12 3.5 12.5 3 13.5 3C15.5 3 17 4.5 17 6.5C17 9.5 12 14.5 12 14.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 16C5 16 7 15 9 15L11 17L14 15L21 17L20 21H4V18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShieldInfoIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
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
      d="M12 16V12"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="8" r="1" fill={color} />
  </Svg>
);

// ── Role Card Component ──────────────────────────────────

type RoleType = 'beneficiary' | 'volunteer' | 'organization' | 'sponsor';

interface RoleCardProps {
  type: RoleType;
  title: string;
  description: string;
  isSelected: boolean;
  onToggle: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  type,
  title,
  description,
  isSelected,
  onToggle,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'beneficiary':
        return <BeneficiaryIcon size={moderateScale(28)} />;
      case 'volunteer':
        return <VolunteerIcon size={moderateScale(28)} />;
      case 'organization':
        return <OrganizationIcon size={moderateScale(28)} />;
      case 'sponsor':
        return <SponsorIcon size={moderateScale(28)} />;
    }
  };

  return (
    <Pressable
      style={[
        styles.roleCard,
        isSelected && styles.roleCardSelected,
      ]}
      onPress={onToggle}>
      <View style={styles.roleCardHeader}>
        <View style={styles.roleIconContainer}>{getIcon()}</View>
        <View style={styles.checkIconContainer}>
          {isSelected ? (
            <CheckCircleFilled size={moderateScale(22)} />
          ) : (
            <CircleOutline size={moderateScale(22)} />
          )}
        </View>
      </View>
      <AppText variant="h5" color={Colors.neutral[900]} style={styles.roleTitle}>
        {title}
      </AppText>
      <AppText
        variant="caption"
        color={Colors.neutral[500]}
        style={styles.roleDescription}>
        {description}
      </AppText>
    </Pressable>
  );
};

// ── Main Component ──────────────────────────────────

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Welcome: undefined;
  CreateAccount: undefined;
  VerifyAccount: { emailOrPhone: string };
  SelectRoles: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export const SelectRolesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);

  const toggleRole = (role: RoleType) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      }
      return [...prev, role];
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* Header with Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <BackArrowIcon size={moderateScale(24)} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoSection}>
          <UpliftLogo size={moderateScale(0.9, 0.3)} />
        </View>

        {/* Title & Subtitle */}
        <AppText variant="h2" center style={styles.title}>
          Select your roles
        </AppText>
        <AppText
          variant="bodyMedium"
          center
          color={Colors.neutral[500]}
          style={styles.subtitle}>
          Choose one or more roles. You'll complete{'\n'}the setup for each
          selected role one at a time.
        </AppText>

        {/* Roles Grid */}
        <View style={styles.rolesGrid}>
          <RoleCard
            type="beneficiary"
            title="Beneficiary"
            description="Request help with shopping and groceries."
            isSelected={selectedRoles.includes('beneficiary')}
            onToggle={() => toggleRole('beneficiary')}
          />
          <RoleCard
            type="volunteer"
            title="Volunteer"
            description="Support people in your community."
            isSelected={selectedRoles.includes('volunteer')}
            onToggle={() => toggleRole('volunteer')}
          />
          <RoleCard
            type="organization"
            title="Organization"
            description="Create internships and community events."
            isSelected={selectedRoles.includes('organization')}
            onToggle={() => toggleRole('organization')}
          />
          <RoleCard
            type="sponsor"
            title="Sponsor"
            description="Fund community support and grocery assistance."
            isSelected={selectedRoles.includes('sponsor')}
            onToggle={() => toggleRole('sponsor')}
          />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <ShieldInfoIcon size={moderateScale(28)} />
          <AppText
            variant="caption"
            color={Colors.neutral[600]}
            style={styles.infoText}>
            If you select multiple roles, we'll guide you through each setup
            individually. Shared information will be filled automatically where
            possible.
          </AppText>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Continue Button */}
        <Button
          title="Continue"
          color="primary"
          size="lg"
          fullWidth
          onPress={() => {
            if (selectedRoles.length === 0) return;
            const roles = [...selectedRoles];
            const firstRole = roles.shift();
            const pendingRoles = roles;
            
            if (firstRole === 'volunteer') {
              navigation.navigate('VolunteerSetup' as any, { pendingRoles });
            } else if (firstRole === 'organization') {
              navigation.navigate('OrganizationSetup' as any, { pendingRoles });
            } else if (firstRole === 'sponsor') {
              navigation.navigate('SponsorSetup' as any, { pendingRoles });
            } else if (firstRole === 'beneficiary') {
              navigation.navigate('BeneficiarySetup' as any, { pendingRoles });
            }
          }}
          disabled={selectedRoles.length === 0}
          style={styles.continueButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(24),
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: verticalScale(8),
    padding: moderateScale(4),
  },
  logoSection: {
    alignItems: 'center',
    marginTop: verticalScale(0),
  },
  title: {
    marginTop: verticalScale(16),
    fontSize: fontScale(26),
  },
  subtitle: {
    marginTop: verticalScale(8),
    fontSize: fontScale(13),
    lineHeight: fontScale(19),
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: verticalScale(24),
    gap: verticalScale(12),
  },
  roleCard: {
    width: '48%',
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: moderateScale(16),
  },
  roleCardSelected: {
    borderColor: Colors.primary[500],
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  checkIconContainer: {
    marginTop: -moderateScale(4),
    marginRight: -moderateScale(4),
  },
  roleTitle: {
    fontFamily: FontFamily.semiBold,
    marginBottom: verticalScale(4),
  },
  roleDescription: {
    lineHeight: fontScale(16),
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    padding: moderateScale(16),
    marginTop: verticalScale(24),
  },
  infoText: {
    marginLeft: moderateScale(12),
    flex: 1,
    lineHeight: fontScale(18),
  },
  spacer: {
    flex: 1,
    minHeight: verticalScale(24),
  },
  continueButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
  },
});
