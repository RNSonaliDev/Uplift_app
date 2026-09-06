import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Colors} from '../theme/colors';
import {Home, Calendar, User} from 'lucide-react-native';

import SponsorHomeStack from './SponsorHomeStack';
import SponsorContributionsStack from './SponsorContributionsStack';
import BeneficiaryProfileStack from './BeneficiaryProfileStack';

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export function SponsorTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? (route.params as any)?.screen ?? '';
        const hiddenRoutes = [
          'ChooseAmount', 'PaymentDetails', 'ProcessingPayment', 'PaymentSuccessful',
          'ContributionDetails'
        ];
        const isHidden = hiddenRoutes.includes(routeName);

        return {
          unmountOnBlur: true,
          headerShown: false,
          tabBarActiveTintColor: Colors.primary[500],
          tabBarInactiveTintColor: Colors.neutral[400],
          tabBarStyle: isHidden ? { display: 'none' } : {
            borderTopWidth: 1,
            borderTopColor: Colors.neutral[200],
            backgroundColor: Colors.neutral[0],
            height: 60 + insets.bottom,
            paddingBottom: 8 + insets.bottom,
            paddingTop: 8,
          },
        };
      }}>
      <Tab.Screen
        name="DashboardTab"
        component={SponsorHomeStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({color}) => <Home color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('DashboardTab', { screen: 'SponsorDashboard' });
          },
        })}
      />
      <Tab.Screen
        name="ContributionsTab"
        component={SponsorContributionsStack}
        options={{
          tabBarLabel: 'Contributions',
          tabBarIcon: ({color}) => <Calendar color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('ContributionsTab', { screen: 'ContributionsList' });
          },
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={BeneficiaryProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => <User color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('ProfileTab', { screen: 'MyProfile' });
          },
        })}
      />
    </Tab.Navigator>
  );
}
