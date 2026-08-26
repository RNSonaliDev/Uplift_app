import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { contentApi } from '../../../api';
import { horizontalScale, verticalScale, moderateScale } from '../../../utils/responsive';

export default function LegalContentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { type } = route.params || { type: 'terms' };
  
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        let res;
        if (type === 'terms') {
          res = await contentApi.getTermsOfService();
        } else {
          res = await contentApi.getPrivacyPolicy();
        }
        const cleanText = res.body ? res.body.replace(/<[^>]*>?/gm, '') : 'No content available.';
        setContent(cleanText);
      } catch (error) {
        setContent(`Failed to load ${title}. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [type, title]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>{title}</AppText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary[500]} style={{ marginTop: verticalScale(40) }} />
        ) : (
          <AppText variant="bodyMedium" style={styles.textContent}>
            {content}
          </AppText>
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backBtn: {
    padding: moderateScale(4),
  },
  headerTitle: {
    color: Colors.neutral[900],
    flex: 1,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  content: {
    padding: horizontalScale(24),
    paddingBottom: verticalScale(40),
  },
  textContent: {
    color: Colors.neutral[600],
    lineHeight: 24,
  },
});
