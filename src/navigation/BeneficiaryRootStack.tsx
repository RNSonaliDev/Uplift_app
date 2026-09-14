import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {BeneficiaryTabNavigator} from './BeneficiaryTabNavigator';

import RequestHelpScreen from '../screens/beneficiary/home/RequestHelpScreen';
import RequestDetailsScreen from '../screens/beneficiary/home/RequestDetailsScreen';

import BeneficiaryRequestDetailsScreen from '../screens/beneficiary/requests/BeneficiaryRequestDetailsScreen';
import RequestTrackingScreen from '../screens/beneficiary/requests/RequestTrackingScreen';
import CreateRequestScreen from '../screens/beneficiary/requests/CreateRequestScreen';
import PreviewRequestScreen from '../screens/beneficiary/requests/PreviewRequestScreen';
import RequestSubmittedScreen from '../screens/beneficiary/requests/RequestSubmittedScreen';
import RateHelperScreen from '../screens/beneficiary/requests/RateHelperScreen';
import ChatScreen from '../screens/chat/ChatScreen';

import EditProfileScreen from '../screens/beneficiary/profile/EditProfileScreen';
import SettingsScreen from '../screens/beneficiary/profile/SettingsScreen';
import LegalContentScreen from '../screens/beneficiary/profile/LegalContentScreen';
import EmergencyContactsScreen from '../screens/beneficiary/profile/EmergencyContactsScreen';
import ContactSupportScreen from '../screens/beneficiary/profile/ContactSupportScreen';
import ContactSupportDetailsScreen from '../screens/beneficiary/profile/ContactSupportDetailsScreen';
import CreateSupportRequestScreen from '../screens/beneficiary/profile/CreateSupportRequestScreen';

const Stack = createNativeStackNavigator();

export function BeneficiaryRootStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="BeneficiaryTabs" component={BeneficiaryTabNavigator} />
      
      {/* Home Stack Screens */}
      <Stack.Screen name="RequestHelp" component={RequestHelpScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />

      {/* Requests Stack Screens */}
      <Stack.Screen name="BeneficiaryRequestDetails" component={BeneficiaryRequestDetailsScreen} />
      <Stack.Screen name="RequestTracking" component={RequestTrackingScreen} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
      <Stack.Screen name="PreviewRequest" component={PreviewRequestScreen} />
      <Stack.Screen name="RequestSubmitted" component={RequestSubmittedScreen} />
      <Stack.Screen name="RateHelper" component={RateHelperScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />

      {/* Profile Stack Screens */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="LegalContent" component={LegalContentScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="ContactSupportDetails" component={ContactSupportDetailsScreen} />
      <Stack.Screen name="CreateSupportRequest" component={CreateSupportRequestScreen} />
    </Stack.Navigator>
  );
}
