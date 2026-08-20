import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyProfileScreen from '../screens/beneficiary/profile/MyProfileScreen';
import SettingsScreen from '../screens/beneficiary/profile/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function BeneficiaryProfileStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
