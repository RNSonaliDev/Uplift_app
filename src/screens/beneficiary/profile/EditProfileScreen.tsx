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
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {Input} from '../../../components/Input';
import {Button} from '../../../components/Button';
import {ChevronLeft, Calendar, MapPin, Clock, Info, Navigation} from 'lucide-react-native';
import {authApi} from '../../../api/auth';
import Svg, { Circle } from 'react-native-svg';

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

const RadioActiveIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.primary[600],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="5" fill={color} />
  </Svg>
);

const RadioInactiveIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = Colors.neutral[300],
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
  </Svg>
);

const RadioCard = ({
  title,
  description,
  isSelected,
  onPress,
}: {
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.radioCard, isSelected && styles.radioCardSelected]}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={styles.radioIconContainer}>
      {isSelected ? <RadioActiveIcon /> : <RadioInactiveIcon />}
    </View>
    <View style={styles.radioTextContainer}>
      <AppText
        variant="labelMedium"
        color={isSelected ? Colors.neutral[900] : Colors.neutral[800]}
        weight="bold">
        {title}
      </AppText>
      <AppText variant="caption" color={Colors.neutral[500]}>
        {description}
      </AppText>
    </View>
  </TouchableOpacity>
);

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentRole = route.params?.role || 'beneficiary';
  const GOOGLE_MAPS_API_KEY = 'AIzaSyAd20tmxrXZ1VCyhZx4q9aK0ejZtQtE92s';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [formData, setFormData] = useState({
    base_first_name: '',
    base_last_name: '',
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
      return `${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}/${parts[0]}`;
    }
    return dobStr;
  };
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile();
        const roleProfile = data.roles?.find((r: any) => r.role === currentRole)?.profile || data.active_profile || {};
        
        setFormData({
          base_first_name: data.first_name || '',
          base_last_name: data.last_name || '',
          first_name: roleProfile.first_name || data.first_name || '',
          last_name: roleProfile.last_name || data.last_name || '',
          phone: data.phone || '',
          email: data.email || '',
          zip_code: data.zip_code || roleProfile.zip_code || '',
          dob: data.date_of_birth || '',
          service_radius: roleProfile.service_radius ? String(roleProfile.service_radius) : '',
          hours_goal_per_week: roleProfile.hours_goal_per_week ? String(roleProfile.hours_goal_per_week) : '',
          address: roleProfile.address || '',
          anonymity: roleProfile.anonymity || 'hide',
          organization_type: roleProfile.organization_type || '',
          organization_name: roleProfile.organization_name || '',
          contact_name: roleProfile.contact_name || '',
          contact_email: roleProfile.contact_email || '',
          contact_phone: roleProfile.contact_phone || '',
          latitude: roleProfile.latitude ? String(roleProfile.latitude) : '',
          longitude: roleProfile.longitude ? String(roleProfile.longitude) : '',
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
      const { latitude, longitude, base_first_name, base_last_name, ...restProfile } = formData;
      const profilePayload: any = {
        ...restProfile,
        service_radius: Number(formData.service_radius) || 0,
        hours_goal_per_week: Number(formData.hours_goal_per_week) || 0,
      };
      
      if (latitude) profilePayload.latitude = Number(latitude);
      if (longitude) profilePayload.longitude = Number(longitude);

      await authApi.updateProfile({
        role_profile: {
          role: currentRole,
          profile: profilePayload
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
          <AppText variant="labelLarge" color={Colors.neutral[900]} weight="bold" style={{ marginBottom: 12 }}>Basic Details</AppText>
          <Input
            label="First Name"
            value={formData.base_first_name}
            disabled={true}
          />
          <Input
            label="Last Name"
            value={formData.base_last_name}
            disabled={true}
          />
          <Input
            label="Email Address"
            value={formData.email}
            disabled={true}
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={v => handleChange('phone', v)}
            keyboardType="phone-pad"
            disabled={true}
          />
          <Input
            label="Date of Birth"
            value={getDisplayDob(formData.dob)}
            leftIcon={<Calendar color={Colors.neutral[400]} size={20} />}
            disabled={true}
          />

          <AppText variant="labelLarge" color={Colors.neutral[900]} weight="bold" style={{ marginTop: 12, marginBottom: 12 }}>
            {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Details
          </AppText>

          {currentRole !== 'organization' && (
            <>
              <Input
                label="First Name"
                value={formData.first_name}
                onChangeText={v => handleChange('first_name', v)}
                disabled={false}
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChangeText={v => handleChange('last_name', v)}
                disabled={false}
              />
            </>
          )}

          {currentRole === 'beneficiary' && (
            <>

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
                leftIcon={<MapPin color={Colors.neutral[400]} size={20} />}
              />
              <Input
                label="Address"
                value={formData.address}
                onChangeText={v => handleChange('address', v)}
              />
              <Input
                label=" Volunteering hours goal per week (Optional)"
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

          {currentRole === 'sponsor' && (
            <>
              <AppText variant="labelLarge" color={Colors.neutral[900]} weight="bold" style={{ marginTop: 4, marginBottom: 12 }}>Anonymity</AppText>
              <View style={styles.radioGroup}>
                <RadioCard
                  title="Share my name"
                  description="Display my name to others"
                  isSelected={formData.anonymity === 'show'}
                  onPress={() => handleChange('anonymity', 'show')}
                />
                <RadioCard
                  title="Stay anonymous"
                  description="Hide my name from others"
                  isSelected={formData.anonymity === 'hide'}
                  onPress={() => handleChange('anonymity', 'hide')}
                />
              </View>
            </>
          )}

          {currentRole === 'organization' && (
            <>
              <Input
                label="Organization Type"
                value={formData.organization_type}
                onChangeText={v => handleChange('organization_type', v)}
              />
              <Input
                label="Organization Name"
                value={formData.organization_name}
                onChangeText={v => handleChange('organization_name', v)}
              />
              <View style={{marginBottom: 16}}>
                <AppText variant="labelMedium" color={Colors.neutral[700]} style={{marginBottom: 8}}>
                  Address
                </AppText>
                <GooglePlacesAutocomplete
                  placeholder="Enter address"
                  fetchDetails={true}
                  onPress={(data, details = null) => {
                    if (details) {
                      console.log("Selected Address Details: ", details);
                      handleChange('address', data.description);
                    }
                  }}
                  query={{
                    key: GOOGLE_MAPS_API_KEY,
                    language: 'en',
                  }}
                  styles={{
                    container: { flex: 0 },
                    textInputContainer: {
                      backgroundColor: Colors.neutral[0],
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: Colors.neutral[300],
                      height: 52,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                    },
                    textInput: {
                      color: Colors.neutral[900],
                      fontSize: 16,
                      height: 50,
                      flex: 1,
                      backgroundColor: 'transparent',
                    },
                    listView: {
                      backgroundColor: Colors.neutral[0],
                      borderWidth: 1,
                      borderColor: Colors.neutral[200],
                      borderRadius: 8,
                      marginTop: 4,
                    },
                  }}
                  textInputProps={{
                    placeholderTextColor: Colors.neutral[400],
                    value: formData.address || '',
                    onChangeText: (text) => {
                      handleChange('address', text);
                    }
                  }}
                  renderLeftButton={() => (
                    <View style={{ marginRight: 8 }}>
                      <MapPin color={Colors.primary[500]} size={20} />
                    </View>
                  )}
                  renderRightButton={() => (
                    <TouchableOpacity style={{ padding: 4 }} onPress={() => {
                      Toast.show({
                        type: 'info',
                        text1: 'Coming Soon',
                        text2: 'Location feature will be available soon.',
                      });
                    }}>
                      <Navigation color={Colors.primary[500]} size={20} />
                    </TouchableOpacity>
                  )}
                />
              </View>
              <Input
                label="Contact Name"
                value={formData.contact_name}
                onChangeText={v => handleChange('contact_name', v)}
              />
              <Input
                label="Contact Email"
                value={formData.contact_email}
                onChangeText={v => handleChange('contact_email', v)}
                keyboardType="email-address"
              />
              <Input
                label="Contact Phone"
                value={formData.contact_phone}
                onChangeText={v => handleChange('contact_phone', v)}
                keyboardType="phone-pad"
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
        maximumDate={new Date()}
        onConfirm={(selectedDate) => {
          setIsDatePickerOpen(false);

          const selectedAge = (new Date().getTime() - (selectedDate.getTime() - 24 * 60 * 60 * 1000)) / (1000 * 60 * 60 * 24 * 365.25);
          if (selectedAge < 14) {
            Toast.show({
              type: 'error',
              text1: 'Age Restriction',
              text2: 'You are not allowed but hope to see you when you turn 14.',
            });
            return;
          }

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
  radioGroup: {
    gap: 12,
  },
  radioCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[0],
    marginBottom: 12,
  },
  radioCardSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  radioIconContainer: {
    marginRight: 16,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  radioTextContainer: {
    flex: 1,
  },
});
