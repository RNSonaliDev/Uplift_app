import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyRequestsScreen from '../screens/beneficiary/requests/MyRequestsScreen';
import RequestTrackingScreen from '../screens/beneficiary/requests/RequestTrackingScreen';

const Stack = createNativeStackNavigator();

export default function BeneficiaryRequestsStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
      <Stack.Screen name="RequestTracking" component={RequestTrackingScreen} />
    </Stack.Navigator>
  );
}
