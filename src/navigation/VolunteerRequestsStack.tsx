import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BrowseRequestsScreen from '../screens/volunteer/requests/BrowseRequestsScreen';
import RequestDetailsScreen from '../screens/volunteer/requests/RequestDetailsScreen';
import RequestAcceptedScreen from '../screens/volunteer/requests/RequestAcceptedScreen';
import { ParentTaskVerificationScreen } from '../screens/volunteer/requests/ParentTaskVerificationScreen';

const Stack = createNativeStackNavigator();

export default function VolunteerRequestsStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="BrowseRequests" component={BrowseRequestsScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      <Stack.Screen name="RequestAccepted" component={RequestAcceptedScreen} />
      <Stack.Screen name="ParentTaskVerification" component={ParentTaskVerificationScreen} />
    </Stack.Navigator>
  );
}
