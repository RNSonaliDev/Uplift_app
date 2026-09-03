import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Modal,
  Keyboard,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path, Circle, Rect} from 'react-native-svg';
import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {UpliftLogo} from '../components/UpliftLogo';
import Toast from 'react-native-toast-message';
import {Colors} from '../theme/colors';
import {FontFamily, FontSize} from '../theme/typography';
import {authApi} from '../api';
import {persistAuthToken} from '../api/client';
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

const OTP_LENGTH = 6;
const RESEND_TIMER_SECONDS = 45;

// ── Icon Components ──────────────────────────────────

const BackArrowIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.primary[900],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EditIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MailIcon: React.FC<{size?: number}> = ({size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
    />
    <Path
      d="M3 7L12 13L21 7"
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon: React.FC<{size?: number}> = ({size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="7"
      y="2"
      width="10"
      height="20"
      rx="2"
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
    />
    <Path
      d="M11 18H13"
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

const LockIcon: React.FC<{size?: number}> = ({size = 16}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="5"
      y="11"
      width="14"
      height="10"
      rx="2"
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
    />
    <Path
      d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11"
      stroke={Colors.primary[500]}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

// ── OTP Input Component ──────────────────────────────────

interface OtpInputProps {
  length: number;
  value: string[];
  onChange: (otp: string[]) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({length, value, onChange}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...value];

    if (text.length > 1) {
      // Handle paste
      const pastedChars = text.split('').slice(0, length);
      pastedChars.forEach((char, i) => {
        if (index + i < length) {
          newOtp[index + i] = char;
        }
      });
      onChange(newOtp);
      const nextIndex = Math.min(index + pastedChars.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = text;
    onChange(newOtp);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      const newOtp = [...value];
      newOtp[index - 1] = '';
      onChange(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={otpStyles.container}>
      {Array.from({length}, (_, index) => {
        const isFocused = false; // managed by TextInput internally
        const hasValue = !!value[index];

        return (
          <TextInput
            key={index}
            ref={ref => {
              inputRefs.current[index] = ref;
            }}
            style={[
              otpStyles.input,
              hasValue && otpStyles.inputFilled,
            ]}
            maxLength={1}
            keyboardType="number-pad"
            value={value[index] || ''}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            selectTextOnFocus
            selectionColor={Colors.primary[500]}
          />
        );
      })}
    </View>
  );
};

const otpStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(10),
  },
  input: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: moderateScale(52),
    maxHeight: moderateScale(52),
    borderWidth: 1.5,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.md,
    textAlign: 'center',
    fontSize: fontScale(22),
    fontFamily: FontFamily.semiBold,
    color: Colors.primary[500],
    backgroundColor: Colors.neutral[0],
  },
  inputFilled: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
});

// ── Contact Info Row ──────────────────────────────────

interface ContactInfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangePress?: () => void;
}

const ContactInfoRow: React.FC<ContactInfoRowProps> = ({
  icon,
  label,
  value,
  onChangePress,
}) => (
  <View style={contactStyles.row}>
    <View style={contactStyles.iconContainer}>{icon}</View>
    <View style={contactStyles.textContainer}>
      <AppText variant="labelMedium" color={Colors.neutral[500]}>
        {label}
      </AppText>
      <AppText variant="labelMedium" color={Colors.neutral[900]} numberOfLines={1}>
        {value}
      </AppText>
    </View>
    {/* <TouchableOpacity onPress={onChangePress} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <EditIcon size={moderateScale(20)} color={Colors.primary[500]} />
    </TouchableOpacity> */}
  </View>
);

const contactStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(16),
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
  },
  iconContainer: {
    marginRight: moderateScale(12),
  },
  textContainer: {
    flex: 1,
    marginRight: moderateScale(12),
  },
});

// ── Main Component ──────────────────────────────────

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Welcome: undefined;
  CreateAccount: undefined;
  VerifyAccount: { emailOrPhone: string, dob?: string, parentEmail?: string };
  ParentVerification: { parentEmail: string };
  CreateProfile: { verificationToken: string, emailOrPhone: string, dob?: string, parentEmail?: string };
  SelectRoles: undefined;
  BeneficiaryFlow: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
type ParentVerificationRouteProp = RouteProp<RootStackParamList, 'ParentVerification'>;

export const ParentVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<ParentVerificationRouteProp>();
  
  const parentEmail = route.params?.parentEmail || '';
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = useCallback(async () => {
    if (!canResend || isResending) {
      return;
    }
    
    try {
      setIsResending(true);
      await authApi.sendParentVerification();

      setTimer(RESEND_TIMER_SECONDS);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Verification code resent successfully',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to resend code',
      });
    } finally {
      setIsResending(false);
    }
  }, [canResend, isResending]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  const handleVerify = async () => {
    if (!isOtpComplete) return;

    try {
      setIsVerifying(true);
      const code = otp.join('');
      
      const response = await authApi.verifyParentVerification({
        parent_verification: {
          code,
        }
      });
      console.log("@@@@responseresponseresponseresponse ========================", response.registration_step)
        if (response.access_token) {
          await persistAuthToken(response.access_token);
        }

        const pendingRoles = response?.pending_roles || [];
        
        if (pendingRoles.length > 0) {
          const nextRoles = [...pendingRoles];
          const nextRole = nextRoles.shift();
          const routeParams = {
            pendingRoles: nextRoles,
            selectedRoles: response?.selected_roles || pendingRoles,
            collectedRolesData: [],
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
        } else if (response?.registration_step === 'role_setup') {
          navigation.navigate('SelectRoles' as any);
        } else if (response?.default_role) {
            if (response.default_role === 'volunteer') {
              navigation.replace('VolunteerFlow' as any);
            } else if (response.default_role === 'sponsor') {
              navigation.replace('SponsorFlow' as any);
            } else if (response.default_role === 'organization') {
              navigation.replace('OrganizationFlow' as any);
            } else if (response.default_role === 'beneficiary') {
              navigation.replace('BeneficiaryFlow' as any);
            } else {
              navigation.replace('Welcome');
            }
        
      } else {
        navigation.replace('Welcome');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Invalid verification code',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={isIOS ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <BackArrowIcon size={moderateScale(24)} />
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <UpliftLogo size={moderateScale(0.9, 0.3)} />
          </View>

          <AppText variant="h2" center color={Colors.primary[900]} style={styles.title}>
            Parent Verification
          </AppText>
          <AppText
            variant="bodyMedium"
            center
            color={Colors.neutral[600]}
            style={styles.subtitle}>
            Enter the 6-digit verification code{'\n'}we sent to your parent's email.
          </AppText>

          <View style={styles.contactSection}>
            <ContactInfoRow
              icon={<MailIcon size={moderateScale(22)} />}
              label="Parent Email"
              value={parentEmail}
              onChangePress={() => navigation.goBack()}
            />
          </View>

          <View style={styles.otpSection}>
            <OtpInput length={OTP_LENGTH} value={otp} onChange={setOtp} />
          </View>

          <View style={styles.resendSection}>
            <AppText variant="bodySmall" color={Colors.neutral[500]}>
              Didn't receive the code?
            </AppText>
            {canResend ? (
              <TouchableOpacity
                onPress={handleResend}
                disabled={isResending}
                style={styles.resendButton}>
                <AppText
                  variant="labelSmall"
                  color={isResending ? Colors.neutral[400] : Colors.primary[500]}>
                  {isResending ? 'Resending...' : 'Resend Code'}
                </AppText>
              </TouchableOpacity>
            ) : (
              <AppText
                variant="bodySmall"
                color={Colors.neutral[500]}
                style={styles.resendTimer}>
                Resend code in{' '}
                <AppText
                  variant="labelSmall"
                  color={Colors.primary[500]}>
                  {formatTime(timer)}
                </AppText>
              </AppText>
            )}
          </View>

          <View style={styles.spacer} />

          <Button
            title="Verify & Continue"
            color="primary"
            size="lg"
            fullWidth
            disabled={!isOtpComplete || isVerifying}
            loading={isVerifying}
            onPress={handleVerify}
            style={styles.verifyButton}
          />

          <View style={styles.securityNote}>
            <LockIcon size={moderateScale(16)}  />
            <AppText
              variant="bodySmall"
              color={Colors.neutral[500]}
              style={styles.securityText}>
              Your information is secure and encrypted.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: horizontalScale(24),
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: moderateScale(24),
    width: '100%',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  keyboardAvoid: {
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
  title: {
    marginTop: verticalScale(16),
  },
  subtitle: {
    marginTop: verticalScale(8),
  },
  contactSection: {
    marginTop: verticalScale(24),
  },
  otpSection: {
    marginTop: verticalScale(24),
    paddingHorizontal: horizontalScale(4),
  },
  resendSection: {
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  resendButton: {
    marginTop: verticalScale(4),
    padding: moderateScale(4),
  },
  resendTimer: {
    marginTop: verticalScale(4),
  },
  spacer: {
    flex: 1,
    minHeight: verticalScale(32),
  },
  verifyButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(16),
  },
  securityText: {
    marginLeft: moderateScale(6),
  },
});
