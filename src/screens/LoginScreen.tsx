import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { UpliftLogo } from '../components/UpliftLogo';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { wp, hp, verticalScale, horizontalScale } from '../utils/responsive';

type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Welcome: undefined;
  DashboardRoleSelection: { selectedRoles: string[] };
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

// ── Icon Components ──────────────────────────────────────
const MailOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.5" />
    <Path d="M3 7L12 13L21 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LockOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.5" />
    <Path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EyeOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EyeOffOutlineIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.86 18.86 0 0 1 5.06 6.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.86 18.86 0 0 1 19.76 17.76M1 1L23 23" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Temporary navigation for demonstration
      navigation.navigate('Welcome');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button & Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AppText color={Colors.neutral[600]}>Cancel</AppText>
          </TouchableOpacity>
        </View>

        {/* Logo & Welcome Text */}
        <View style={styles.logoSection}>
          <UpliftLogo size={verticalScale(60)} />
          <AppText variant="h1" color={Colors.primary[900]} style={styles.title}>
            Welcome Back
          </AppText>
          <AppText variant="bodyLarge" color={Colors.neutral[500]} center style={styles.subtitle}>
            Log in to continue your journey with Uplift and make an impact.
          </AppText>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Input
            label="Email or Phone Number"
            placeholder="Enter your email or phone"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<MailOutlineIcon />}
          />

          <View style={styles.passwordContainer}>
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={<LockOutlineIcon />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOffOutlineIcon />
                  ) : (
                    <EyeOutlineIcon />
                  )}
                </TouchableOpacity>
              }
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <AppText variant="bodyMedium" color={Colors.primary[500]} weight="semiBold">
              Forgot Password?
            </AppText>
          </TouchableOpacity>

          <Button
            title="Log In"
            color="primary"
            size="lg"
            fullWidth
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />
        </View>

        {/* Social Login Separator */}
        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
          <AppText variant="bodySmall" color={Colors.neutral[400]} style={styles.separatorText}>
            OR CONTINUE WITH
          </AppText>
          <View style={styles.separator} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialSection}>
          <Button
            title="Google"
            variant="outline"
            color="neutral"
            size="lg"
            fullWidth
            style={styles.socialButton}
            onPress={() => {}}
          />
          <Button
            title="Apple"
            variant="outline"
            color="neutral"
            size="lg"
            fullWidth
            style={styles.socialButton}
            onPress={() => {}}
          />
        </View>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <AppText variant="bodyMedium" color={Colors.neutral[600]}>
            Don't have an account?{' '}
          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
            <AppText variant="bodyMedium" color={Colors.primary[500]} weight="bold">
              Sign Up
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: verticalScale(40),
  },
  header: {
    marginTop: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.md,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: verticalScale(32),
  },
  title: {
    marginTop: verticalScale(24),
    marginBottom: verticalScale(8),
  },
  subtitle: {
    paddingHorizontal: horizontalScale(20),
  },
  formSection: {
    marginTop: verticalScale(40),
  },
  passwordContainer: {
    marginBottom: Spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: verticalScale(32),
    paddingVertical: Spacing.xs,
  },
  loginButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(40),
    marginBottom: verticalScale(24),
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  separatorText: {
    marginHorizontal: Spacing.md,
    letterSpacing: 1,
  },
  socialSection: {
    flexDirection: 'column',
    gap: verticalScale(12),
  },
  socialButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(40),
  },
});
