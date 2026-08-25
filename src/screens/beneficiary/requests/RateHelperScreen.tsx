import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Star, ChevronLeft} from 'lucide-react-native';
import {AppText} from '../../../components/AppText';
import {Button} from '../../../components/Button';
import {Colors} from '../../../theme/colors';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {api} from '../../../api/client';

export default function RateHelperScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const requestId = route.params?.requestId;

  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please select a star rating.'
      });
      return;
    }

    if (!requestId) return;

    try {
      setLoading(true);
      await api.post(`/help_requests/${requestId}/rate`, {
        rating: {
          score: rating,
          comment: notes,
        },
      });
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Thank you for your feedback!',
        onHide: () => {
          navigation.navigate('MyRequests');
        }
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.errors?.[0] || error?.message || 'Failed to submit rating.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Rate Experience</AppText>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.card}>
          <AppText variant="h5" color={Colors.neutral[900]} style={styles.title}>
            Rate Your Helper
          </AppText>
          
          <AppText variant="bodyLarge" color={Colors.neutral[700]} style={styles.subtitle}>
            How was your overall{'\n'}experience?
          </AppText>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((starValue) => (
              <TouchableOpacity
                key={starValue}
                onPress={() => setRating(starValue)}
                activeOpacity={0.7}
                style={styles.starButton}
              >
                <Star 
                  size={40} 
                  color={Colors.primary[500]} 
                  fill={rating >= starValue ? Colors.primary[500] : 'transparent'} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <AppText variant="labelMedium" color={Colors.neutral[700]} style={styles.inputLabel}>
              Additional Notes (Optional)
            </AppText>
            <TextInput
              style={styles.input}
              placeholder="Tell us about your experience..."
              placeholderTextColor={Colors.neutral[400]}
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <Button
            title="Submit Feedback"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backBtn: {
    padding: moderateScale(4),
  },
  headerTitle: {
    color: Colors.neutral[900],
  },
  scrollContent: {
    padding: horizontalScale(24),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(40),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(4)},
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(12),
    elevation: 4,
  },
  title: {
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: verticalScale(24),
    marginBottom: verticalScale(32),
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: horizontalScale(8),
    marginBottom: verticalScale(40),
  },
  starButton: {
    padding: moderateScale(4),
  },
  inputContainer: {
    width: '100%',
    marginBottom: verticalScale(32),
  },
  inputLabel: {
    marginBottom: verticalScale(8),
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    height: verticalScale(120),
    fontFamily: 'Inter-Regular',
    fontSize: moderateScale(14),
    color: Colors.neutral[900],
    backgroundColor: Colors.neutral[50],
  },
  submitBtn: {
    width: '100%',
  },
});
