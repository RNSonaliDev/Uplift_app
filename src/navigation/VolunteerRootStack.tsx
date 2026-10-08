import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {VolunteerTabNavigator} from './VolunteerTabNavigator';
import {PromotionDetailsScreen} from '../screens/organization/promotions/PromotionDetailsScreen';

const Stack = createNativeStackNavigator();

export function VolunteerRootStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="VolunteerTabs" component={VolunteerTabNavigator} />
      <Stack.Screen name="PromotionDetails" component={PromotionDetailsScreen} />
    </Stack.Navigator>
  );
}
