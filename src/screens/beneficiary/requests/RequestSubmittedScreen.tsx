import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {AppText} from '../../../components/AppText';
import {Button} from '../../../components/Button';
import {Send} from 'lucide-react-native';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';

export default function RequestSubmittedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {referenceNumber} = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Send color={Colors.primary[500]} size={moderateScale(48)} />
            </View>
            {/* Decorative dots to match confetti */}
            <View style={[styles.dot, {backgroundColor: Colors.accent[300], top: 15, left: 10, width: 6, height: 6}]} />
            <View style={[styles.dot, {backgroundColor: Colors.primary[200], top: 0, left: 60, width: 4, height: 4}]} />
            <View style={[styles.dot, {backgroundColor: Colors.secondary[400], top: 15, right: 15, width: 5, height: 5}]} />
            <View style={[styles.dot, {backgroundColor: Colors.primary[300], top: 60, right: -5, width: 4, height: 4}]} />
            <View style={[styles.dot, {backgroundColor: Colors.warning, bottom: 20, right: 15, width: 6, height: 6}]} />
            <View style={[styles.dot, {backgroundColor: Colors.primary[300], bottom: -5, right: 60, width: 4, height: 4}]} />
            <View style={[styles.dot, {backgroundColor: Colors.primary[300], bottom: 25, left: 10, width: 5, height: 5}]} />
            <View style={[styles.dot, {backgroundColor: Colors.accent[400], top: 50, left: -5, width: 4, height: 4}]} />
          </View>

          <AppText variant="h4" style={styles.title}>
            Request submitted!
          </AppText>

          <AppText variant="bodyMedium" color={Colors.neutral[600]} style={styles.subtitle}>
            We'll notify you when a volunteer accepts your request.
          </AppText>

          <View style={styles.card}>
            <AppText variant="labelMedium" color={Colors.primary[900]} style={styles.cardLabel}>
              Request ID
            </AppText>
            <AppText variant="bodyLarge" color={Colors.neutral[600]}>
              {referenceNumber ? `#${referenceNumber}` : '#REQ-2024-0522-001'}
            </AppText>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Back to Home"
            onPress={() => navigation.popToTop()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(32),
  },
  iconContainer: {
    position: 'relative',
    marginBottom: verticalScale(40),
    width: moderateScale(150),
    height: moderateScale(150),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: moderateScale(110),
    height: moderateScale(110),
    borderRadius: moderateScale(55),
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    borderRadius: 10,
  },
  title: {
    marginBottom: verticalScale(16),
    color: Colors.primary[900], // Dark Navy text
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: verticalScale(40),
    lineHeight: 24,
    paddingHorizontal: horizontalScale(16),
  },
  card: {
    width: '100%',
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    padding: moderateScale(20),
  },
  cardLabel: {
    marginBottom: verticalScale(8),
  },
  footer: {
    padding: moderateScale(24),
    paddingBottom: verticalScale(40),
  },
});
