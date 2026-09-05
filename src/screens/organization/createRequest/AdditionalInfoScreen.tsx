import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react-native';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';

export const AdditionalInfoScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  
  const params = route.params || {};

  const [skills, setSkills] = useState('');
  const [notes, setNotes] = useState('');

  const handleContinue = () => {
    navigation.navigate('ReviewRequest', {
      ...params,
      skills,
      notes,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      {Platform.OS === 'ios' && <SafeAreaView />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Additional Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex1} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Skills Required */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Skills / Category Required (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textAreaSmall]}
              placeholder="e.g. Cooking, Event Management, Packing, Driving"
              placeholderTextColor={Colors.neutral[400]}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              value={skills}
              onChangeText={setSkills}
            />
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any specific instructions for volunteers?"
              placeholderTextColor={Colors.neutral[400]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
              value={notes}
              onChangeText={setNotes}
            />
            <Text style={styles.charCount}>{notes.length}/300</Text>
          </View>

          {/* Upload Images */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload Images (Optional)</Text>
            <TouchableOpacity style={styles.uploadBox}>
              <ImageIcon color={Colors.primary[600]} size={32} style={styles.uploadIcon} />
              <Text style={styles.uploadTitle}>Upload photos{'\n'}from your gallery</Text>
              <Text style={styles.uploadSubtitle}>JPG, PNG up to 5MB</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
  },
  scrollContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    backgroundColor: Colors.neutral[50],
  },
  textAreaSmall: {
    height: 80,
    paddingTop: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.neutral[500],
    textAlign: 'right',
    marginTop: 8,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: Colors.primary[200],
    borderRadius: 16,
    borderStyle: 'dashed',
    backgroundColor: Colors.primary[50],
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  uploadSubtitle: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  primaryButton: {
    backgroundColor: Colors.primary[600],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.buttonLarge,
    color: Colors.neutral[0],
  },
});
