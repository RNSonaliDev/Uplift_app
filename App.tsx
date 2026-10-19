/**
 * UpliftApp - Main Application Entry
 *
 * @format
 */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Toast, {BaseToast, ErrorToast, ToastConfig} from 'react-native-toast-message';
import { StripeProvider } from '@stripe/stripe-react-native';

import {WelcomeScreen} from './src/screens/WelcomeScreen';
import {CreateAccountScreen} from './src/screens/CreateAccountScreen';
import {VerifyAccountScreen} from './src/screens/VerifyAccountScreen';
import {CreateProfileScreen} from './src/screens/CreateProfileScreen';
import {SelectRolesScreen} from './src/screens/SelectRolesScreen';
import {SplashScreen} from './src/screens/SplashScreen';
import {LoginScreen} from './src/screens/LoginScreen';
import {OrganizationSetupScreen} from './src/screens/OrganizationSetupScreen';
import {SponsorSetupScreen} from './src/screens/SponsorSetupScreen';
import { VolunteerSetupScreen } from './src/screens/VolunteerSetupScreen';
import { BeneficiarySetupScreen } from './src/screens/BeneficiarySetupScreen';
import { ParentVerificationScreen } from './src/screens/ParentVerificationScreen';
import {SuccessScreen} from './src/screens/SuccessScreen';
import {DashboardRoleSelectionScreen} from './src/screens/DashboardRoleSelectionScreen';
import {Colors} from './src/theme/colors';
import {BeneficiaryRootStack} from './src/navigation/BeneficiaryRootStack';
import {VolunteerRootStack} from './src/navigation/VolunteerRootStack';
import {OrganizationRootStack} from './src/navigation/OrganizationRootStack';
import {SponsorTabNavigator} from './src/navigation/SponsorTabNavigator';
import {DummyTabNavigator} from './src/navigation/DummyTabNavigator';
import LegalContentScreen from './src/screens/beneficiary/profile/LegalContentScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ContactSupportScreen from './src/screens/beneficiary/profile/ContactSupportScreen';
import ContactSupportDetailsScreen from './src/screens/beneficiary/profile/ContactSupportDetailsScreen';
import CreateSupportRequestScreen from './src/screens/beneficiary/profile/CreateSupportRequestScreen';
import { pushNotificationService } from './src/services/PushNotificationService';

type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  CreateAccount: undefined;
  VerifyAccount: { emailOrPhone: string, dob?: string, parentEmail?: string };
  CreateProfile: { verificationToken?: string, emailOrPhone?: string, firstName?: string, lastName?: string, dob?: string, parentEmail?: string };
  SelectRoles: undefined;
  OrganizationSetup: undefined;
  SponsorSetup: undefined;
  VolunteerSetup: undefined;
  BeneficiarySetup: undefined;
  ParentVerification: { parentEmail: string };
  Success: { selectedRoles?: string[] } | undefined;
  DashboardRoleSelection: { selectedRoles: string[] };
  BeneficiaryFlow: undefined;
  VolunteerFlow: undefined;
  OrganizationFlow: undefined;
  SponsorFlow: undefined;
  LegalContent: {
    type?: 'terms' | 'privacy' | 'guidelines' | 'safety' | 'minor-volunteer';
    slug?: string;
    title?: string;
  };
  Notifications: undefined;
  ContactSupport: undefined;
  ContactSupportDetails: { id: number };
  CreateSupportRequest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import {toastConfig} from './src/theme';

import { navigationRef } from './src/navigation/navigationRef';
import { registerUnauthorizedHandler } from './src/api/client';

function App() {
  useEffect(() => {
    // Request permission and get FCM token on startup
    pushNotificationService.requestUserPermission();
    
    // Register unregister callback on 401 Unauthorized
    registerUnauthorizedHandler(async () => {
      try {
        await pushNotificationService.unregisterDeviceToken();
      } catch (e) {
        console.log('Failed to unregister FCM token on 401', e);
      }
    });

    // Listen for foreground notifications
    const unsubscribe = pushNotificationService.setupForegroundListener();
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{flex: 1, backgroundColor: Colors.neutral[0]}}>
        <StripeProvider publishableKey="pk_live_51UA9Vr3T0Xq4ckhgpnDwmjAfH29tVl640q12dpF43B5udwLorka67xL2ph8DAv856mesJX4eIQ6pLw1quC1jIJmt00j8dO84MQ">
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{headerShown: false}}>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
              <Stack.Screen name="VerifyAccount" component={VerifyAccountScreen} />
              <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
              <Stack.Screen name="SelectRoles" component={SelectRolesScreen} />
              <Stack.Screen name="OrganizationSetup" component={OrganizationSetupScreen} />
              <Stack.Screen name="SponsorSetup" component={SponsorSetupScreen} />
              <Stack.Screen name="VolunteerSetup" component={VolunteerSetupScreen} />
              <Stack.Screen name="BeneficiarySetup" component={BeneficiarySetupScreen} />
          <Stack.Screen name="ParentVerification" component={ParentVerificationScreen} />
              <Stack.Screen name="Success" component={SuccessScreen} />
              <Stack.Screen name="DashboardRoleSelection" component={DashboardRoleSelectionScreen} />
              <Stack.Screen name="BeneficiaryFlow" component={BeneficiaryRootStack} />
              <Stack.Screen name="VolunteerFlow" component={VolunteerRootStack} />
              <Stack.Screen name="OrganizationFlow" component={OrganizationRootStack} />
              <Stack.Screen name="SponsorFlow" component={SponsorTabNavigator} />
              <Stack.Screen name="LegalContent" component={LegalContentScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
              <Stack.Screen name="ContactSupportDetails" component={ContactSupportDetailsScreen} />
              <Stack.Screen name="CreateSupportRequest" component={CreateSupportRequestScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </StripeProvider>
      </View>
      <Toast position="bottom" bottomOffset={60} config={toastConfig} />
    </SafeAreaProvider>
  );
}

export default App;
