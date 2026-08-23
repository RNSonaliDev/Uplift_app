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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft, Circle, CircleDot} from 'lucide-react-native';
import {AppText} from '../../../components/AppText';
import {Button} from '../../../components/Button';
import {Colors} from '../../../theme/colors';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';
import {api} from '../../../api/client';

const FEEDBACK_OPTIONS = [
  'Everything went well',
  'Minor issue',
  'Could be improved'
];

export default function CompleteRequestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const request = route.params?.request || {};

  const [selectedFeedback, setSelectedFeedback] = useState(FEEDBACK_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!request.id) return;
    try {
      setLoading(true);
      await api.post(`/help_requests/${request.id}/complete`);
      
      Alert.alert('Success', 'Request marked as completed!', [
        { text: 'OK', onPress: () => navigation.navigate('RateExperience', { request }) }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to complete request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Background */}
      <View style={[styles.headerBackground, { paddingTop: verticalScale(16) }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={Colors.neutral[0]} size={24} />
          </TouchableOpacity>
          <AppText variant="h4" color={Colors.neutral[0]} style={styles.headerTitle}>
            Complete Request
          </AppText>
          <View style={styles.backButtonPlaceholder} />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        bounces={false}
        // style={{ zIndex: 1 }}
      >
        {/* Overlapping Card */}
        <View style={styles.card}>
          
          <AppText variant="h5" color={Colors.neutral[900]} style={styles.questionTitle}>
            How did the assistance go?
          </AppText>

          <View style={styles.optionsContainer}>
            {FEEDBACK_OPTIONS.map((option) => {
              const isSelected = selectedFeedback === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => setSelectedFeedback(option)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    {isSelected ? (
                      <CircleDot color={Colors.primary[500]} size={20} />
                    ) : (
                      <Circle color={Colors.neutral[400]} size={20} />
                    )}
                  </View>
                  <AppText 
                    variant="bodyMedium" 
                    color={Colors.neutral[900]} 
                    style={{fontWeight: isSelected ? '600' : '400'}}
                  >
                    {option}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          <AppText variant="labelLarge" color={Colors.neutral[900]} style={styles.notesTitle}>
            Additional Notes (Optional)
          </AppText>
          
          <TextInput
            style={styles.textInput}
            placeholder="Add any notes about this request..."
            placeholderTextColor={Colors.neutral[400]}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />

          <Button 
            title="Mark as Completed" 
            onPress={handleComplete}
            loading={loading}
            fullWidth
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50], // Base background behind everything
  },
  headerBackground: {
    backgroundColor: Colors.primary[500],
    // paddingBottom: verticalScale(64), // Extra padding so card overlaps
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
  },
  backButton: {
    padding: moderateScale(8),
  },
  backButtonPlaceholder: {
    width: moderateScale(40),
  },
  headerTitle: {
    // flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    // flexGrow: 1,
    paddingHorizontal: horizontalScale(16),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 24,
    padding: moderateScale(24),
    marginTop: verticalScale(40), // Pull up to overlap header
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: verticalScale(32),
  },
  questionTitle: {
    marginBottom: verticalScale(16),
  },
  optionsContainer: {
    gap: verticalScale(12),
    marginBottom: verticalScale(32),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[0],
  },
  optionRowSelected: {
    borderColor: Colors.primary[100],
    backgroundColor: Colors.primary[50],
  },
  iconContainer: {
    marginRight: horizontalScale(12),
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
});
