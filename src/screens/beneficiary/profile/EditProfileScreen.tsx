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
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {Input} from '../../../components/Input';
import {Button} from '../../../components/Button';
import {ChevronLeft} from 'lucide-react-native';
import {authApi} from '../../../api/auth';

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile();
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          email: data.email || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await authApi.updateProfile({
        role_profile: {
          role: "beneficiary",
          profile: formData
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
          />
          <Input
            label="Last Name"
            value={formData.last_name}
            onChangeText={v => handleChange('last_name', v)}
          />
          <Input
            label="Email Address"
            value={formData.email}
            editable={false}
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={v => handleChange('phone', v)}
            keyboardType="phone-pad"
          />
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
