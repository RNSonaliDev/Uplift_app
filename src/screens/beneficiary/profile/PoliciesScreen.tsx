import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Users,
  ShieldCheck,
  UserCheck,
} from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { horizontalScale, verticalScale, moderateScale } from '../../../utils/responsive';

interface PolicyItem {
  id: string;
  title: string;
  type: 'privacy' | 'terms' | 'guidelines' | 'safety' | 'minor-volunteer';
  icon: React.ComponentType<{ color: string; size: number }>;
}

const POLICIES: PolicyItem[] = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    type: 'privacy',
    icon: Shield,
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    type: 'terms',
    icon: FileText,
  },
  {
    id: 'guidelines',
    title: 'Community Guidelines',
    type: 'guidelines',
    icon: Users,
  },
  {
    id: 'safety',
    title: 'Safety Policy',
    type: 'safety',
    icon: ShieldCheck,
  },
  {
    id: 'minor-volunteer',
    title: 'Minor Volunteer Policy',
    type: 'minor-volunteer',
    icon: UserCheck,
  },
];

export default function PoliciesScreen() {
  const navigation = useNavigation<any>();

  const handleOpenPolicy = (item: PolicyItem) => {
    navigation.navigate('LegalContent', {
      type: item.type,
      title: item.title,
    });
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={Colors.neutral[0]} size={28} />
          </TouchableOpacity>
          <AppText variant="h5" color={Colors.neutral[0]} style={{ textAlign: 'center' }}>
            Policies
          </AppText>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.card}>
            {POLICIES.map((item, index) => {
              const IconComponent = item.icon;
              const isLast = index === POLICIES.length - 1;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.row, isLast && styles.rowNoBorder]}
                  onPress={() => handleOpenPolicy(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.iconContainer}>
                      <IconComponent color={Colors.primary[600]} size={20} />
                    </View>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                  </View>
                  <ChevronRight color={Colors.neutral[400]} size={20} />
                </TouchableOpacity>
              );
            })}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(14),
    backgroundColor: Colors.primary[500],
  },
  backBtn: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    marginHorizontal: horizontalScale(16),
    paddingHorizontal: horizontalScale(16),
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(18),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  rowNoBorder: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    marginLeft: horizontalScale(14),
  },
});

