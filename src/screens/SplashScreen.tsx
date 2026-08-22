import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, StatusBar, Animated, Text, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { loadAuthToken } from '../api/client';
import { authApi } from '../api';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { logo, backgroundimage } from '../assets/images';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  DashboardRoleSelection: { selectedRoles: string[] };
  BeneficiaryFlow: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const circle1Scale = useRef(new Animated.Value(0)).current;
  const circle2Scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animationsp
    Animated.sequence([
      // 1. Animate circles in
      Animated.parallel([
        Animated.spring(circle1Scale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(circle2Scale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
          delay: 200,
        }),
      ]),
      // 2. Animate logo
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 10,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 3. Animate text
      Animated.parallel([
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Check for existing token and navigate
    const checkTokenAndNavigate = async () => {
      try {
        const token = await loadAuthToken();
        if (token) {
          // Verify token by fetching profile
          const response = await authApi.getProfile();
          const selectedRoles = response.selected_roles || [];
          
          if (selectedRoles.length > 1) {
            navigation.replace('DashboardRoleSelection', { selectedRoles });
          } else {
            // Placeholder: Go to BeneficiaryFlow if one role
            navigation.replace('BeneficiaryFlow');
          }
        } else {
          navigation.replace('Welcome');
        }
      } catch (error) {
        // Token invalid or network error, fallback to Welcome
        navigation.replace('Welcome');
      }
    };

    // Wait at least 3.5 seconds before navigating
    const timer = setTimeout(() => {
      checkTokenAndNavigate();
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation, logoScale, logoOpacity, textTranslateY, textOpacity, circle1Scale, circle2Scale]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral[0]} />
      
      {/* Background Image with very low opacity for texture */}
      <Image 
        source={backgroundimage} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      />

      {/* Decorative background elements */}
      <Animated.View 
        style={[
          styles.circle, 
          styles.circleTopRight,
          { transform: [{ scale: circle1Scale }] }
        ]} 
      />
      <Animated.View 
        style={[
          styles.circle, 
          styles.circleBottomLeft,
          { transform: [{ scale: circle2Scale }] }
        ]} 
      />

      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }]
            }
          ]}
        >
          {/* <View style={styles.logoBackground}> */}
            <Image 
              source={logo} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          {/* </View> */}
        </Animated.View>
        
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
            alignItems: 'center',
          }}
        >
        </Animated.View>
      </View>
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
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.05,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoBackground: {
    width: 140,
    height: 140,
    backgroundColor: Colors.neutral[0],
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 35,
    elevation: 15,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  appName: {
    ...Typography.h1,
    color: Colors.primary[700],
    letterSpacing: 4,
    marginBottom: 12,
  },
  tagline: {
    ...Typography.bodyLarge,
    color: Colors.neutral[600],
    letterSpacing: 1.5,
  },
  // Decorative circles
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleTopRight: {
    width: 400,
    height: 400,
    top: -150,
    right: -150,
    backgroundColor: Colors.primary[100],
    opacity: 0.6,
  },
  circleBottomLeft: {
    width: 500,
    height: 500,
    bottom: -200,
    left: -200,
    backgroundColor: Colors.secondary[100],
    opacity: 0.4,
  },
});
