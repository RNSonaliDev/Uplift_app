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
import { ChevronLeft } from 'lucide-react-native';

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
}

const DashboardCard: React.FC<DashboardCardProps> = ({ role, onPress, disabled, isCurrent }) => {
  const getIcon = () => {
    const iconColor = isCurrent ? Colors.neutral[500] : Colors.primary[500];
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
        isCurrent ? styles.cardCurrent : styles.cardAvailable,
        disabled && !isCurrent && styles.cardLoading,
      ]}
      onPress={onPress}
      activeOpacity={isCurrent ? 1 : 0.7}
      disabled={disabled || isCurrent}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, isCurrent && styles.iconContainerCurrent]}>
          {getIcon()}
        </View>
        {isCurrent ? (
          <View style={styles.currentBadge}>
            <AppText variant="caption" style={styles.currentBadgeText}>
              Current Role
            </AppText>
          </View>
        ) : (
          <View style={styles.availableBadge}>
            <AppText variant="caption" style={styles.availableBadgeText}>
              Available
            </AppText>
          </View>
        )}
      </View>
      <AppText
        variant="h6"
        color={isCurrent ? Colors.neutral[600] : Colors.neutral[900]}
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

export const DashboardRoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<DashboardRoleSelectionRouteProp>();
  const routeSelectedRoles = route.params?.selectedRoles || [];
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(route.params?.currentRole || null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authApi.getProfile();
        if (!currentRole && profile.default_role) {
          setCurrentRole(profile.default_role);
        }
        if (profile.roles && profile.roles.length > 0) {
          setUserRoles(profile.roles);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchProfile();
  }, [currentRole]);

  const rolesToDisplay =
    routeSelectedRoles.length > 0
      ? routeSelectedRoles
      : userRoles.length > 0
      ? userRoles
      : ['beneficiary', 'volunteer', 'organization', 'sponsor'];

  const handleRoleSelect = async (role: string) => {
    try {
      setIsLoading(true);
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
        navigation.reset({ index: 0, routes: [{ name: 'DashboardRoleSelection' as any, params: { selectedRoles: rolesToDisplay } }] });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to set default role.'
      });
    } finally {
      setIsLoading(false);
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
            Choose Dashboard
          </AppText>

          <AppText variant="bodyLarge" center color={Colors.neutral[500]} style={styles.subtitle}>
            Select which profile you'd like to access right now. You can switch between them anytime in settings.
          </AppText>

          <View style={styles.cardsContainer}>
            {rolesToDisplay.map((role, index) => {
              const isCurrent = role === currentRole;
              return (
                <DashboardCard
                  key={`${role}-${index}`}
                  role={role}
                  onPress={() => handleRoleSelect(role)}
                  disabled={isLoading}
                  isCurrent={isCurrent}
                />
              );
            })}
          </View>

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
    opacity: 0.8,
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
  iconContainerCurrent: {
    backgroundColor: Colors.neutral[200],
  },
  currentBadge: {
    backgroundColor: Colors.neutral[200],
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(3),
    borderRadius: BorderRadius.full,
  },
  currentBadgeText: {
    color: Colors.neutral[700],
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(10),
  },
  availableBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(3),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  availableBadgeText: {
    color: Colors.primary[700],
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(10),
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
