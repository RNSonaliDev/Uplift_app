import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OrganizationDashboardScreen} from '../screens/organization/dashboard/OrganizationDashboardScreen';
import {SelectCategoryScreen} from '../screens/organization/createRequest/SelectCategoryScreen';
import {RequestDetailsScreen} from '../screens/organization/createRequest/RequestDetailsScreen';
import {LocationVolunteersScreen} from '../screens/organization/createRequest/LocationVolunteersScreen';
import {AdditionalInfoScreen} from '../screens/organization/createRequest/AdditionalInfoScreen';
import {ReviewRequestScreen} from '../screens/organization/createRequest/ReviewRequestScreen';
import {RequestCreatedScreen} from '../screens/organization/createRequest/RequestCreatedScreen';
import {OrgRequestDetailsScreen} from '../screens/organization/dashboard/OrgRequestDetailsScreen';

type OrganizationHomeStackParamList = {
  OrganizationDashboard: undefined;
  SelectCategory: undefined;
  RequestDetails: undefined;
  LocationVolunteers: undefined;
  AdditionalInfo: undefined;
  ReviewRequest: undefined;
  RequestCreated: undefined;
  OrgRequestDetails: { request: any };
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
      <Stack.Screen name="LocationVolunteers" component={LocationVolunteersScreen} />
      <Stack.Screen name="AdditionalInfo" component={AdditionalInfoScreen} />
      <Stack.Screen name="ReviewRequest" component={ReviewRequestScreen} />
      <Stack.Screen name="RequestCreated" component={RequestCreatedScreen} />
      <Stack.Screen name="OrgRequestDetails" component={OrgRequestDetailsScreen} />
    </Stack.Navigator>
  );
}
