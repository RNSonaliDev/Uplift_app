import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
} from 'react-native';
import {AppText} from '../components/AppText';
import {Button} from '../components/Button';
import {UpliftLogo} from '../components/UpliftLogo';
import {Colors} from '../theme/colors';
import {BorderRadius} from '../theme/spacing';
import {
  wp,
  hp,
  moderateScale,
  fontScale,
  verticalScale,
  horizontalScale,
} from '../utils/responsive';

import { whatsappImage } from '../assets/images';

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
  const [modalConfig, setModalConfig] = useState<{visible: boolean, type: 'terms' | 'privacy'}>({visible: false, type: 'terms'});

  const openTerms = () => setModalConfig({visible: true, type: 'terms'});
  const openPrivacy = () => setModalConfig({visible: true, type: 'privacy'});
  const closeModal = () => setModalConfig({...modalConfig, visible: false});

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
          <AppText variant="h2" center color={Colors.primary[900]}>
            Stronger Together.
          </AppText>
          <AppText
            variant="h2"
            center
            color={Colors.primary[500]}>
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
        <View style={styles.illustrationContainer}>
          <Image
            source={whatsappImage}
            style={styles.illustration}
            resizeMode="cover"
          />
        </View>

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
              <TouchableOpacity onPress={openTerms}>
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
              <TouchableOpacity onPress={openPrivacy}>
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

      {/* Terms & Privacy Modal */}
      <Modal visible={modalConfig.visible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="h3" weight="bold">
                {modalConfig.type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </AppText>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <AppText color={Colors.primary[500]} weight="semiBold">Close</AppText>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <AppText variant="bodyMedium" color={Colors.neutral[600]}>
                {modalConfig.type === 'terms' ? (
                  <>
                    Welcome to Uplift! These Terms of Service govern your use of our app and services.
                    {'\n\n'}
                    By using Uplift, you agree to these terms. Please read them carefully.
                    {'\n\n'}
                    1. Use of Service
                    {'\n'}
                    You must be at least 13 years old to use Uplift. You are responsible for all activities that occur under your account.
                    {'\n\n'}
                    2. Content
                    {'\n'}
                    You retain ownership of the content you post, but you grant us a license to use it to provide our services.
                    {'\n\n'}
                    3. Prohibited Conduct
                    {'\n'}
                    You agree not to engage in any harassment, spamming, or illegal activities on our platform.
                    {'\n\n'}
                    4. Termination
                    {'\n'}
                    We reserve the right to terminate or suspend your account at any time for violations of these terms.
                    {'\n\n'}
                    (This is a placeholder for the full Terms of Service.)
                  </>
                ) : (
                  <>
                    Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
                    {'\n\n'}
                    1. Information We Collect
                    {'\n'}
                    We collect information you provide directly to us, such as when you create an account or update your profile.
                    {'\n\n'}
                    2. How We Use Your Information
                    {'\n'}
                    We use your information to provide, maintain, and improve our services, as well as to communicate with you.
                    {'\n\n'}
                    3. Sharing of Information
                    {'\n'}
                    We do not sell your personal information. We may share information with trusted service providers who assist us in operating our app.
                    {'\n\n'}
                    4. Security
                    {'\n'}
                    We implement reasonable security measures to protect your information, but no system is completely secure.
                    {'\n\n'}
                    (This is a placeholder for the full Privacy Policy.)
                  </>
                )}
              </AppText>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  description: {
    marginTop: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
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
    width: "100%",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: hp(80),
    paddingBottom: verticalScale(32),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: horizontalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  closeButton: {
    padding: moderateScale(4),
  },
  modalBody: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
  },
});
