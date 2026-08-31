import React, {useState, useCallback} from 'react';
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
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {api, getFullImageUrl} from '../../../api/client';
import {authApi, UserProfileResponse} from '../../../api/auth';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
import {horizontalScale, verticalScale, moderateScale, hp} from '../../../utils/responsive';
import { button_user } from '../../../assets/images';
import {AppText} from '../../../components/AppText';
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
  Star,
  Mail,
} from 'lucide-react-native';

export default function MyProfileScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
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
    }, [])
  );

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
          // navigation.replace('Welcome');
          navigation.reset({
            index: 0,
            routes: [{name: 'Welcome'}],
          });
        }
      },
    ]);
  };

  const openTerms = () => {
    navigation.navigate('LegalContent', { type: 'terms' });
  };

  const openPrivacy = () => {
    navigation.navigate('LegalContent', { type: 'privacy' });
  };

  const userRoles = profile?.roles?.map((r: any) => r) || [];
  console.log("@@@ userRolesuserRoles===", userRoles)

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.purpleHeader}>
        <View style={styles.headerTop}>
          <View />
          {/* <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
            <Bell color={Colors.neutral[0]} size={24} />
          </TouchableOpacity> */}
        </View>

        <View style={styles.profileRow}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.neutral[0]} style={{ marginVertical: 20 }} />
          ) : profile ? (
            <>
              <View style={styles.avatarContainer}>
                {profile.profile_image_url ? (
                  <Image 
                    source={{ uri: getFullImageUrl(profile.profile_image_url) }}
                    style={styles.avatar} 
                  />
                ) : (
                  <View style={[styles.avatar, {justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.neutral[0]}]}>
                    <AppText variant="h2" color={Colors.primary[500]}>
                      {profile.first_name 
                        ? `${profile.first_name.charAt(0)}${profile.last_name ? profile.last_name.charAt(0) : ''}`.toUpperCase() 
                        : 'U'}
                    </AppText>
                  </View>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <AppText variant="h4" style={styles.name} numberOfLines={1}>{profile.first_name}</AppText>
                <View style={styles.contactRow}>
                  <Mail color={Colors.neutral[0]} size={16} />
                  <AppText variant="bodyMedium" style={[styles.contactInfo, {marginLeft: 8}]} numberOfLines={1}>{profile.email}</AppText>
                </View>
                <View style={styles.contactRow}>
                  <Phone color={Colors.neutral[0]} size={16} />
                  <AppText variant="bodyMedium" style={[styles.contactInfo, {marginLeft: 8}]} numberOfLines={1}>
                    {profile.country_code ? `${profile.phone}` : profile.phone}
                  </AppText>
                </View>
              </View>
            </>
          ) : (
            <AppText variant="bodyMedium" style={styles.contactInfo}>Failed to load profile.</AppText>
          )}
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
          {userRoles.length > 1 && (
            <MenuItem 
              icon={<SettingsIcon color={Colors.neutral[500]} size={24} />} 
              title="Switch Role" 
              onPress={() => profile && navigation.navigate('DashboardRoleSelection', { selectedRoles: userRoles })} 
            />
          )}
          <MenuItem 
            icon={<Key color={Colors.neutral[500]} size={24} />} 
            title="Change Password" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={<Shield color={Colors.neutral[500]} size={24} />} 
            title="Privacy Policy" 
            onPress={openPrivacy} 
          />
          <MenuItem 
            icon={<FileText color={Colors.neutral[500]} size={24} />} 
            title="Terms of Service" 
            onPress={openTerms} 
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
            icon={<LogOut color={Colors.error} size={24} />} 
            title="Logout" 
            onPress={handleLogout} 
            noBorder
            titleStyle={{color: Colors.error}}
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
    backgroundColor: Colors.primary[500],
  },
  purpleHeader: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(24),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  iconBtn: {
    padding: moderateScale(4),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
    paddingHorizontal: horizontalScale(8),
  },
  avatarContainer: {
    marginRight: horizontalScale(16),
  },
  avatar: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    // borderWidth: moderateScale(3),
    // borderColor: Colors.neutral[0],
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...Typography.h4,
    color: Colors.neutral[0],
    marginBottom: 0,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  ratingText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[0],
    marginLeft: horizontalScale(4),
  },
  joinedText: {
    ...Typography.caption,
    color: Colors.neutral[200],
  },
  contactInfo: {
    ...Typography.bodyMedium,
    color: Colors.neutral[0],
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
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
