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
}

const DashboardCard: React.FC<DashboardCardProps> = ({ role, onPress, disabled }) => {
  const getIcon = () => {
    switch (role) {
      case 'beneficiary':
        return <BeneficiaryIcon size={moderateScale(28)} />;
      case 'volunteer':
        return <VolunteerIcon size={moderateScale(28)} />;
      case 'organization':
        return <OrganizationIcon size={moderateScale(28)} />;
      case 'sponsor':
        return <SponsorIcon size={moderateScale(28)} />;
      default:
        return <BeneficiaryIcon size={moderateScale(28)} />;
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
    <TouchableOpacity style={[styles.card, disabled && styles.cardDisabled]} onPress={onPress} activeOpacity={0.7} disabled={disabled}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>{getIcon()}</View>
      </View>
      <AppText variant="h5" color={Colors.neutral[900]} style={styles.cardTitle}>
        {getTitle()} Dashboard
      </AppText>
      <AppText variant="caption" color={Colors.neutral[500]} style={styles.cardDescription}>
        {getDescription()}
      </AppText>
    </TouchableOpacity>
  );
};

// ── Main Component ────────────────────────────────────────

export const DashboardRoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<DashboardRoleSelectionRouteProp>();
  const selectedRoles = route.params?.selectedRoles || [];
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(route.params?.currentRole || null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (currentRole) return;
      try {
        const profile = await authApi.getProfile();
        setCurrentRole(profile.default_role);
      } catch (e) {
        // ignore
      }
    };
    fetchProfile();
  }, [currentRole]);

  const handleRoleSelect = async (role: string) => {
    try {
      setIsLoading(true);
      await authApi.setDefaultRole({ default_role: role });

      // if (role === 'volunteer') {
      //   navigation.navigate('VolunteerFlow');
      // } else {
      //   navigation.navigate('BeneficiaryFlow');
      // }

      if (role === 'volunteer') {
        navigation.replace('VolunteerFlow' as any);
      } else if (role === 'sponsor') {
        navigation.replace('SponsorFlow' as any);
      } else if (role === 'organization') {
        navigation.replace('OrganizationFlow' as any);
      } else if (role === 'beneficiary') {
        navigation.replace('BeneficiaryFlow' as any);
      } else {
        navigation.replace('DashboardRoleSelection', { selectedRoles });
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <BackArrowIcon size={moderateScale(24)} />
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <AppText variant="h2" color={Colors.primary[900]} style={styles.title}>
            Choose Dashboard
          </AppText>
          <AppText variant="bodyLarge" color={Colors.neutral[500]} style={styles.subtitle}>
            Select which profile you'd like to access right now. You can switch between them anytime in settings.
          </AppText>
        </View>

        <View style={styles.cardsContainer}>
          {selectedRoles.map((role, index) => (
            <DashboardCard
              key={`${role}-${index}`}
              role={role}
              onPress={() => handleRoleSelect(role)}
              disabled={isLoading || role === currentRole}
            />
          ))}
        </View>

        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    alignSelf: 'flex-start',
    marginBottom: verticalScale(16),
  },
  header: {
    marginBottom: verticalScale(32),
  },
  title: {
    marginBottom: verticalScale(12),
  },
  subtitle: {
    lineHeight: fontScale(24),
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - horizontalScale(48) - horizontalScale(16)) / 2,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: moderateScale(16),
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
  cardDisabled: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  iconContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
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
