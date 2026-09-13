import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OrganizationDashboardScreen} from '../screens/organization/dashboard/OrganizationDashboardScreen';
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

type OrganizationHomeStackParamList = {
  OrganizationDashboard: undefined;
  SelectCategory: undefined;
  RequestDetails: undefined;
  AdditionalInfo: undefined;
  ReviewRequest: undefined;
  RequestCreated: undefined;
  OrgRequestDetails: { request: any };
  OrgRequestTracking: { request: any };
  AllVolunteers: { request: any; requestId?: number };
};

const Stack = createNativeStackNavigator<OrganizationHomeStackParamList>();

export default function OrganizationHomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="OrganizationDashboard"
        component={OrganizationDashboardScreen}
      />
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
    </Stack.Navigator>
  );
}
