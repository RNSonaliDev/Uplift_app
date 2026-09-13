import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Star, ChevronLeft } from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Colors } from '../../../theme/colors';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import { api } from '../../../api/client';

export default function RateExperienceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const request = route.params?.request || {};

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

    if (!request.id) return;

    try {
      setLoading(true);
      await api.post(`/help_requests/${request.id}/rate`, {
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
          navigation.navigate('MySchedule');
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
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Rate Your Experience</AppText>
        <View style={[styles.backBtn, {opacity: 0}]} pointerEvents="none">
          <View style={{width: 28, height: 28}} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.card}>
          <AppText variant="h5" color={Colors.neutral[900]} style={styles.title}>
            Rate Your Experience
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
            <AppText variant="labelMedium" color={Colors.neutral[700]} style={styles.notesTitle}>
              Additional Notes (Optional)
            </AppText>

            <TextInput
              style={styles.textInput}
              placeholder="Share your experience..."
              placeholderTextColor={Colors.neutral[400]}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Button
            title="Submit Rating"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            style={styles.submitBtn}
          />
        </View>

        <AppText variant="bodyLarge" color={Colors.neutral[700]} style={styles.footerText} center>
          Rate your experience{'\n'}to help us improve.
        </AppText>

      </ScrollView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(40),
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: Colors.primary[500],
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
  },
  backBtn: {
    padding: moderateScale(8),
  },
  headerTitle: {
    color: Colors.neutral[0],
  },
  card: {
    width: '100%',
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(12),
    elevation: 4,
    marginBottom: verticalScale(32),
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(32),
    paddingHorizontal: horizontalScale(8),
  },
  starButton: {
    padding: moderateScale(4),
  },
  notesTitle: {
    marginBottom: verticalScale(8),
  },
  inputContainer: {
    width: '100%',
    marginBottom: verticalScale(32),
  },
  textInput: {
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
    marginTop: verticalScale(8),
  },
  footerText: {
    lineHeight: 24,
  },
});
