import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Colors} from '../theme/colors';
import {Typography, FontFamily} from '../theme/typography';
import {Home, List, MessageSquare, User} from 'lucide-react-native';

import BeneficiaryDashboardScreen from '../screens/beneficiary/home/BeneficiaryDashboardScreen';
import MyRequestsScreen from '../screens/beneficiary/requests/MyRequestsScreen';
import MyProfileScreen from '../screens/beneficiary/profile/MyProfileScreen';

const Tab = createBottomTabNavigator();

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BeneficiaryTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        unmountOnBlur: true,
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors.neutral[900],
        tabBarStyle: {
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
      }}>
      <Tab.Screen
        name="BeneficiaryDashboard"
        component={BeneficiaryDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => <Home color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('BeneficiaryDashboard');
          },
        })}
      />
      <Tab.Screen
        name="MyRequests"
        component={MyRequestsScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({color, size}) => <List color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('MyRequests');
          },
        })}
      />
      <Tab.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => <User color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('MyProfile');
          },
        })}
      />
    </Tab.Navigator>
  );
}
