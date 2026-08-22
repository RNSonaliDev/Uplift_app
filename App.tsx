/**
 * UpliftApp - Main Application Entry
 *
 * @format
 */

import React, {useState} from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: Colors.neutral[0]}}>
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
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;
