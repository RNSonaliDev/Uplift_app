import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {authApi, UserProfileResponse} from '../../../api/auth';
import {getFullImageUrl} from '../../../api/client';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
import {
  ChevronLeft,
  Edit2,
  Camera,
  User,
  MapPin,
  CreditCard,
  Phone,
  Bell,
  ChevronRight,
} from 'lucide-react-native';

export default function MyProfileScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.canGoBack() && navigation.goBack()} 
          style={[styles.iconBtn, !navigation.canGoBack() && {opacity: 0}]}
          disabled={!navigation.canGoBack()}
        >
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('EditProfile')}>
          {/* <Edit2 color={Colors.neutral[0]} size={24} /> */}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary[500]} style={{ marginVertical: 40 }} />
          ) : profile ? (
            <>
              <View style={styles.avatarContainer}>
                <Image 
                  source={{uri: getFullImageUrl(profile.profile_image_url) || 'https://i.pravatar.cc/150?u=placeholder'}} 
                  style={styles.avatar} 
                />
                <TouchableOpacity style={styles.cameraBtn}>
                  <Camera color={Colors.primary[500]} size={16} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.name}>{profile.first_name}</Text>
              <Text style={styles.contactInfo}>{profile.email}</Text>
              <Text style={styles.contactInfo}>
                {profile.country_code ? `${profile.country_code} ${profile.phone}` : profile.phone}
              </Text>
            </>
          ) : (
            <Text style={styles.contactInfo}>Failed to load profile.</Text>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuItem 
            icon={<User color={Colors.neutral[500]} size={24} />} 
            title="Personal Information" 
            onPress={() => navigation.navigate('EditProfile')} 
          />
          {/* <MenuItem 
            icon={<CreditCard color={Colors.neutral[500]} size={24} />} 
            title="Payment Methods" 
            onPress={() => {}} 
          /> */}
          <MenuItem 
            icon={<Phone color={Colors.neutral[500]} size={24} />} 
            title="Emergency Contacts" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={<Bell color={Colors.neutral[500]} size={24} />} 
            title="Notification Preferences" 
            onPress={() => navigation.navigate('Settings')} 
            noBorder
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for being a part of the Uplift community.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({icon, title, onPress, noBorder}: any) => (
  <TouchableOpacity style={[styles.menuItem, noBorder && styles.menuItemNoBorder]} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      {icon}
      <Text style={styles.menuItemTitle}>{title}</Text>
    </View>
    <ChevronRight color={Colors.neutral[400]} size={20} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[500],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconBtn: {
    padding: 4,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[0],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    paddingBottom: 40,
  },
  profileSection: {
    backgroundColor: Colors.neutral[0],
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
    zIndex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.neutral[0],
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    ...Typography.h4,
    color: Colors.neutral[900],
    marginBottom: 4,
    textAlign: 'center',
  },
  contactInfo: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
    marginBottom: 2,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  menuItemNoBorder: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    marginLeft: 16,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  footerText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
  },
});
