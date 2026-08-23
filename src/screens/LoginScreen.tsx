import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Svg, {Path, Circle, Rect, G} from 'react-native-svg';
import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {UpliftLogo} from '../components/UpliftLogo';
import {Popup} from '../components';
import {authApi} from '../api';
import {Colors} from '../theme/colors';
import {Spacing, BorderRadius} from '../theme/spacing';
import {
  wp,
  hp,
  moderateScale,
  fontScale,
  verticalScale,
  horizontalScale,
  isIOS,
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

const EmailPhoneIcon: React.FC<{size?: number}> = ({size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="6"
      width="16"
      height="12"
      rx="2"
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
    />
    <Path
      d="M2 8L10 13L18 8"
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x="14"
      y="12"
      width="8"
      height="10"
      rx="2"
      fill={Colors.neutral[0]}
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
    />
    <Path
      d="M17 19H19"
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

const InfoIcon: React.FC<{size?: number}> = ({size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={Colors.primary[500]} strokeWidth="1.5" />
    <Path
      d="M12 16V12"
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="8" r="1" fill={Colors.primary[500]} />
  </Svg>
);

const GoogleIcon: React.FC<{size?: number}> = ({size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

const FacebookIcon: React.FC<{size?: number}> = ({size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z"
      fill="#1877F2"
    />
  </Svg>
);

const AppleIcon: React.FC<{size?: number}> = ({size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      fill={Colors.neutral[900]}
    />
  </Svg>
);

// ── Social Login Button ──────────────────────────────────

interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({icon, label, onPress}) => (
  <TouchableOpacity
    style={styles.socialButton}
    activeOpacity={0.7}
    onPress={onPress}>
    <View style={styles.socialIconContainer}>{icon}</View>
    <AppText variant="labelMedium" color={Colors.primary[900]}>
      {label}
    </AppText>
  </TouchableOpacity>
);

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

export const LoginScreen: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [popupConfig, setPopupConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });
  const navigation = useNavigation<NavigationProps>();

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      
      const response = await authApi.requestOtp({
        otp: {
          identifier: emailOrPhone,
          purpose: 'login',
        },
      });

      navigation.navigate('VerifyAccount', { emailOrPhone });
    } catch (error: any) {
      setPopupConfig({
        visible: true,
        type: 'error',
        title: 'Error',
        message: error?.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
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

          {/* Logo */}
          <View style={styles.logoSection}>
            <UpliftLogo size={moderateScale(0.45, 0.3)} />
          </View>

          {/* Title & Subtitle */}
          <View style={styles.headerSection}>
            <AppText variant="h2" center color={Colors.primary[900]} style={styles.title}>
              Welcome back
            </AppText>
            <AppText
              variant="bodyMedium"
              center
              color={Colors.neutral[500]}
              style={styles.subtitle}>
              Log in to continue your journey with Uplift and make an impact.
            </AppText>
          </View>

          {/* Email / Phone Input */}
          <View style={styles.inputSection}>
            <Input
              placeholder="Email address or phone number"
              leftIcon={<EmailPhoneIcon size={moderateScale(22)} />}
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputContainer}
            />
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <InfoIcon size={moderateScale(20)} />
            <AppText
              variant="bodySmall"
              color={Colors.neutral[600]}
              style={styles.infoText}>
              We will send you a verification code{'\n'}on given email address
              or phone number.
            </AppText>
          </View>

          {/* Continue Button */}
          <Button
            title="Continue"
            color="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleContinue}
            disabled={
              !emailOrPhone.trim() || 
              (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone) && !/^(?:\+1|1)?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(emailOrPhone))
            }
            style={styles.continueButton}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <AppText
              variant="bodySmall"
              color={Colors.neutral[400]}
              style={styles.dividerText}>
              or continue with
            </AppText>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Logins */}
          <View style={styles.socialSection}>
            <SocialButton
              icon={<GoogleIcon size={moderateScale(22)} />}
              label="Continue with Google"
              onPress={() => setPopupConfig({
                visible: true,
                type: 'info',
                title: 'Coming Soon',
                message: 'This feature is not yet available. Please check back later!'
              })}
            />
            <SocialButton
              icon={<FacebookIcon size={moderateScale(22)} />}
              label="Continue with Facebook"
              onPress={() => setPopupConfig({
                visible: true,
                type: 'info',
                title: 'Coming Soon',
                message: 'This feature is not yet available. Please check back later!'
              })}
            />
            <SocialButton
              icon={<AppleIcon size={moderateScale(22)} />}
              label="Continue with Apple"
              onPress={() => setPopupConfig({
                visible: true,
                type: 'info',
                title: 'Coming Soon',
                message: 'This feature is not yet available. Please check back later!'
              })}
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <AppText variant="bodySmall" color={Colors.neutral[500]}>
              Don't have an account?{' '}
            </AppText>
            <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
              <AppText
                variant="bodySmall"
                color={Colors.primary[500]}
                weight="semiBold">
                Sign Up
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Popup 
        visible={popupConfig.visible}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onClose={() => setPopupConfig({ ...popupConfig, visible: false })}
      />
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
    paddingBottom: verticalScale(24),
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: verticalScale(8),
    padding: moderateScale(4),
  },
  logoSection: {
    alignItems: 'center',
    // marginTop: verticalScale(12),
  },
  headerSection: {
    alignItems: 'center',
  },
  title: {
    marginTop: verticalScale(16),
  },
  subtitle: {
    marginTop: verticalScale(8),
  },
  inputSection: {
    marginTop: verticalScale(24),
  },
  inputContainer: {
    marginBottom: 0,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    padding: moderateScale(14),
    marginTop: verticalScale(16),
  },
  infoText: {
    marginLeft: moderateScale(10),
    flex: 1,
  },
  continueButton: {
    borderRadius: BorderRadius.xl,
    marginTop: verticalScale(24),
    height: verticalScale(52),
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(20),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    marginHorizontal: moderateScale(12),
  },
  socialSection: {
    gap: verticalScale(12),
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(50),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.neutral[0],
  },
  socialIconContainer: {
    position: 'absolute',
    left: horizontalScale(20),
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
});
