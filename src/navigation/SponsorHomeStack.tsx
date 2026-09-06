import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import SponsorDashboardScreen from '../screens/sponsor/home/SponsorDashboardScreen';
import ChooseAmountScreen from '../screens/sponsor/home/ChooseAmountScreen';
import PaymentDetailsScreen from '../screens/sponsor/home/PaymentDetailsScreen';
import ProcessingPaymentScreen from '../screens/sponsor/home/ProcessingPaymentScreen';
import PaymentSuccessfulScreen from '../screens/sponsor/home/PaymentSuccessfulScreen';

const Stack = createNativeStackNavigator();

export default function SponsorHomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SponsorDashboard" component={SponsorDashboardScreen} />
      <Stack.Screen name="ChooseAmount" component={ChooseAmountScreen} />
      <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
      <Stack.Screen name="ProcessingPayment" component={ProcessingPaymentScreen} />
      <Stack.Screen name="PaymentSuccessful" component={PaymentSuccessfulScreen} />
    </Stack.Navigator>
  );
}
