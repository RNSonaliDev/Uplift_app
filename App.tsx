/**
 * UpliftApp - Main Application Entry
 *
 * @format
 */
import React from 'react';
import { View } from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Toast, {BaseToast, ErrorToast, ToastConfig} from 'react-native-toast-message';

import {WelcomeScreen} from './src/screens/WelcomeScreen';
import {CreateAccountScreen} from './src/screens/CreateAccountScreen';
import {VerifyAccountScreen} from './src/screens/VerifyAccountScreen';
import {CreateProfileScreen} from './src/screens/CreateProfileScreen';
import {SelectRolesScreen} from './src/screens/SelectRolesScreen';
import {SplashScreen} from './src/screens/SplashScreen';
import {LoginScreen} from './src/screens/LoginScreen';
import {OrganizationSetupScreen} from './src/screens/OrganizationSetupScreen';
import {SponsorSetupScreen} from './src/screens/SponsorSetupScreen';
import {VolunteerSetupScreen} from './src/screens/VolunteerSetupScreen';
import {BeneficiarySetupScreen} from './src/screens/BeneficiarySetupScreen';
import {SuccessScreen} from './src/screens/SuccessScreen';
import {DashboardRoleSelectionScreen} from './src/screens/DashboardRoleSelectionScreen';
import {Colors} from './src/theme/colors';
import {BeneficiaryTabNavigator} from './src/navigation/BeneficiaryTabNavigator';
import {VolunteerTabNavigator} from './src/navigation/VolunteerTabNavigator';
import {DummyTabNavigator} from './src/navigation/DummyTabNavigator';
import LegalContentScreen from './src/screens/beneficiary/profile/LegalContentScreen';

type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  CreateAccount: undefined;
  VerifyAccount: { emailOrPhone: string };
  CreateProfile: undefined;
  SelectRoles: undefined;
  OrganizationSetup: undefined;
  SponsorSetup: undefined;
  VolunteerSetup: undefined;
  BeneficiarySetup: undefined;
  Success: { selectedRoles?: string[] } | undefined;
  DashboardRoleSelection: { selectedRoles: string[] };
  BeneficiaryFlow: undefined;
  VolunteerFlow: undefined;
  OrganizationFlow: undefined;
  SponsorFlow: undefined;
  LegalContent: { type: 'terms' | 'privacy' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/*
  Custom toast config to increase font sizes
*/
const toastStyle = {
  height: 'auto', 
  minHeight: 70, 
  paddingVertical: 12,
  borderLeftWidth: 8,
  borderRadius: 12,
  backgroundColor: Colors.neutral[0],
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 10,
  elevation: 8,
};

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={[toastStyle, { borderLeftColor: Colors.primary[500] || '#4CAF50' }]}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
      text1Style={{
        fontSize: 18,
        fontWeight: '800',
        color: Colors.neutral[900] || '#000',
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 15,
        fontWeight: '500',
        color: Colors.neutral[600] || '#444'
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={[toastStyle, { borderLeftColor: Colors.error || '#F44336' }]}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
      text1Style={{
        fontSize: 18,
        fontWeight: '800',
        color: Colors.neutral[900] || '#000',
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 15,
        fontWeight: '500',
        color: Colors.neutral[600] || '#444'
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={[toastStyle, { borderLeftColor: '#2196F3' }]}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
      text1Style={{
        fontSize: 18,
        fontWeight: '800',
        color: Colors.neutral[900] || '#000',
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 15,
        fontWeight: '500',
        color: Colors.neutral[600] || '#444'
      }}
    />
  )
};

function App() {
  return (
    <SafeAreaProvider>
      <View style={{flex: 1, backgroundColor: Colors.neutral[0]}}>
        <NavigationContainer>
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
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen name="DashboardRoleSelection" component={DashboardRoleSelectionScreen} />
            <Stack.Screen name="BeneficiaryFlow" component={BeneficiaryTabNavigator} />
            <Stack.Screen name="VolunteerFlow" component={VolunteerTabNavigator} />
            <Stack.Screen name="OrganizationFlow" component={DummyTabNavigator} />
            <Stack.Screen name="SponsorFlow" component={DummyTabNavigator} />
            <Stack.Screen name="LegalContent" component={LegalContentScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
      <Toast position="bottom" bottomOffset={60} config={toastConfig} />
    </SafeAreaProvider>
  );
}

export default App;
