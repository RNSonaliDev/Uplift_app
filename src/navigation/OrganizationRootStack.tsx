import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OrganizationTabNavigator} from './OrganizationTabNavigator';

// Organization Dashboard / Home
import {SelectCategoryScreen} from '../screens/organization/createRequest/SelectCategoryScreen';
import {RequestDetailsScreen} from '../screens/organization/createRequest/RequestDetailsScreen';
import {AdditionalInfoScreen} from '../screens/organization/createRequest/AdditionalInfoScreen';
import {ReviewRequestScreen} from '../screens/organization/createRequest/ReviewRequestScreen';
import {RequestCreatedScreen} from '../screens/organization/createRequest/RequestCreatedScreen';
import {OrgRequestDetailsScreen} from '../screens/organization/dashboard/OrgRequestDetailsScreen';
import {OrgRequestTrackingScreen} from '../screens/organization/dashboard/OrgRequestTrackingScreen';
import {AllVolunteersScreen} from '../screens/organization/dashboard/AllVolunteersScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import RateHelperScreen from '../screens/beneficiary/requests/RateHelperScreen';

// Organization Jobs
import {CreateJobScreen} from '../screens/organization/jobs/CreateJobScreen';
import {JobPreviewScreen} from '../screens/organization/jobs/JobPreviewScreen';
import {JobDetailsScreen} from '../screens/organization/jobs/JobDetailsScreen';

// Profile
import EditProfileScreen from '../screens/beneficiary/profile/EditProfileScreen';
import SettingsScreen from '../screens/beneficiary/profile/SettingsScreen';
import LegalContentScreen from '../screens/beneficiary/profile/LegalContentScreen';
import EmergencyContactsScreen from '../screens/beneficiary/profile/EmergencyContactsScreen';
import ContactSupportScreen from '../screens/beneficiary/profile/ContactSupportScreen';
import ContactSupportDetailsScreen from '../screens/beneficiary/profile/ContactSupportDetailsScreen';
import CreateSupportRequestScreen from '../screens/beneficiary/profile/CreateSupportRequestScreen';

const Stack = createNativeStackNavigator();

export function OrganizationRootStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="OrganizationTabs" component={OrganizationTabNavigator} />
      
      {/* Home / Request Creation Screens */}
      <Stack.Screen name="SelectCategory" component={SelectCategoryScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      <Stack.Screen name="AdditionalInfo" component={AdditionalInfoScreen} />
      <Stack.Screen name="ReviewRequest" component={ReviewRequestScreen} />
      <Stack.Screen name="RequestCreated" component={RequestCreatedScreen} />
      <Stack.Screen name="OrgRequestDetails" component={OrgRequestDetailsScreen} />
      <Stack.Screen name="OrgRequestTracking" component={OrgRequestTrackingScreen} />
      <Stack.Screen name="AllVolunteers" component={AllVolunteersScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="RateHelper" component={RateHelperScreen} />

      {/* Jobs Stack Screens */}
      <Stack.Screen name="CreateJob" component={CreateJobScreen} />
      <Stack.Screen name="JobPreview" component={JobPreviewScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />

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
