import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Colors} from '../theme/colors';
import {Typography, FontFamily} from '../theme/typography';
import {Home, List, MessageSquare, User} from 'lucide-react-native';

import BeneficiaryHomeStack from './BeneficiaryHomeStack';
import BeneficiaryRequestsStack from './BeneficiaryRequestsStack';
import BeneficiaryMessagesStack from './BeneficiaryMessagesStack';
import BeneficiaryProfileStack from './BeneficiaryProfileStack';

const Tab = createBottomTabNavigator();

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BeneficiaryTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? '';
        const hiddenRoutes = ['RequestHelp', 'RequestTracking', 'RequestSubmitted', 'PreviewRequest', 'CreateRequest', 'RateHelper'];
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
          tabBarLabelStyle: {
            // ...Typography.caption,
          },
        };
      }}>
      <Tab.Screen
        name="HomeTab"
        component={BeneficiaryHomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => <Home color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('HomeTab', { screen: 'BeneficiaryDashboard' });
          },
        })}
      />
      <Tab.Screen
        name="RequestsTab"
        component={BeneficiaryRequestsStack}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({color, size}) => <List color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('RequestsTab', { screen: 'MyRequests' });
          },
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={BeneficiaryProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => <User color={color} size={24} />,
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
