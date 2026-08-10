import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {UpliftLogo} from '../components/UpliftLogo';
import {Colors} from '../theme/colors';
import {FontFamily} from '../theme/typography';
import {Spacing, BorderRadius} from '../theme/spacing';
import {
  wp,
  hp,
  moderateScale,
  fontScale,
  verticalScale,
  horizontalScale,
} from '../utils/responsive';

import { friendImage, backgroundimage } from '../assets/images';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Welcome: undefined;
  CreateAccount: undefined;
  VerifyAccount: { emailOrPhone: string };
  SelectRoles: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <UpliftLogo size={moderateScale(100, 0.3)} />
        </View>

        {/* Tagline */}
        <View style={styles.taglineSection}>
          <AppText variant="h1" center style={styles.taglineBlack}>
            Stronger together.
          </AppText>
          <AppText
            variant="h1"
            center
            color={Colors.primary[500]}
            style={styles.taglinePurple}>
            Better together.
          </AppText>
        </View>

        {/* Description */}
        <AppText
          variant="bodyLarge"
          center
          color={Colors.neutral[500]}
          style={styles.description}>
          Uplift connects people, organizations,{'\n'}and sponsors to build
          stronger{'\n'}communities.
        </AppText>

        {/* Illustration */}
        <ImageBackground source={backgroundimage} style={styles.illustrationContainer} resizeMode="cover">
          <Image
            source={friendImage}
            style={styles.illustration}
            resizeMode="contain"
          />
        </ImageBackground>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Create Account Button */}
          <Button
            title="Create an Account"
            color="primary"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('CreateAccount')}
            style={styles.createButton}
          />

          {/* Login Button */}
          <Button
            title="Log In"
            variant="outline"
            color="primary"
            size="lg"
            fullWidth
            onPress={() => {}}
            style={styles.loginButton}
          />

          {/* Terms Text */}
          <View style={styles.termsContainer}>
            <AppText variant="bodySmall" color={Colors.neutral[500]}>
              By continuing, you agree to our
            </AppText>
            <View style={styles.termsLinks}>
              <TouchableOpacity onPress={() => {}}>
                <AppText
                  variant="bodySmall"
                  color={Colors.primary[500]}
                  weight="semiBold">
                  Terms of Service
                </AppText>
              </TouchableOpacity>
              <AppText variant="bodySmall" color={Colors.neutral[500]}>
                {'  and  '}
              </AppText>
              <TouchableOpacity onPress={() => {}}>
                <AppText
                  variant="bodySmall"
                  color={Colors.primary[500]}
                  weight="semiBold">
                  Privacy Policy
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    // paddingHorizontal: horizontalScale(24),
  },
  logoSection: {
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  taglineSection: {
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  taglineBlack: {
    fontSize: fontScale(28),
    lineHeight: fontScale(36),
  },
  taglinePurple: {
    fontSize: fontScale(28),
    lineHeight: fontScale(36),
  },
  description: {
    marginTop: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    fontSize: fontScale(15),
    lineHeight: fontScale(22),
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end', // Aligns the friend image at the bottom
    marginTop: verticalScale(16),
    // flex: 1,
    height: verticalScale(200),
    width: "100%"
  },
  illustration: {
    width: wp(85),
    height: verticalScale(200), 
  },
  bottomSection: {
    paddingBottom: verticalScale(24),
    marginTop: verticalScale(12),
    paddingHorizontal: horizontalScale(24),
  },
  createButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
  },
  loginButton: {
    borderRadius: BorderRadius.xl,
    marginTop: verticalScale(12),
    height: verticalScale(52),
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  termsLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
});
