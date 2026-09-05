import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {BrowseJobsScreen} from '../screens/volunteer/jobs/BrowseJobsScreen';
import {VolunteerJobDetailsScreen} from '../screens/volunteer/jobs/VolunteerJobDetailsScreen';

type VolunteerJobsStackParamList = {
  BrowseJobs: undefined;
  VolunteerJobDetails: { job: any };
};

const Stack = createNativeStackNavigator<VolunteerJobsStackParamList>();

export default function VolunteerJobsStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="BrowseJobs" component={BrowseJobsScreen} />
      <Stack.Screen name="VolunteerJobDetails" component={VolunteerJobDetailsScreen} />
    </Stack.Navigator>
  );
}
