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
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {api, getFullImageUrl} from '../../../api/client';
import {authApi, UserProfileResponse} from '../../../api/auth';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
import {horizontalScale, verticalScale, moderateScale} from '../../../utils/responsive';
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
  PlusCircle,
  Settings as SettingsIcon,
  Key,
  LogOut,
  Shield,
  FileText,
  HelpCircle,
  Headphones,
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

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await authApi.logout();
          } catch (e) {
            console.log('Logout API failed', e);
          }
          await AsyncStorage.removeItem('UPLIFT_AUTH_TOKEN');
          navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
          });
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.canGoBack() && navigation.goBack()} 
          style={[styles.iconBtn, !navigation.canGoBack() && {opacity: 0}]}
          disabled={!navigation.canGoBack()}
        >
          <ChevronLeft color={Colors.neutral[900]} size={28} />
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
                {/* <TouchableOpacity style={styles.cameraBtn}>
                  <Camera color={Colors.primary[500]} size={16} />
                </TouchableOpacity> */}
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
            onPress={() => navigation.navigate('EditProfile', { role: profile?.default_role || 'beneficiary' })} 
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
          />
          <MenuItem 
            icon={<PlusCircle color={Colors.neutral[500]} size={24} />} 
            title="Add Role" 
            onPress={() => navigation.navigate('SelectRoles', { fromProfile: true })} 
          />
          <MenuItem 
            icon={<SettingsIcon color={Colors.neutral[500]} size={24} />} 
            title="Change Role" 
            onPress={() => profile && navigation.navigate('DashboardRoleSelection', { selectedRoles: profile.selected_roles || profile.roles?.map((r: any) => r.role) || [] })} 
          />
          <MenuItem 
            icon={<Key color={Colors.neutral[500]} size={24} />} 
            title="Change Password" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={<Shield color={Colors.neutral[500]} size={24} />} 
            title="Privacy Policy" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={<FileText color={Colors.neutral[500]} size={24} />} 
            title="Terms of Service" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={<HelpCircle color={Colors.neutral[500]} size={24} />} 
            title="Help Center" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={<Headphones color={Colors.neutral[500]} size={24} />} 
            title="Contact Support" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={<LogOut color={Colors.error[500]} size={24} />} 
            title="Logout" 
            onPress={handleLogout} 
            noBorder
            titleStyle={{color: Colors.error[500]}}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for being a part of the Uplift community.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({icon, title, onPress, noBorder, titleStyle}: any) => (
  <TouchableOpacity style={[styles.menuItem, noBorder && styles.menuItemNoBorder]} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      {icon}
      <Text style={[styles.menuItemTitle, titleStyle]}>{title}</Text>
    </View>
    <ChevronRight color={Colors.neutral[400]} size={20} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  iconBtn: {
    padding: moderateScale(4),
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    paddingBottom: verticalScale(40),
  },
  profileSection: {
    backgroundColor: Colors.neutral[0],
    alignItems: 'center',
    paddingVertical: verticalScale(32),
    paddingHorizontal: horizontalScale(24),
    borderBottomLeftRadius: moderateScale(32),
    borderBottomRightRadius: moderateScale(32),
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(4)},
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(12),
    elevation: 4,
    marginBottom: verticalScale(24),
    zIndex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: verticalScale(16),
  },
  avatar: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: moderateScale(4),
    borderColor: Colors.neutral[0],
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(2)},
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },
  name: {
    ...Typography.h4,
    color: Colors.neutral[900],
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  contactInfo: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
    marginBottom: verticalScale(2),
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    marginHorizontal: horizontalScale(16),
    paddingHorizontal: horizontalScale(16),
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(2)},
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(18),
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
    marginLeft: horizontalScale(16),
  },
  footer: {
    marginTop: verticalScale(40),
    alignItems: 'center',
    paddingHorizontal: horizontalScale(40),
  },
  footerText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: verticalScale(22),
  },
});
