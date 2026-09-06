import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import ContributionsListScreen from '../screens/sponsor/contributions/ContributionsListScreen';
import ContributionDetailsScreen from '../screens/sponsor/contributions/ContributionDetailsScreen';

const Stack = createNativeStackNavigator();

export default function SponsorContributionsStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ContributionsList" component={ContributionsListScreen} />
      <Stack.Screen name="ContributionDetails" component={ContributionDetailsScreen} />
    </Stack.Navigator>
  );
}
