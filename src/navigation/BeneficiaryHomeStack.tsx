import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BeneficiaryDashboardScreen from '../screens/beneficiary/home/BeneficiaryDashboardScreen';
import RequestHelpScreen from '../screens/beneficiary/home/RequestHelpScreen';
import RequestDetailsScreen from '../screens/beneficiary/home/RequestDetailsScreen';

const Stack = createNativeStackNavigator();

export default function BeneficiaryHomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="BeneficiaryDashboard" component={BeneficiaryDashboardScreen} />
      <Stack.Screen name="RequestHelp" component={RequestHelpScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
    </Stack.Navigator>
  );
}
