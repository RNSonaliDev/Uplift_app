import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyRequestsScreen from '../screens/beneficiary/requests/MyRequestsScreen';
import RequestTrackingScreen from '../screens/beneficiary/requests/RequestTrackingScreen';
import CreateRequestScreen from '../screens/beneficiary/requests/CreateRequestScreen';
import PreviewRequestScreen from '../screens/beneficiary/requests/PreviewRequestScreen';
import RequestSubmittedScreen from '../screens/beneficiary/requests/RequestSubmittedScreen';
import RateHelperScreen from '../screens/beneficiary/requests/RateHelperScreen';

const Stack = createNativeStackNavigator();

export default function BeneficiaryRequestsStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
      <Stack.Screen name="RequestTracking" component={RequestTrackingScreen} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
      <Stack.Screen name="PreviewRequest" component={PreviewRequestScreen} />
      <Stack.Screen name="RequestSubmitted" component={RequestSubmittedScreen} />
      <Stack.Screen name="RateHelper" component={RateHelperScreen} />
    </Stack.Navigator>
  );
}
