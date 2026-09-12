import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
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
  const { width } = useWindowDimensions();
  
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
        const cleanText = res.body ? res.body : '<p>No content available.</p>';
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
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>{title}</AppText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary[500]} style={{ marginTop: verticalScale(40) }} />
        ) : (
          <RenderHtml
            contentWidth={width - horizontalScale(48)}
            source={{ html: content || '<p>No content available.</p>' }}
            tagsStyles={{
              body: {
                color: Colors.neutral[600],
                lineHeight: 26,
                fontSize: moderateScale(14),
                fontFamily: 'Poppins-Regular',
              },
              p: {
                marginTop: verticalScale(6),
                marginBottom: verticalScale(10),
                lineHeight: 24,
                fontSize: moderateScale(14),
                color: Colors.neutral[600],
                fontFamily: 'Poppins-Regular',
              },
              h1: {
                color: Colors.neutral[800],
                fontSize: moderateScale(22),
                fontFamily: 'Poppins-Bold',
                marginTop: verticalScale(24),
                marginBottom: verticalScale(12),
                lineHeight: 32,
              },
              h2: {
                color: Colors.neutral[800],
                fontSize: moderateScale(20),
                fontFamily: 'Poppins-SemiBold',
                marginTop: verticalScale(24),
                marginBottom: verticalScale(10),
                lineHeight: 30,
              },
              h3: {
                color: Colors.neutral[800],
                fontSize: moderateScale(18),
                fontFamily: 'Poppins-SemiBold',
                marginTop: verticalScale(20),
                marginBottom: verticalScale(8),
                lineHeight: 28,
              },
              h4: {
                color: Colors.neutral[800],
                fontSize: moderateScale(16),
                fontFamily: 'Poppins-Medium',
                marginTop: verticalScale(16),
                marginBottom: verticalScale(6),
                lineHeight: 26,
              },
              h5: {
                color: Colors.neutral[800],
                fontSize: moderateScale(15),
                fontFamily: 'Poppins-Medium',
                marginTop: verticalScale(14),
                marginBottom: verticalScale(6),
                lineHeight: 24,
              },
              h6: {
                color: Colors.neutral[700],
                fontSize: moderateScale(14),
                fontFamily: 'Poppins-Medium',
                marginTop: verticalScale(12),
                marginBottom: verticalScale(4),
              },
              a: {
                color: Colors.primary[500],
                textDecorationLine: 'none',
              },
              li: {
                color: Colors.neutral[600],
                fontSize: moderateScale(14),
                fontFamily: 'Poppins-Regular',
                lineHeight: 24,
                marginBottom: verticalScale(4),
              },
              ul: {
                marginTop: verticalScale(4),
                marginBottom: verticalScale(12),
                paddingLeft: horizontalScale(8),
              },
              ol: {
                marginTop: verticalScale(4),
                marginBottom: verticalScale(12),
                paddingLeft: horizontalScale(8),
              },
              strong: {
                fontFamily: 'Poppins-SemiBold',
                color: Colors.neutral[800],
              },
              em: {
                fontFamily: 'Poppins-Italic',
              },
              table: {
                borderWidth: 1,
                borderColor: Colors.neutral[200],
                marginVertical: verticalScale(12),
              },
              th: {
                backgroundColor: Colors.neutral[100],
                padding: moderateScale(8),
                fontFamily: 'Poppins-SemiBold',
                color: Colors.neutral[800],
                fontSize: moderateScale(13),
              },
              td: {
                padding: moderateScale(8),
                borderWidth: 0.5,
                borderColor: Colors.neutral[200],
                fontSize: moderateScale(13),
                fontFamily: 'Poppins-Regular',
                color: Colors.neutral[600],
              },
            }}
            systemFonts={['Poppins-Regular', 'Poppins-Medium', 'Poppins-SemiBold', 'Poppins-Bold', 'Poppins-Italic']}
          />
        )}
      </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
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
