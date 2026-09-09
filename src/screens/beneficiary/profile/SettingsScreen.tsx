import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { notificationsApi } from '../../../api/notifications';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { authApi } from '../../../api/auth';
import { clearAuthToken } from '../../../api/client';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  Shield,
  FileText,
  Bell,
  Mail,
  MessageSquare,
  Moon,
  HelpCircle,
  Headphones,
  LogOut,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await notificationsApi.getSettings();
      setPushEnabled(data.push_notifications_enabled);
      setEmailEnabled(data.email_notifications_enabled);
      setSmsEnabled(data.sms_notifications_enabled);
    } catch (e) {
      console.log('Failed to fetch notification settings', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [fetchSettings])
  );

  const updateSetting = async (key: 'push' | 'email' | 'sms', value: boolean) => {
    // Optimistic update
    if (key === 'push') setPushEnabled(value);
    if (key === 'email') setEmailEnabled(value);
    if (key === 'sms') setSmsEnabled(value);

    try {
      await notificationsApi.updateSettings({
        notification_settings: {
          push_notifications_enabled: key === 'push' ? value : pushEnabled,
          email_notifications_enabled: key === 'email' ? value : emailEnabled,
          sms_notifications_enabled: key === 'sms' ? value : smsEnabled,
        }
      });
    } catch (e: any) {
      console.log('Failed to update notification settings', e);
      // Revert optimistic update
      if (key === 'push') setPushEnabled(!value);
      if (key === 'email') setEmailEnabled(!value);
      if (key === 'sms') setSmsEnabled(!value);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: e?.message || 'Failed to update settings',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.log('Logout API failed, proceeding to clear token locally', e);
    } finally {
      await clearAuthToken();
      navigation.reset({
        index: 0,
        routes: [{ name: 'CreateAccount' }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>


        <View style={styles.sectionCard}>
          <SettingToggle
            icon={<Bell color={Colors.neutral[500]} size={20} />}
            title="Push Notifications"
            value={pushEnabled}
            onValueChange={(val: boolean) => updateSetting('push', val)}
          />
          <SettingToggle
            icon={<Mail color={Colors.neutral[500]} size={20} />}
            title="Email Notifications"
            value={emailEnabled}
            onValueChange={(val: boolean) => updateSetting('email', val)}
          />
          <SettingToggle
            icon={<MessageSquare color={Colors.neutral[500]} size={20} />}
            title="SMS Notifications"
            value={smsEnabled}
            onValueChange={(val: boolean) => updateSetting('sms', val)}
          />
          {/* <SettingToggle 
            icon={<Moon color={Colors.neutral[500]} size={20} />} 
            title="Dark Mode" 
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            noBorder
          /> */}
        </View>



      </ScrollView>
    </SafeAreaView>
  );
}

const SettingItem = ({ icon, title, onPress, noBorder }: any) => (
  <TouchableOpacity style={[styles.itemRow, noBorder && styles.noBorder]} onPress={onPress}>
    <View style={styles.itemLeft}>
      {icon}
      <Text style={styles.itemTitle}>{title}</Text>
    </View>
    <ChevronRight color={Colors.neutral[400]} size={20} />
  </TouchableOpacity>
);

const SettingToggle = ({ icon, title, value, onValueChange, noBorder }: any) => (
  <View style={[styles.itemRow, noBorder && styles.noBorder]}>
    <View style={styles.itemLeft}>
      {icon}
      <Text style={styles.itemTitle}>{title}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: Colors.neutral[500], true: Colors.primary[500] }}
      thumbColor={Colors.neutral[0]}
    />
  </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backBtn: {
    padding: 4,
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
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral[700],
    marginLeft: 16,
  },
});
