import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';
import {Home, List, Users, Briefcase, User} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {OrganizationRequestsScreen} from '../screens/organization/dashboard/OrganizationRequestsScreen';
import {OrganizationDashboardScreen} from '../screens/organization/dashboard/OrganizationDashboardScreen';
import {JobsListingScreen} from '../screens/organization/jobs/JobsListingScreen';
import MyProfileScreen from '../screens/beneficiary/profile/MyProfileScreen';

const Tab = createBottomTabNavigator();

const ComingSoonScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Coming Soon</Text>
  </View>
);

export function OrganizationTabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
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
      }}>
      <Tab.Screen
        name="HomeTab"
        component={OrganizationDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({color}) => <Home color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('HomeTab');
          },
        })}
      />
      <Tab.Screen
        name="RequestsTab"
        component={OrganizationRequestsScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({color}) => <List color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('RequestsTab');
          },
        })}
      />
      <Tab.Screen
        name="JobsTab"
        component={JobsListingScreen}
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: ({color}) => <Briefcase color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('JobsTab');
          },
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={MyProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => <User color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('ProfileTab');
          },
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
  text: {
    fontSize: 18,
    color: Colors.neutral[700],
  },
});
