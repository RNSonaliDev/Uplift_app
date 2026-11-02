import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyProfileScreen from '../screens/beneficiary/profile/MyProfileScreen';
import ProfilePreviewScreen from '../screens/beneficiary/profile/ProfilePreviewScreen';
import SettingsScreen from '../screens/beneficiary/profile/SettingsScreen';
import EditProfileScreen from '../screens/beneficiary/profile/EditProfileScreen';
import LegalContentScreen from '../screens/beneficiary/profile/LegalContentScreen';
import ContactSupportScreen from '../screens/beneficiary/profile/ContactSupportScreen';
import ContactSupportDetailsScreen from '../screens/beneficiary/profile/ContactSupportDetailsScreen';
import CreateSupportRequestScreen from '../screens/beneficiary/profile/CreateSupportRequestScreen';
import FAQScreen from '../screens/beneficiary/profile/FAQScreen';
import PoliciesScreen from '../screens/beneficiary/profile/PoliciesScreen';

import EmergencyContactsScreen from '../screens/beneficiary/profile/EmergencyContactsScreen';

const Stack = createNativeStackNavigator();

export default function BeneficiaryProfileStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="ProfilePreview" component={ProfilePreviewScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="LegalContent" component={LegalContentScreen} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="ContactSupportDetails" component={ContactSupportDetailsScreen} />
      <Stack.Screen name="CreateSupportRequest" component={CreateSupportRequestScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="Policies" component={PoliciesScreen} />
    </Stack.Navigator>
  );
}
