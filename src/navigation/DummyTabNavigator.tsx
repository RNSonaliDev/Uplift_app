import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet} from 'react-native';
import BeneficiaryProfileStack from './BeneficiaryProfileStack';
import {Colors} from '../theme/colors';
import {Home, User} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const ComingSoonScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Coming Soon</Text>
  </View>
);

export const DummyTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.neutral[0],
          borderTopColor: Colors.neutral[200],
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors.neutral[400],
      }}>
      <Tab.Screen
        name="DashboardTab"
        component={ComingSoonScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => <Home color={color} size={24} />,
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
};

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
