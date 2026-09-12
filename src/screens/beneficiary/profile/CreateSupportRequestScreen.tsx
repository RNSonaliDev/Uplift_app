import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { horizontalScale, verticalScale, moderateScale } from '../../../utils/responsive';
import { supportApi } from '../../../api/support';
import Toast from 'react-native-toast-message';
import { ChevronLeft, Headphones, Image as ImageIcon, X } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';

export default function CreateSupportRequestScreen() {
  const navigation = useNavigation<any>();
  // Form State
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{subject?: string, message?: string}>({});

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri || null);
      }
    } catch (error) {
      console.log('Image picker error', error);
    }
  };

  const handleSubmit = async () => {
    const newErrors: {subject?: string, message?: string} = {};
    if (!subject.trim()) newErrors.subject = 'Please enter a subject';
    if (!message.trim()) newErrors.message = 'Please enter a message';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      let payload: any;
      if (imageUri) {
        payload = new FormData();
        payload.append('contact_support[subject]', subject.trim());
        payload.append('contact_support[message]', message.trim());
        payload.append('contact_support[attachment]', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'support_attachment.jpg',
        } as any);
      } else {
        payload = {
          contact_support: {
            subject: subject.trim(),
            message: message.trim(),
          }
        };
      }

      await supportApi.createSupportRequest(payload);
      Toast.show({
        type: 'success',
        text1: 'Request Submitted',
        text2: 'We will get back to you shortly.',
      });
      setSubject('');
      setMessage('');
      setImageUri(null);
      navigation.goBack();
    } catch (error: any) {
      console.log('Submit support request failed', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to submit request.',
      });
    } finally {
      setSubmitting(false);
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
        <AppText variant="h5" style={styles.headerTitle}>Contact Support</AppText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.illustrationContainer}>
            <AppText variant="labelLarge" color={Colors.error} style={{marginBottom: 16}} center>
              For any emergency call 911
            </AppText>
            <AppText variant="h5" style={styles.greetingTitle}>How can we help you?</AppText>
            <AppText variant="bodyMedium" style={styles.greetingText} center>
              Describe your issue below and our support team will get back to you as soon as possible.
            </AppText>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Subject"
              bottomRight={<AppText variant="caption" color={Colors.neutral[500]}>{subject.length}/50</AppText>}
              placeholder="E.g. Unable to complete payment"
              value={subject}
              onChangeText={(text) => {
                setSubject(text);
                if (errors.subject) setErrors({...errors, subject: undefined});
              }}
              maxLength={50}
              error={errors.subject}
              containerStyle={styles.inputSpacing}
            />
            
            <Input
              label="Message"
              bottomRight={<AppText variant="caption" color={Colors.neutral[500]}>{message.length}/500</AppText>}
              placeholder="Describe your issue in detail..."
              value={message}
              onChangeText={(text) => {
                setMessage(text);
                if (errors.message) setErrors({...errors, message: undefined});
              }}
              maxLength={500}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              error={errors.message}
              containerStyle={styles.inputSpacing}
            />

            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <AppText variant="labelMedium" style={styles.attachmentLabel}>Attachment added</AppText>
                <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageBtn}>
                  <X color={Colors.error} size={20} />
                  <AppText variant="bodyMedium" color={Colors.error} style={{marginLeft: 4}}>Remove</AppText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <ImageIcon color={Colors.primary[500]} size={20} />
                <AppText variant="bodyMedium" color={Colors.primary[500]} style={{marginLeft: 8}}>
                  Add Screenshot / Image
                </AppText>
              </TouchableOpacity>
            )}

            <Button
              title="Submit"
              onPress={handleSubmit}
              loading={submitting}
              style={styles.submitBtn}
            />
          </View>
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
  header: {
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
  },
  backBtn: {
    padding: moderateScale(4),
  },
  headerTitle: {
    color: Colors.neutral[0],
  },
  container: {
    flex: 1,
  },
  content: {
    padding: moderateScale(24),
    paddingBottom: moderateScale(40),
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  iconCircle: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  greetingTitle: {
    color: Colors.neutral[900],
    marginBottom: verticalScale(8),
  },
  greetingText: {
    color: Colors.neutral[500],
    paddingHorizontal: horizontalScale(16),
  },
  formContainer: {
    backgroundColor: Colors.neutral[0],
    padding: moderateScale(20),
    borderRadius: moderateScale(16),
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputSpacing: {
    marginBottom: verticalScale(20),
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(12),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary[500],
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(24),
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(12),
    backgroundColor: Colors.primary[50],
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(24),
  },
  attachmentLabel: {
    color: Colors.primary[700],
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: verticalScale(8),
  },
});
