import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyScheduleScreen from '../screens/volunteer/schedule/MyScheduleScreen';
import StartRequestScreen from '../screens/volunteer/schedule/StartRequestScreen';
import CompleteRequestScreen from '../screens/volunteer/schedule/CompleteRequestScreen';
import RateExperienceScreen from '../screens/volunteer/schedule/RateExperienceScreen';
import RequestDetailsScreen from '../screens/volunteer/requests/RequestDetailsScreen';
import RequestAcceptedScreen from '../screens/volunteer/requests/RequestAcceptedScreen';
import { ParentTaskVerificationScreen } from '../screens/volunteer/requests/ParentTaskVerificationScreen';

const Stack = createNativeStackNavigator();

export default function VolunteerScheduleStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MySchedule" component={MyScheduleScreen} />
      <Stack.Screen name="StartRequest" component={StartRequestScreen} />
      <Stack.Screen name="CompleteRequest" component={CompleteRequestScreen} />
      <Stack.Screen name="RateExperience" component={RateExperienceScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      <Stack.Screen name="RequestAccepted" component={RequestAcceptedScreen} />
      <Stack.Screen name="ParentTaskVerification" component={ParentTaskVerificationScreen} />
    </Stack.Navigator>
  );
}
