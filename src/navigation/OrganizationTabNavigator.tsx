import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';
import {Home, List, Users, MessageSquare, User} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OrganizationHomeStack from './OrganizationHomeStack';
import BeneficiaryProfileStack from './BeneficiaryProfileStack'; // Reusing profile stack for now
import {OrganizationRequestsScreen} from '../screens/organization/dashboard/OrganizationRequestsScreen';

const Tab = createBottomTabNavigator();

const ComingSoonScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Coming Soon</Text>
  </View>
);

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

export function OrganizationTabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? '';
        const hiddenRoutes = [
          'SelectCategory',
          'RequestDetails',
          'LocationVolunteers',
          'AdditionalInfo',
          'ReviewRequest',
          'RequestCreated'
        ];
        const isHidden = hiddenRoutes.includes(routeName);

        return {
          headerShown: false,
          unmountOnBlur: true,
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
        name="HomeTab"
        component={OrganizationHomeStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({color}) => <Home color={color} size={24} />,
        }}
        listeners={({navigation}) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('HomeTab', { screen: 'OrganizationDashboard' });
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
      />
      <Tab.Screen
        name="VolunteersTab"
        component={ComingSoonScreen}
        options={{
          tabBarLabel: 'Volunteers',
          tabBarIcon: ({color}) => <Users color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={ComingSoonScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({color}) => <MessageSquare color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={BeneficiaryProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color}) => <User color={color} size={24} />,
        }}
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
