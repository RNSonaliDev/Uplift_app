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
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {api, getFullImageUrl} from '../../../api/client';
import {authApi, UserProfileResponse} from '../../../api/auth';
import {contentApi} from '../../../api';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
import {horizontalScale, verticalScale, moderateScale, hp} from '../../../utils/responsive';
import { button_user } from '../../../assets/images';
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
  const [modalConfig, setModalConfig] = useState<{visible: boolean, type: 'terms' | 'privacy'}>({visible: false, type: 'terms'});
  const [content, setContent] = useState<string | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);

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
          navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
          });
        }
      },
    ]);
  };

  const openTerms = async () => {
    setModalConfig({visible: true, type: 'terms'});
    setContent(null);
    setIsContentLoading(true);
    try {
      const res = await contentApi.getTermsOfService();
      const cleanText = res.body ? res.body.replace(/<[^>]*>?/gm, '') : 'No content available.';
      setContent(cleanText);
    } catch (error) {
      setContent('Failed to load Terms of Service. Please try again later.');
    } finally {
      setIsContentLoading(false);
    }
  };

  const openPrivacy = async () => {
    setModalConfig({visible: true, type: 'privacy'});
    setContent(null);
    setIsContentLoading(true);
    try {
      const res = await contentApi.getPrivacyPolicy();
      const cleanText = res.body ? res.body.replace(/<[^>]*>?/gm, '') : 'No content available.';
      setContent(cleanText);
    } catch (error) {
      setContent('Failed to load Privacy Policy. Please try again later.');
    } finally {
      setIsContentLoading(false);
    }
  };

  const closeModal = () => setModalConfig({...modalConfig, visible: false});

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
                <Image 
                  source={
                    profile.profile_image_url 
                      ? { uri: getFullImageUrl(profile.profile_image_url) } 
                      : button_user
                  }
                  style={styles.avatar} 
                />
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
                <View style={styles.contactRow}>
                  <Mail color={Colors.neutral[0]} size={16} />
                  <Text style={[styles.contactInfo, {marginLeft: 8}]} numberOfLines={1}>{profile.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Phone color={Colors.neutral[0]} size={16} />
                  <Text style={[styles.contactInfo, {marginLeft: 8}]} numberOfLines={1}>
                    {profile.country_code ? `${profile.country_code} ${profile.phone}` : profile.phone}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.contactInfo}>Failed to load profile.</Text>
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

      {/* Terms & Privacy Modal */}
      <Modal visible={modalConfig.visible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalConfig.type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {isContentLoading ? (
                <ActivityIndicator size="large" color={Colors.primary[500]} style={{marginTop: verticalScale(40)}} />
              ) : (
                <Text style={styles.modalText}>
                  {content}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    alignItems: 'flex-start',
    marginTop: verticalScale(8),
    paddingHorizontal: horizontalScale(8),
  },
  avatarContainer: {
    marginRight: horizontalScale(16),
  },
  avatar: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    // borderWidth: moderateScale(3),
    // borderColor: Colors.neutral[0],
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  name: {
    ...Typography.h4,
    color: Colors.neutral[0],
    marginBottom: verticalScale(4),
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
    marginBottom: verticalScale(4),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    maxHeight: hp(80),
    paddingBottom: verticalScale(32),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: horizontalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
  },
  closeButton: {
    padding: moderateScale(4),
  },
  closeButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary[500],
  },
  modalBody: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
  },
  modalText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
  },
});
