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
import {useNavigation, useRoute} from '@react-navigation/native';
import {Star} from 'lucide-react-native';
import {AppText} from '../../../components/AppText';
import {Button} from '../../../components/Button';
import {Colors} from '../../../theme/colors';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {api} from '../../../api/client';

export default function RateExperienceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const request = route.params?.request || {};

  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Required', 'Please select a star rating.');
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
      
      Alert.alert('Success', 'Thank you for your feedback!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate back to the main Schedule tab
            navigation.navigate('MySchedule');
          } 
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        
        <View style={styles.header}>
          <View style={styles.badge}>
            <AppText variant="labelLarge" color={Colors.neutral[0]}>
              11
            </AppText>
          </View>
          <AppText variant="h4" color={Colors.neutral[900]} style={styles.headerTitle}>
            Rate Your Experience
          </AppText>
        </View>

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

          <AppText variant="labelLarge" color={Colors.neutral[900]} style={styles.notesTitle}>
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
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  badge: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  headerTitle: {
    // optional styling
  },
  card: {
    width: '100%',
    backgroundColor: Colors.neutral[0],
    borderRadius: 24,
    padding: moderateScale(24),
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
    marginBottom: verticalScale(32),
  },
  title: {
    marginBottom: verticalScale(16),
  },
  subtitle: {
    marginBottom: verticalScale(24),
    lineHeight: 24,
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
    marginBottom: verticalScale(12),
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    padding: moderateScale(16),
    height: verticalScale(120),
    fontSize: moderateScale(14),
    color: Colors.neutral[900],
    backgroundColor: Colors.neutral[0],
    marginBottom: verticalScale(32),
  },
  submitBtn: {
    marginTop: verticalScale(8),
  },
  footerText: {
    lineHeight: 24,
  },
});
