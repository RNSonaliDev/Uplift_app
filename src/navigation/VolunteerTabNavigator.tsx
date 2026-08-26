import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text} from 'react-native';
import {Colors} from '../theme/colors';
import {Typography, FontFamily} from '../theme/typography';
import {Home, Search, Calendar, Heart, User} from 'lucide-react-native';

import VolunteerHomeStack from './VolunteerHomeStack';
import VolunteerRequestsStack from './VolunteerRequestsStack';
import VolunteerScheduleStack from './VolunteerScheduleStack';
import BeneficiaryProfileStack from './BeneficiaryProfileStack';

const Tab = createBottomTabNavigator();

// Dummy component for unimplemented tabs
const DummyScreen = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text>Coming Soon</Text>
  </View>
);

export function VolunteerTabNavigator() {
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
          // ...Typography.caption,
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={VolunteerHomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => <Home color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('HomeTab', { screen: 'VolunteerDashboard' });
          },
        })}
      />
      <Tab.Screen
        name="RequestsTab"
        component={VolunteerRequestsStack}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({color}) => <Search color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('RequestsTab', { screen: 'BrowseRequests' });
          },
        })}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={VolunteerScheduleStack}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({color}) => <Calendar color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('ScheduleTab', { screen: 'MySchedule' });
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
