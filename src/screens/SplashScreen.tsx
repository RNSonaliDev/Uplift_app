import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, StatusBar, Animated, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { logo } from '../assets/images';

type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    // Navigate to Welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      // navigation.replace('Welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, translateY]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      
      {/* Decorative background elements */}
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleBottomLeft]} />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateY }
            ]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={logo} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>UPLIFT</Text>
        <Text style={styles.tagline}>Empowering Communities</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    shadowColor: Colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  logoImage: {
    width: 160,
    height: 160,
    borderRadius: 32, 
  },
  appName: {
    ...Typography.h1,
    color: Colors.primary[600],
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
    letterSpacing: 0.5,
  },
  // Decorative circles
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.primary[50],
    opacity: 0.5,
  },
  circleTopRight: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circleBottomLeft: {
    width: 400,
    height: 400,
    bottom: -150,
    left: -150,
    backgroundColor: Colors.secondary[50],
  },
});
