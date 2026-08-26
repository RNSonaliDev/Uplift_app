import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ArrowLeft, ShieldCheck, ShoppingCart, Pill, Soup, Car, Users, MoreHorizontal, Calendar, Clock, MapPin} from 'lucide-react-native';
import {formatDate, formatTime12Hour} from '../../../utils/dateFormatter';
import {AppText} from '../../../components/AppText';
import {Button} from '../../../components/Button';
import {Colors} from '../../../theme/colors';
import {api} from '../../../api/client';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';

export default function StartRequestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const request = route.params?.request || {};
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartTask = async () => {
    if (code.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter a valid 6-digit start code.'
      });
      return;
    }

    if (!request.id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Missing request ID.'
      });
      return;
    }

    try {
      setLoading(true);
      await api.post(`/help_requests/${request.id}/start`, {
        start_code: code
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Task started successfully!',
        onHide: () => navigation.goBack()
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to start request.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (title: string, size = 20) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('groc') || t.includes('shop')) return <ShoppingCart color={Colors.neutral[900]} size={size} />;
    if (t.includes('pharm') || t.includes('med') || t.includes('pill')) return <Pill color={Colors.neutral[900]} size={size} />;
    if (t.includes('meal') || t.includes('food') || t.includes('soup')) return <Soup color={Colors.neutral[900]} size={size} />;
    if (t.includes('trans') || t.includes('drive') || t.includes('car')) return <Car color={Colors.neutral[900]} size={size} />;
    if (t.includes('comp') || t.includes('people') || t.includes('user')) return <Users color={Colors.neutral[900]} size={size} />;
    return <MoreHorizontal color={Colors.neutral[900]} size={size} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
        <AppText variant="h4" color={Colors.neutral[900]} style={styles.headerTitle}>
          Start Request
        </AppText>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.requestCard}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryIconCircle}>
              {getCategoryIcon(request.category?.title, 24)}
            </View>
            <View style={styles.cardHeaderRight}>
              <AppText variant="h5" color={Colors.neutral[900]} style={{marginBottom: 4}}>
                {request.category?.title || 'Help Request'}
              </AppText>
              <AppText variant="bodyMedium" color={Colors.neutral[500]}>
                #{request.reference_number || request.id}
              </AppText>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Calendar color={Colors.neutral[500]} size={20} />
              <AppText variant="bodyLarge" color={Colors.neutral[700]} style={styles.detailText}>
                {formatDate(request.preferred_date)} • {(request.preferred_start_time || request.start_time) ? `${formatTime12Hour(request.preferred_start_time || request.start_time)}${(request.preferred_end_time || request.end_time) ? ` - ${formatTime12Hour(request.preferred_end_time || request.end_time)}` : ''}` : (request.preferred_time || (request.hours_required ? `${request.hours_required} hours` : 'Time TBD'))}
              </AppText>
            </View>
            <View style={styles.detailRow}>
              <MapPin color={Colors.neutral[500]} size={20} />
              <AppText variant="bodyLarge" color={Colors.neutral[700]} style={styles.detailText}>
                {request.location?.address || request.meeting_location || 'Location TBD'}
              </AppText>
            </View>
          </View>
        </View>

        <AppText variant="h3" color={Colors.neutral[900]} style={styles.title} center>
          Enter Start Code
        </AppText>
        
        <AppText variant="bodyLarge" color={Colors.neutral[600]} style={styles.subtitle} center>
          Please enter the 6-digit start code provided by the beneficiary to begin this request.
        </AppText>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            placeholder="000000"
            placeholderTextColor={Colors.neutral[300]}
            maxLength={6}
          />
        </View>

        <Button 
          title="Start Task" 
          onPress={handleStartTask}
          loading={loading}
          disabled={code.length !== 6 || loading}
          fullWidth 
          style={styles.startBtn}
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
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  iconButton: {
    padding: moderateScale(8),
  },
  iconButtonPlaceholder: {
    width: moderateScale(40),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: 'center',
    paddingTop: verticalScale(40),
  },
  requestCard: {
    width: '100%',
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: moderateScale(20),
    marginBottom: verticalScale(32),
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  categoryIconCircle: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  cardHeaderRight: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginBottom: verticalScale(16),
  },
  cardDetails: {
    gap: verticalScale(12),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: horizontalScale(12),
  },
  title: {
    marginBottom: verticalScale(12),
  },
  subtitle: {
    marginBottom: verticalScale(40),
    lineHeight: 24,
    paddingHorizontal: horizontalScale(16),
  },
  inputContainer: {
    width: '100%',
    marginBottom: verticalScale(40),
  },
  input: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: verticalScale(16),
  },
  startBtn: {
    marginTop: 'auto',
    marginBottom: verticalScale(32),
  },
});
