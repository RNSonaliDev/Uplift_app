import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyScheduleScreen from '../screens/volunteer/schedule/MyScheduleScreen';
import StartRequestScreen from '../screens/volunteer/schedule/StartRequestScreen';
import CompleteRequestScreen from '../screens/volunteer/schedule/CompleteRequestScreen';
import RateExperienceScreen from '../screens/volunteer/schedule/RateExperienceScreen';

const Stack = createNativeStackNavigator();

export default function VolunteerScheduleStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MySchedule" component={MyScheduleScreen} />
      <Stack.Screen name="StartRequest" component={StartRequestScreen} />
      <Stack.Screen name="CompleteRequest" component={CompleteRequestScreen} />
      <Stack.Screen name="RateExperience" component={RateExperienceScreen} />
    </Stack.Navigator>
  );
}
