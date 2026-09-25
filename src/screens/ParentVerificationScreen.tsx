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

const MailIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path
      d="M3 7L12 13L21 7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.primary[500],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="7"
      y="2"
      width="10"
      height="20"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path
      d="M11 18H13"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

const RightArrowIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = Colors.neutral[0],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
    gap: moderateScale(8),
  },
  input: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: moderateScale(44),
    maxHeight: moderateScale(44),
    borderWidth: 1.5,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.md,
    textAlign: 'center',
    fontSize: fontScale(18),
    fontFamily: FontFamily.semiBold,
    color: Colors.primary[500],
    backgroundColor: Colors.neutral[0],
    padding: 0,
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
    {onChangePress && (
      <TouchableOpacity onPress={onChangePress} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <EditIcon size={moderateScale(20)} color={Colors.primary[500]} />
      </TouchableOpacity>
    )}
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
  ParentVerification: { parentEmail?: string, parentPhone?: string };
  CreateProfile: { verificationToken: string, emailOrPhone: string, dob?: string, parentEmail?: string, parentPhone?: string };
  SelectRoles: undefined;
  BeneficiaryFlow: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
type ParentVerificationRouteProp = RouteProp<RootStackParamList, 'ParentVerification'>;

const formatPhoneNumber = (phone?: string) => {
  if (!phone) return 'Not provided';
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return phone;
  return `+1 ${digits}`;
};

export const ParentVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<ParentVerificationRouteProp>();
  
  const [parentEmail, setParentEmail] = useState(route.params?.parentEmail || '');
  const [parentPhone, setParentPhone] = useState(route.params?.parentPhone || '');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEmail, setEditEmail] = useState(parentEmail);
  const [editPhone, setEditPhone] = useState(parentPhone);
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);

  const [emailOtp, setEmailOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [phoneOtp, setPhoneOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));

  const [emailTimer, setEmailTimer] = useState(RESEND_TIMER_SECONDS);
  const [canResendEmail, setCanResendEmail] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const [phoneTimer, setPhoneTimer] = useState(RESEND_TIMER_SECONDS);
  const [canResendPhone, setCanResendPhone] = useState(false);
  const [isResendingPhone, setIsResendingPhone] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (emailTimer <= 0) {
      setCanResendEmail(true);
      return;
    }
    const interval = setInterval(() => {
      setEmailTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [emailTimer]);

  useEffect(() => {
    if (phoneTimer <= 0) {
      setCanResendPhone(true);
      return;
    }
    const interval = setInterval(() => {
      setPhoneTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phoneTimer]);

  const handleResendEmail = useCallback(async () => {
    if (!canResendEmail || isResendingEmail) {
      return;
    }

    try {
      setIsResendingEmail(true);
      await authApi.sendParentVerification({
        parent_email: parentEmail || undefined,
      });

      setEmailTimer(RESEND_TIMER_SECONDS);
      setCanResendEmail(false);
      setEmailOtp(Array(OTP_LENGTH).fill(''));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Verification code resent to parent email',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to resend email code',
      });
    } finally {
      setIsResendingEmail(false);
    }
  }, [canResendEmail, isResendingEmail, parentEmail]);

  const handleResendPhone = useCallback(async () => {
    if (!canResendPhone || isResendingPhone) {
      return;
    }

    try {
      setIsResendingPhone(true);
      await authApi.sendParentVerification({
        parent_phone: parentPhone ? `+1${parentPhone.replace(/\D/g, '')}` : undefined,
      });

      setPhoneTimer(RESEND_TIMER_SECONDS);
      setCanResendPhone(false);
      setPhoneOtp(Array(OTP_LENGTH).fill(''));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Verification code resent to parent phone',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to resend phone code',
      });
    } finally {
      setIsResendingPhone(false);
    }
  }, [canResendPhone, isResendingPhone, parentPhone]);

  const handleSaveContact = async () => {
    if (!editEmail.trim()) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Parent email address is required' });
      return;
    }
    const editPhoneDigits = editPhone.replace(/\D/g, '');
    if (!editPhone.trim() || editPhoneDigits.length < 10) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please enter a valid 10-digit parent phone number' });
      return;
    }

    try {
      setIsUpdatingContact(true);
      await authApi.sendParentVerification({
        parent_email: editEmail,
        parent_phone: `+1${editPhoneDigits}`,
      });

      setParentEmail(editEmail);
      setParentPhone(editPhone);
      setIsEditModalOpen(false);
      setEmailTimer(RESEND_TIMER_SECONDS);
      setCanResendEmail(false);
      setPhoneTimer(RESEND_TIMER_SECONDS);
      setCanResendPhone(false);
      setEmailOtp(Array(OTP_LENGTH).fill(''));
      setPhoneOtp(Array(OTP_LENGTH).fill(''));

      Toast.show({
        type: 'success',
        text1: 'Contact Updated',
        text2: 'New verification codes sent to updated parent email & phone',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to update parent contact',
      });
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isEmailOtpComplete = emailOtp.every(digit => digit !== '');
  const isPhoneOtpComplete = phoneOtp.every(digit => digit !== '');
  const isFormComplete = isEmailOtpComplete && isPhoneOtpComplete;

  const handleVerify = async () => {
    if (!isFormComplete) return;

    try {
      setIsVerifying(true);
      const emailCode = emailOtp.join('');
      const phoneCode = phoneOtp.join('');

      const response = await authApi.verifyParentVerification({
        parent_verification: {
          code: emailCode,
          email_code: emailCode,
          phone_code: phoneCode,
        } as any,
      });

      if (response?.access_token) {
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
          navigation.reset({ index: 0, routes: [{ name: 'VolunteerSetup' as any, params: routeParams }] });
        } else if (nextRole === 'organization') {
          navigation.reset({ index: 0, routes: [{ name: 'OrganizationSetup' as any, params: routeParams }] });
        } else if (nextRole === 'sponsor') {
          navigation.reset({ index: 0, routes: [{ name: 'SponsorSetup' as any, params: routeParams }] });
        } else if (nextRole === 'beneficiary') {
          navigation.reset({ index: 0, routes: [{ name: 'BeneficiarySetup' as any, params: routeParams }] });
        }
      } else if (response?.registration_step === 'role_setup') {
        navigation.reset({ index: 0, routes: [{ name: 'SelectRoles' as any }] });
      } else if (response?.default_role) {
        if (response.default_role === 'volunteer') {
          navigation.reset({ index: 0, routes: [{ name: 'VolunteerFlow' as any }] });
        } else if (response.default_role === 'sponsor') {
          navigation.reset({ index: 0, routes: [{ name: 'SponsorFlow' as any }] });
        } else if (response.default_role === 'organization') {
          navigation.reset({ index: 0, routes: [{ name: 'OrganizationFlow' as any }] });
        } else if (response.default_role === 'beneficiary') {
          navigation.reset({ index: 0, routes: [{ name: 'BeneficiaryFlow' as any }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
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

          <AppText variant="h2" center color={Colors.primary[900]} style={styles.title}>
            Parent Verification
          </AppText>
          <AppText
            variant="bodyMedium"
            center
            color={Colors.neutral[600]}
            style={styles.subtitle}>
            Please enter both verification codes sent to your parent's email and phone.
          </AppText>
      

          {/* Section 1: Verify Parent Email */}
          <View style={styles.sectionWrapper}>
            <View style={styles.cardHeader}>
              <View style={[styles.badge, styles.badgeEmail]}>
                <AppText style={styles.badgeText}>1</AppText>
              </View>
              <View style={styles.headerTextContainer}>
                <AppText variant="h5" color={Colors.neutral[900]} style={styles.cardTitle}>
                  Verify Parent Email
                </AppText>
                <AppText variant="caption" color={Colors.neutral[500]}>
                  We've sent a 6-digit code to your parent's email.
                </AppText>
              </View>
            </View>

            {/* Email Contact Box (NO edit icon) */}
            <View style={styles.infoBoxEmail}>
              <View style={styles.iconSquareEmail}>
                <MailIcon size={moderateScale(18)} color={Colors.primary[500]} />
              </View>
              <View style={styles.infoTextContainer}>
                <AppText variant="caption" color={Colors.neutral[500]}>
                  Parent Email
                </AppText>
                <AppText variant="labelMedium" color={Colors.neutral[900]} numberOfLines={1} style={styles.infoValueText}>
                  {parentEmail || 'Not provided'}
                </AppText>
              </View>
            </View>

            {/* Email OTP Input */}
            <View style={{marginTop: verticalScale(10)}}>
              <OtpInput length={OTP_LENGTH} value={emailOtp} onChange={setEmailOtp} />
            </View>

            {/* Resend Link Row */}
            <View style={styles.inlineResendCenter}>
              <AppText variant="bodySmall" color={Colors.neutral[500]}>
                Didn't receive the email code?{' '}
              </AppText>
              {canResendEmail ? (
                <TouchableOpacity
                  onPress={handleResendEmail}
                  disabled={isResendingEmail}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <AppText
                    variant="labelSmall"
                    color={isResendingEmail ? Colors.neutral[400] : Colors.primary[500]}>
                    {isResendingEmail ? 'Resending...' : 'Resend Code'}
                  </AppText>
                </TouchableOpacity>
              ) : (
                <AppText variant="bodySmall" color={Colors.neutral[500]}>
                  Resend code in{' '}
                  <AppText variant="labelSmall" color={Colors.primary[500]}>
                    {formatTime(emailTimer)}
                  </AppText>
                </AppText>
              )}
            </View>
          </View>

          {/* Section 2: Verify Parent Phone */}
          <View style={styles.sectionWrapper}>
            <View style={styles.cardHeader}>
              <View style={[styles.badge, styles.badgePhone]}>
                <AppText style={styles.badgeText}>2</AppText>
              </View>
              <View style={styles.headerTextContainer}>
                <AppText variant="h5" color={Colors.neutral[900]} style={styles.cardTitle}>
                  Verify Parent Phone
                </AppText>
                <AppText variant="caption" color={Colors.neutral[500]}>
                  We've sent a 6-digit code to your parent's phone.
                </AppText>
              </View>
            </View>

            {/* Phone Contact Box (NO edit icon) */}
            <View style={styles.infoBoxPhone}>
              <View style={styles.iconSquarePhone}>
                <PhoneIcon size={moderateScale(18)} color="#10B981" />
              </View>
              <View style={styles.infoTextContainer}>
                <AppText variant="caption" color={Colors.neutral[500]}>
                  Parent Phone
                </AppText>
                <AppText variant="labelMedium" color={Colors.neutral[900]} numberOfLines={1} style={styles.infoValueText}>
                  {formatPhoneNumber(parentPhone)}
                </AppText>
              </View>
            </View>

            {/* Phone OTP Input */}
            <View style={{marginTop: verticalScale(10)}}>
              <OtpInput length={OTP_LENGTH} value={phoneOtp} onChange={setPhoneOtp} />
            </View>

            {/* Resend Link Row */}
            <View style={styles.inlineResendCenter}>
              <AppText variant="bodySmall" color={Colors.neutral[500]}>
                Didn't receive the phone code?{' '}
              </AppText>
              {canResendPhone ? (
                <TouchableOpacity
                  onPress={handleResendPhone}
                  disabled={isResendingPhone}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <AppText
                    variant="labelSmall"
                    color={isResendingPhone ? Colors.neutral[400] : Colors.primary[500]}>
                    {isResendingPhone ? 'Resending...' : 'Resend Code'}
                  </AppText>
                </TouchableOpacity>
              ) : (
                <AppText variant="bodySmall" color={Colors.neutral[500]}>
                  Resend code in{' '}
                  <AppText variant="labelSmall" color={Colors.primary[500]}>
                    {formatTime(phoneTimer)}
                  </AppText>
                </AppText>
              )}
            </View>
          </View>

          <View style={styles.spacer} />

          <Button
            title="Verify & Continue"
            color="primary"
            size="lg"
            fullWidth
            disabled={!isFormComplete || isVerifying}
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

      {/* Edit Parent Contact Modal */}
      <Modal visible={isEditModalOpen} transparent animationType="slide" onRequestClose={() => setIsEditModalOpen(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsEditModalOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation?.()}
          >
            <AppText variant="h5" color={Colors.neutral[900]} style={{marginBottom: 4}}>
              Update Parent Contact Info
            </AppText>
            <AppText variant="bodySmall" color={Colors.neutral[500]} center style={{marginBottom: 16}}>
              Enter your parent's email and phone number to resend the verification code.
            </AppText>

            <View style={{width: '100%'}}>
              <Input
                label="Parent Email Address"
                placeholder="parent@example.com"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{marginTop: 12}}>
                <Input
                  label="Parent Phone Number"
                  placeholder="(201) 555-0123"
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={{flexDirection: 'row', gap: 12, marginTop: 24, width: '100%'}}>
              <Button
                title="Cancel"
                variant="outline"
                color="primary"
                onPress={() => setIsEditModalOpen(false)}
                style={{flex: 1}}
              />
              <Button
                title="Update & Resend"
                color="primary"
                loading={isUpdatingContact}
                onPress={handleSaveContact}
                style={{flex: 1.2}}
              />
            </View>
          </TouchableOpacity>
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
    marginTop: verticalScale(4),
    padding: moderateScale(4),
  },
  title: {
    marginTop: verticalScale(4),
  },
  subtitle: {
    marginTop: verticalScale(4),
  },
  sectionWrapper: {
    marginTop: verticalScale(14),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  badge: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(10),
  },
  badgeEmail: {
    backgroundColor: Colors.primary[500],
  },
  badgePhone: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    color: Colors.neutral[0],
    fontFamily: FontFamily.bold,
    fontSize: fontScale(12),
  },
  headerTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: fontScale(15),
    marginBottom: 1,
  },
  infoBoxEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5FF',
    borderRadius: BorderRadius.md,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(10),
  },
  iconSquareEmail: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: BorderRadius.sm,
    backgroundColor: '#ECE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(10),
  },
  infoBoxPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: BorderRadius.md,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(10),
  },
  iconSquarePhone: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: BorderRadius.sm,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(10),
  },
  infoTextContainer: {
    flex: 1,
  },
  infoValueText: {
    fontFamily: FontFamily.semiBold,
  },
  contactSection: {
    marginTop: verticalScale(14),
  },
  otpSection: {
    marginTop: verticalScale(14),
    paddingHorizontal: horizontalScale(4),
  },
  verifiedBadgeContainer: {
    backgroundColor: Colors.secondary[50],
    paddingVertical: verticalScale(10),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.secondary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineResendCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(8),
  },
  resendSection: {
    alignItems: 'center',
    marginTop: verticalScale(16),
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
    minHeight: verticalScale(12),
  },
  verifyButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(48),
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10),
  },
  securityText: {
    marginLeft: moderateScale(6),
  },
});
