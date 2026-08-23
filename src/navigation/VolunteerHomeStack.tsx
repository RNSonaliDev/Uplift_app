import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import VolunteerDashboardScreen from '../screens/volunteer/home/VolunteerDashboardScreen';

const Stack = createNativeStackNavigator();

export default function VolunteerHomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="VolunteerDashboard" component={VolunteerDashboardScreen} />
    </Stack.Navigator>
  );
}
