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
  PanResponder,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {Input} from '../../../components/Input';
import {Button} from '../../../components/Button';
import {ChevronLeft, Calendar, MapPin, Clock, Info} from 'lucide-react-native';
import {authApi} from '../../../api/auth';

const CustomSlider = ({ value, onValueChange, min = 0, max = 100 }: { value: number, onValueChange: (val: number) => void, min?: number, max?: number }) => {
  const [width, setWidth] = useState(0);
  const widthRef = React.useRef(0);
  widthRef.current = width;

  const onValueChangeRef = React.useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  const startValue = React.useRef(value);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (widthRef.current > 0) {
          const locX = evt.nativeEvent.locationX;
          const percent = Math.max(0, Math.min(1, locX / widthRef.current));
          const newValue = min + percent * (max - min);
          startValue.current = newValue;
          onValueChangeRef.current(newValue);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (widthRef.current > 0) {
          const deltaPercent = gestureState.dx / widthRef.current;
          let newValue = startValue.current + deltaPercent * (max - min);
          newValue = Math.max(min, Math.min(max, newValue));
          onValueChangeRef.current(newValue);
        }
      },
    })
  ).current;

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View 
      style={styles.sliderContainer} 
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
      hitSlop={{ top: 15, bottom: 15, left: 0, right: 0 }}
    >
      <View style={styles.sliderTrack} pointerEvents="none">
        <View style={[styles.sliderFill, { width: `${percentage}%` }]} />
      </View>
      <View style={[styles.sliderThumb, { left: `${percentage}%` }]} pointerEvents="none" />
    </View>
  );
};

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentRole = route.params?.role || 'beneficiary';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [date, setDate] = useState(new Date(2000, 0, 1));
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

  const getDisplayDob = (dobStr: string) => {
    if (!dobStr) return '';
    const parts = dobStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dobStr;
  };
  
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
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully',
        onHide: () => navigation.goBack()
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to update profile'
      });
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
                    label="Date of Birth (DD-MM-YYYY)"
                    value={getDisplayDob(formData.dob)}
                    leftIcon={<Calendar color={Colors.neutral[400]} size={20} />}
                    rightIcon={<Calendar color={Colors.primary[500]} size={20} />}
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
                label="ZIP Code (Home Location)"
                value={formData.zip_code}
                onChangeText={v => handleChange('zip_code', v)}
                keyboardType="number-pad"
                leftIcon={<MapPin color={Colors.neutral[400]} size={20} />}
              />
              <Input
                label="Community Service Hours Goal per Week (Optional)"
                value={formData.hours_goal_per_week}
                onChangeText={v => handleChange('hours_goal_per_week', v)}
                keyboardType="number-pad"
                leftIcon={<Clock color={Colors.neutral[400]} size={20} />}
                rightIcon={<AppText variant="caption" color={Colors.neutral[500]}>hrs/week</AppText>}
              />

              <View style={styles.sliderGroup}>
                <View style={styles.sliderHeaderRow}>
                  <View style={styles.sliderLabelGroup}>
                    <AppText variant="labelMedium" color={Colors.neutral[900]} style={{ flexShrink: 1 }}>
                      Service Radius (within your selected radius)
                    </AppText>
                    <TouchableOpacity style={{marginLeft: 6}}>
                      <Info size={16} color={Colors.primary[500]} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.pillContainer}>
                    <AppText variant="caption" color={Colors.primary[600]} weight="semiBold">
                      {Math.round(Number(formData.service_radius) || 20)} miles
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" color={Colors.neutral[500]} style={styles.sliderSubtitle}>
                  Show opportunities within your current radius.
                </AppText>
                
                <CustomSlider 
                  value={Number(formData.service_radius) || 20} 
                  onValueChange={(val) => handleChange('service_radius', String(Math.round(val)))} 
                  min={5} 
                  max={50} 
                />
                
                <View style={styles.sliderLimitsRow}>
                  <AppText variant="caption" color={Colors.neutral[500]}>5 miles</AppText>
                  <AppText variant="caption" color={Colors.neutral[500]}>50 miles</AppText>
                </View>
              </View>
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
        maximumDate={new Date(new Date().setDate(new Date().getDate() - 1))}
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
  sliderGroup: {
    marginBottom: 32,
    marginTop: 16,
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  sliderLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  pillContainer: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  sliderSubtitle: {
    marginBottom: 16,
  },
  sliderContainer: {
    height: 20,
    justifyContent: 'center',
    marginBottom: 4,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    width: '100%',
  },
  sliderFill: {
    height: 4,
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.neutral[0],
    borderWidth: 2,
    borderColor: Colors.primary[500],
    marginLeft: -8, // Center thumb
  },
  sliderLimitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
