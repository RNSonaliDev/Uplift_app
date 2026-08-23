import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {Input} from '../../../components/Input';
import {Button} from '../../../components/Button';
import {ChevronLeft} from 'lucide-react-native';
import {authApi} from '../../../api/auth';

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentRole = route.params?.role || 'beneficiary';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    zip_code: '',
    dob: '',
    service_radius: '',
    hours_goal_per_week: '',
  });
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile();
        const roleProfile = data.roles?.find((r: any) => r.role === currentRole)?.profile || data.active_profile || {};
        
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          email: data.email || '',
          zip_code: roleProfile.zip_code || '',
          dob: roleProfile.dob || '',
          service_radius: roleProfile.service_radius ? String(roleProfile.service_radius) : '',
          hours_goal_per_week: roleProfile.hours_goal_per_week ? String(roleProfile.hours_goal_per_week) : '',
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentRole]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await authApi.updateProfile({
        role_profile: {
          role: currentRole,
          profile: {
            ...formData,
            service_radius: Number(formData.service_radius) || 0,
            hours_goal_per_week: Number(formData.hours_goal_per_week) || 0,
          }
        }
      });
      Alert.alert('Success', 'Profile updated successfully', [
        {text: 'OK', onPress: () => navigation.goBack()}
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Edit Profile</AppText>
        <View style={{width: 28}} />
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <Input
            label="First Name"
            value={formData.first_name}
            onChangeText={v => handleChange('first_name', v)}
            disabled
          />
          <Input
            label="Last Name"
            value={formData.last_name}
            onChangeText={v => handleChange('last_name', v)}
            disabled
          />
          <Input
            label="Email Address"
            value={formData.email}
            disabled
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={v => handleChange('phone', v)}
            keyboardType="phone-pad"
            disabled
          />

          {currentRole === 'beneficiary' && (
            <>
              <TouchableOpacity onPress={() => setIsDatePickerOpen(true)} activeOpacity={0.7}>
                <View pointerEvents="none">
                  <Input
                    label="Date of Birth (YYYY-MM-DD)"
                    value={formData.dob}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>
              <Input
                label="ZIP Code"
                value={formData.zip_code}
                onChangeText={v => handleChange('zip_code', v)}
                keyboardType="number-pad"
              />
            </>
          )}

          {currentRole === 'volunteer' && (
            <>
              <Input
                label="ZIP Code"
                value={formData.zip_code}
                onChangeText={v => handleChange('zip_code', v)}
                keyboardType="number-pad"
              />
              <Input
                label="Service Radius (miles)"
                value={formData.service_radius}
                onChangeText={v => handleChange('service_radius', v)}
                keyboardType="number-pad"
              />
              <Input
                label="Hours Goal per Week"
                value={formData.hours_goal_per_week}
                onChangeText={v => handleChange('hours_goal_per_week', v)}
                keyboardType="number-pad"
              />
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving || loading}
          disabled={saving || loading}
        />
      </View>

      <DatePicker
        modal
        open={isDatePickerOpen}
        date={date}
        mode="date"
        onConfirm={(selectedDate) => {
          setIsDatePickerOpen(false);
          setDate(selectedDate);
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const year = selectedDate.getFullYear();
          handleChange('dob', `${year}-${month}-${day}`);
        }}
        onCancel={() => {
          setIsDatePickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

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
    color: Colors.neutral[900],
  },
  content: {
    padding: 24,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
});
