import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { ChevronLeft, Plus, ArrowRightLeft, Check } from 'lucide-react-native';

import { authApi } from '../api';
import { AppText } from '../components/AppText';
import { Colors } from '../theme/colors';
import { FontFamily } from '../theme/typography';
import { Spacing, BorderRadius } from '../theme/spacing';
import {
  moderateScale,
  fontScale,
  verticalScale,
  horizontalScale,
} from '../utils/responsive';

// ── Navigation Types ──────────────────────────────────────
type RootStackParamList = {
  BeneficiaryFlow: undefined;
  VolunteerFlow: undefined;
  DashboardRoleSelection: { selectedRoles: string[], currentRole?: string };
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
type DashboardRoleSelectionRouteProp = RouteProp<RootStackParamList, 'DashboardRoleSelection'>;

// ── Icon Components ──────────────────────────────────────
const BackArrowIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.primary[900],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BeneficiaryIcon: React.FC<{ size?: number; color?: string }> = ({
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

const VolunteerIcon: React.FC<{ size?: number; color?: string }> = ({
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

const OrganizationIcon: React.FC<{ size?: number; color?: string }> = ({
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

const SponsorIcon: React.FC<{ size?: number; color?: string }> = ({
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

// ── Dashboard Card Component ──────────────────────────────

interface DashboardCardProps {
  role: string;
  onPress: () => void;
  disabled?: boolean;
  isCurrent?: boolean;
  isCreated?: boolean;
  isSwitching?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  role,
  onPress,
  disabled,
  isCurrent,
  isCreated = true,
  isSwitching = false,
}) => {
  const getIcon = () => {
    const iconColor = Colors.primary[600];
    switch (role) {
      case 'beneficiary':
        return <BeneficiaryIcon size={moderateScale(26)} color={iconColor} />;
      case 'volunteer':
        return <VolunteerIcon size={moderateScale(26)} color={iconColor} />;
      case 'organization':
        return <OrganizationIcon size={moderateScale(26)} color={iconColor} />;
      case 'sponsor':
        return <SponsorIcon size={moderateScale(26)} color={iconColor} />;
      default:
        return <BeneficiaryIcon size={moderateScale(26)} color={iconColor} />;
    }
  };

  const getTitle = () => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getDescription = () => {
    switch (role) {
      case 'beneficiary':
        return 'Access support and request assistance.';
      case 'volunteer':
        return 'Find opportunities and log your hours.';
      case 'organization':
        return 'Manage events and coordinate volunteers.';
      case 'sponsor':
        return 'Review impact and manage contributions.';
      default:
        return 'Enter your dashboard.';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCurrent
          ? styles.cardCurrent
          : isCreated
          ? styles.cardAvailable
          : styles.cardNotCreated,
        (disabled || isSwitching) && !isCurrent && styles.cardLoading,
      ]}
      onPress={onPress}
      activeOpacity={isCurrent ? 1 : 0.75}
      disabled={disabled || isCurrent || isSwitching}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer} pointerEvents="none">
          {getIcon()}
        </View>
        {isCurrent && (
          <View style={styles.selectedBadge} pointerEvents="none">
            <Check color={Colors.primary[700]} size={11} strokeWidth={2.4} />
            <AppText variant="caption" style={styles.selectedBadgeText}>
              Selected Role
            </AppText>
          </View>
        )}
        {!isCurrent && isCreated && (
          <View style={styles.switchBadge} pointerEvents="none">
            {isSwitching ? (
              <ActivityIndicator size="small" color={Colors.primary[600]} style={{ transform: [{ scale: 0.7 }] }} />
            ) : (
              <ArrowRightLeft color={Colors.primary[600]} size={10} strokeWidth={2.2} />
            )}
            <AppText variant="caption" style={styles.switchBadgeText}>
              {isSwitching ? 'Switching...' : 'Switch Role'}
            </AppText>
          </View>
        )}
        {!isCreated && (
          <View style={styles.addRoleBadge} pointerEvents="none">
            <Plus color={Colors.primary[600]} size={11} strokeWidth={2.5} />
            <AppText variant="caption" style={styles.addRoleBadgeText}>
              Add Role
            </AppText>
          </View>
        )}
      </View>
      <AppText
        variant="h6"
        color={isCurrent ? Colors.neutral[700] : Colors.neutral[900]}
        style={styles.cardTitle}>
        {getTitle()} Dashboard
      </AppText>
      <AppText
        variant="caption"
        color={isCurrent ? Colors.neutral[400] : Colors.neutral[500]}
        style={styles.cardDescription}>
        {getDescription()}
      </AppText>
    </TouchableOpacity>
  );
};

// ── Main Component ────────────────────────────────────────

const ALL_ROLES = ['beneficiary', 'volunteer', 'organization', 'sponsor'];

export const DashboardRoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<DashboardRoleSelectionRouteProp>();
  const [profileData, setProfileData] = useState<any>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(route.params?.currentRole || null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authApi.getProfile();
        setProfileData(profile);
        if (!currentRole && profile.default_role) {
          setCurrentRole(profile.default_role);
        }
      } catch (e) {
        // ignore
      } finally {
        setIsFetchingProfile(false);
      }
    };
    fetchProfile();
  }, [currentRole]);

  const isRoleCreated = (roleKey: string): boolean => {
    const roleLower = roleKey.toLowerCase();
    
    // 1. Current active role is definitely created
    if (currentRole && currentRole.toLowerCase() === roleLower) return true;
    if (profileData?.default_role && profileData.default_role.toLowerCase() === roleLower) return true;

    // 2. Must exist in profileData.profiles with actual data
    if (
      profileData?.profiles &&
      profileData.profiles[roleLower] != null &&
      typeof profileData.profiles[roleLower] === 'object' &&
      Object.keys(profileData.profiles[roleLower]).length > 0
    ) {
      return true;
    }

    // 3. Pending roles are definitely NOT created
    const pendingRoles = ((profileData?.pending_roles || []) as any[]).map((r: any) =>
      typeof r === 'string' ? r.toLowerCase() : (r.role || r.name || '').toLowerCase()
    );
    if (pendingRoles.includes(roleLower)) {
      return false;
    }

    // 4. Must exist in profileData.roles with a valid non-empty profile object
    const roleObj = ((profileData?.roles || []) as any[]).find((r: any) => {
      if (!r) return false;
      if (typeof r === 'string') return r.toLowerCase() === roleLower;
      const name = (r.role || r.name || '').toLowerCase();
      return name === roleLower;
    });

    if (roleObj && typeof roleObj === 'object') {
      if (
        roleObj.profile != null &&
        typeof roleObj.profile === 'object' &&
        Object.keys(roleObj.profile).length > 0
      ) {
        return true;
      }
    }

    return false;
  };

  const handleRoleSelect = async (role: string) => {
    try {
      setIsLoading(true);
      setSwitchingRole(role);
      await authApi.setDefaultRole({ default_role: role });

      if (role === 'volunteer') {
        navigation.reset({ index: 0, routes: [{ name: 'VolunteerFlow' as any }] });
      } else if (role === 'sponsor') {
        navigation.reset({ index: 0, routes: [{ name: 'SponsorFlow' as any }] });
      } else if (role === 'organization') {
        navigation.reset({ index: 0, routes: [{ name: 'OrganizationFlow' as any }] });
      } else if (role === 'beneficiary') {
        navigation.reset({ index: 0, routes: [{ name: 'BeneficiaryFlow' as any }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'DashboardRoleSelection' as any }] });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to set default role.'
      });
    } finally {
      setIsLoading(false);
      setSwitchingRole(null);
    }
  };

  const handleAddRole = (role: string) => {
    const roleLower = role.toLowerCase();

    // Check minor restrictions
    if (profileData?.date_of_birth) {
      const birthDate = new Date(profileData.date_of_birth);
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age < 18 && roleLower !== 'volunteer') {
        Toast.show({
          type: 'info',
          text1: 'Age Restriction',
          text2: 'Users under 18 can only register as youth volunteers.',
        });
        return;
      }
    }

    const routeParams = {
      pendingRoles: [],
      selectedRoles: [roleLower],
      collectedRolesData: [],
      date_of_birth: profileData?.date_of_birth,
    };

    if (roleLower === 'volunteer') {
      navigation.navigate('VolunteerSetup' as any, routeParams);
    } else if (roleLower === 'organization') {
      navigation.navigate('OrganizationSetup' as any, routeParams);
    } else if (roleLower === 'sponsor') {
      navigation.navigate('SponsorSetup' as any, routeParams);
    } else if (roleLower === 'beneficiary') {
      navigation.navigate('BeneficiarySetup' as any, routeParams);
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.neutral[0] }} />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
        <View style={styles.headerRow}>
          {navigation.canGoBack() ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ChevronLeft color={Colors.neutral[900]} size={28} />
            </TouchableOpacity>
          ) : (
            <View style={styles.rightSpacer} />
          )}
        </View>

        <View style={{ flex: 1, backgroundColor: Colors.neutral[0] }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}>

          <AppText variant="h4" center color={Colors.neutral[900]} style={styles.title}>
            {currentRole ? 'Switch Role' : 'Choose Dashboard'}
          </AppText>

          <AppText variant="bodyLarge" center color={Colors.neutral[500]} style={styles.subtitle}>
            {currentRole
              ? "Select a profile to switch to, or add a new role to your account."
              : "Select which profile you'd like to access right now. You can switch between them anytime in settings."
            }
          </AppText>

          {isFetchingProfile ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.primary[500]} />
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              {ALL_ROLES.map((role, index) => {
                const isCurrent = role.toLowerCase() === currentRole?.toLowerCase();
                const isCreated = isRoleCreated(role);
                return (
                  <DashboardCard
                    key={`${role}-${index}`}
                    role={role}
                    onPress={() => {
                      if (isCreated) {
                        handleRoleSelect(role);
                      } else {
                        handleAddRole(role);
                      }
                    }}
                    disabled={isLoading}
                    isCurrent={isCurrent}
                    isCreated={isCreated}
                    isSwitching={switchingRole === role}
                  />
                );
              })}
            </View>
          )}

          {isLoading && (
            <View style={{ marginTop: 24 }}>
              <ActivityIndicator size="large" color={Colors.primary[500]} />
            </View>
          )}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(32),
  },
  backButton: {
    // marginBottom: verticalScale(16),
  },
  headerRow: {
    backgroundColor: Colors.neutral[0],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: 0,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  rightSpacer: {
    width: moderateScale(28),
  },
  title: {
    marginTop: 0,
  },
  subtitle: {
    lineHeight: fontScale(24),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(32),
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - horizontalScale(48) - horizontalScale(16)) / 2,
    borderRadius: BorderRadius.xl,
    padding: moderateScale(14),
    marginBottom: verticalScale(16),
    shadowColor: Colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardAvailable: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  cardCurrent: {
    backgroundColor: Colors.neutral[100],
    borderWidth: 1.5,
    borderColor: Colors.neutral[300],
  },
  cardNotCreated: {
    backgroundColor: Colors.neutral[0],
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
    borderStyle: 'dashed',
  },
  cardLoading: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  iconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(3),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
    gap: horizontalScale(3),
  },
  selectedBadgeText: {
    color: Colors.primary[700],
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(9.5),
  },
  switchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(3),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
    gap: horizontalScale(3),
  },
  switchBadgeText: {
    color: Colors.primary[600],
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(9.5),
  },
  addRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(3),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[300],
    gap: horizontalScale(2),
  },
  addRoleBadgeText: {
    color: Colors.primary[600],
    fontFamily: FontFamily.bold,
    fontSize: fontScale(9.5),
  },
  cardTitle: {
    fontFamily: FontFamily.semiBold,
    marginBottom: verticalScale(4),
  },
  cardDescription: {
    lineHeight: fontScale(18),
  },
  loaderContainer: {
    marginTop: verticalScale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
