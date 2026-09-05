import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {JobsListingScreen} from '../screens/organization/jobs/JobsListingScreen';
import {CreateJobScreen} from '../screens/organization/jobs/CreateJobScreen';
import {JobPreviewScreen} from '../screens/organization/jobs/JobPreviewScreen';
import {JobDetailsScreen} from '../screens/organization/jobs/JobDetailsScreen';

type OrganizationJobsStackParamList = {
  JobsListing: undefined;
  CreateJob: undefined;
  JobPreview: { job: any };
  JobDetails: { job: any };
};

const Stack = createNativeStackNavigator<OrganizationJobsStackParamList>();

export default function OrganizationJobsStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="JobsListing" component={JobsListingScreen} />
      <Stack.Screen name="CreateJob" component={CreateJobScreen} />
      <Stack.Screen name="JobPreview" component={JobPreviewScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
    </Stack.Navigator>
  );
}
