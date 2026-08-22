import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Svg, {Path, Circle, Rect} from 'react-native-svg';

import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {Colors} from '../theme/colors';
import {BorderRadius, Spacing} from '../theme/spacing';
import {
  moderateScale,
  fontScale,
  verticalScale,
  horizontalScale,
} from '../utils/responsive';

// ── Navigation Types ──────────────────────────────────────
type RootStackParamList = {
  DashboardRoleSelection: { selectedRoles: string[] };
  BeneficiaryFlow: undefined;
  Success: { selectedRoles?: string[] };
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
type SuccessScreenRouteProp = RouteProp<RootStackParamList, 'Success'>;

// ── Illustrations & Icons ─────────────────────────────────

const ConfettiSuccessIllustration: React.FC = () => (
  <View style={styles.illustrationContainer}>
    <Svg width="280" height="280" viewBox="0 0 280 280" fill="none">
      {/* Confetti pieces */}
      <Path d="M80 50 Q 90 35 100 45 T 120 40" stroke="#7E57C2" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M220 70 Q 235 60 225 50 T 240 40" stroke="#FFA726" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      <Circle cx="60" cy="110" r="5" fill="#FF5252" />
      <Circle cx="230" cy="130" r="4" fill="#4CAF50" />
      <Circle cx="130" cy="30" r="4" fill="#7E57C2" />
      
      <Rect x="100" y="50" width="6" height="6" fill="#8BC34A" transform="rotate(45 100 50)" />
      <Rect x="180" y="60" width="6" height="6" fill="#FFA726" transform="rotate(20 180 60)" />
      <Rect x="200" y="90" width="6" height="6" fill="#9575CD" transform="rotate(60 200 90)" />
      
      {/* Squiggles */}
      <Path d="M50 140 Q 35 130 45 120 T 40 100" stroke="#FF5252" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M240 160 Q 255 170 245 180 T 250 200" stroke="#FF5252" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      <Circle cx="90" cy="230" r="5" fill="#4CAF50" transform="rotate(45 90 230)" />
      <Rect x="190" y="210" width="8" height="8" fill="#8BC34A" transform="rotate(30 190 210)" />

      {/* Main Checkmark Circle */}
      <Circle cx="140" cy="140" r="70" fill="#4CAF50" />
      <Path
        d="M105 140L125 160L175 110"
        stroke="#FFFFFF"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const VerifiedProfileIcon: React.FC = () => (
  <View style={styles.listIconBg}>
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill="#4CAF50" />
      <Path
        d="M7 12.5L10.5 16L17 8"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const RolesSetIcon: React.FC = () => (
  <View style={styles.listIconBg}>
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21C12 21 5 14.5 5 9.5C5 6.5 7.5 4 10.5 4C11.5 4 12 4.5 12 4.5C12 4.5 12.5 4 13.5 4C16.5 4 19 6.5 19 9.5C19 14.5 12 21 12 21Z"
        stroke="#4CAF50"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 10.5L11 12.5L15 7.5"
        stroke="#4CAF50"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const SettingsUpdateIcon: React.FC = () => (
  <View style={styles.listIconBg}>
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 21V19C15 17.8954 14.1046 17 13 17H5C3.89543 17 3 17.8954 3 19V21"
        stroke="#4CAF50"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="9"
        cy="9"
        r="4"
        stroke="#4CAF50"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Little gear next to person */}
      <Circle cx="19" cy="16" r="2.5" stroke="#4CAF50" strokeWidth="1.5" />
      <Path
        d="M19 12V13M19 19V20M23 16H22M16 16H15M17.1716 14.1716L17.5251 14.5251M20.4749 17.4749L20.8284 17.8284M17.1716 17.8284L17.5251 17.4749M20.4749 14.5251L20.8284 14.1716"
        stroke="#4CAF50"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

// ── Main Component ───────────────────────────────────────
export const SuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<SuccessScreenRouteProp>();
  const selectedRoles = route.params?.selectedRoles || [];

  const handleContinue = () => {
    if (selectedRoles.length > 1) {
      navigation.navigate('DashboardRoleSelection', { selectedRoles });
    } else {
      const role = selectedRoles[0];
      // For now, if it's beneficiary or any other role, route to BeneficiaryFlow as placeholder if others aren't built
      // Or in real app, route to role-specific flow
      navigation.navigate('BeneficiaryFlow');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        
        {/* Illustration */}
        <ConfettiSuccessIllustration />

        {/* Text Section */}
        <View style={styles.textSection}>
          <AppText variant="h2" center color={Colors.primary[900]} style={styles.title}>
            You're All Set!
          </AppText>
          <AppText
            variant="bodyLarge"
            center
            color={Colors.neutral[700]}
            style={styles.subtitle}>
            Thank you for joining Uplift.{'\n'}Together, we can build{'\n'}stronger communities.
          </AppText>
        </View>

        {/* Checklist Card */}
        <View style={styles.checklistCard}>
          <View style={styles.checklistItem}>
            <VerifiedProfileIcon />
            <AppText variant="bodyMedium" color={Colors.neutral[800]} style={styles.checklistText}>
              Your profile is verified
            </AppText>
          </View>
          
          <View style={styles.checklistItem}>
            <RolesSetIcon />
            <AppText variant="bodyMedium" color={Colors.neutral[800]} style={styles.checklistText}>
              Your roles are set
            </AppText>
          </View>
          
          <View style={styles.checklistItem}>
            <SettingsUpdateIcon />
            <AppText variant="bodyMedium" color={Colors.neutral[800]} style={styles.checklistText}>
              You can update anytime{'\n'}in settings
            </AppText>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Continue Button */}
        <Button
          title="Go to Dashboard"
          color="primary"
          size="lg"
          fullWidth
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: verticalScale(32),
    alignItems: 'center',
  },
  illustrationContainer: {
    marginTop: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  title: {
    marginBottom: verticalScale(16),
  },
  subtitle: {
    marginBottom: verticalScale(32),
  },
  checklistCard: {
    width: '100%',
    backgroundColor: Colors.secondary[50], // Light mint green from theme

    borderRadius: BorderRadius.xl,
    padding: moderateScale(24),
    gap: verticalScale(20),
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIconBg: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#E8F5E9', // Slightly darker green circle background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  checklistText: {
    flex: 1,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
    minHeight: verticalScale(40),
  },
  continueButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
    width: '100%',
  },
});
