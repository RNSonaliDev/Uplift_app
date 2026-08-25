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

export function BeneficiaryTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        unmountOnBlur: true,
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors.neutral[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.neutral[200],
          backgroundColor: Colors.neutral[0],
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...Typography.caption,
        },
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
