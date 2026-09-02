import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {Colors} from '../theme/colors';
import {Spacing, BorderRadius} from '../theme/spacing';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
  isIOS,
} from '../utils/responsive';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import Svg, {Path, Circle} from 'react-native-svg';

const LockIcon: React.FC<{size?: number}> = ({size = 48}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
      stroke={Colors.primary[500]}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
      stroke={Colors.primary[500]}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MinorActivationScreen: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const handleActivate = async () => {
    if (code.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter the 6-digit code sent to your parent.',
      });
      return;
    }

    try {
      setIsLoading(true);
      // Simulate API call: authApi.activateMinor({ code })
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Toast.show({
        type: 'success',
        text1: 'Account Activated!',
        text2: 'Your parent has approved your account.',
      });
      
      // Navigate to the next step in onboarding (e.g., Roles)
      navigation.navigate('SelectRoles');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Activation Failed',
        text2: 'The code you entered is invalid or expired.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    Toast.show({
      type: 'info',
      text1: 'Email Resent',
      text2: 'We have resent the activation email to your parent.',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={isIOS ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          <View style={styles.headerSection}>
            <View style={styles.iconWrapper}>
              <LockIcon size={moderateScale(48)} />
            </View>
            <AppText variant="h2" center color={Colors.primary[900]} style={styles.title}>
              Account Dormant
            </AppText>
            <AppText
              variant="bodyMedium"
              center
              color={Colors.neutral[500]}
              style={styles.subtitle}>
              Since you are under 18, we have sent an email to your parent or guardian. Please ask them to review the Terms & Conditions and provide the activation code.
            </AppText>
          </View>

          <View style={styles.inputSection}>
            <AppText variant="labelLarge" color={Colors.neutral[700]} style={{marginBottom: 8}}>
              Parent Activation Code
            </AppText>
            <Input
              placeholder="Enter 6-digit PIN"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoCapitalize="none"
              style={{textAlign: 'center', fontSize: moderateScale(20), letterSpacing: 4}}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Activate Account"
              color="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleActivate}
              disabled={code.length < 6}
              style={styles.activateButton}
            />
            
            <Button
              title="Resend Email"
              variant="outline"
              color="primary"
              size="lg"
              fullWidth
              onPress={handleResend}
              style={styles.resendButton}
            />
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(24),
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  iconWrapper: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(24),
  },
  title: {
    marginBottom: verticalScale(12),
  },
  subtitle: {
    lineHeight: verticalScale(22),
    paddingHorizontal: horizontalScale(12),
  },
  inputSection: {
    marginBottom: verticalScale(32),
  },
  buttonContainer: {
    marginTop: 'auto',
    gap: verticalScale(12),
  },
  activateButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
  },
  resendButton: {
    borderRadius: BorderRadius.xl,
    height: verticalScale(52),
  },
});
