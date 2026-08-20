import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Pill,
  Car,
  Coffee,
  Activity,
  MoreHorizontal,
} from 'lucide-react-native';

export default function RequestHelpScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Help</Text>
        <View style={{width: 28}} /> {/* Spacer for centering */}
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>How can we help you?</Text>
        
        <View style={styles.list}>
          <HelpOptionItem
            icon={<ShoppingCart color={Colors.primary[500]} size={24} />}
            title="Grocery Assistance"
            subtitle="Get help with grocery shopping and delivery."
            onPress={() => navigation.navigate('RequestDetails')}
          />
          <HelpOptionItem
            icon={<Pill color={Colors.primary[500]} size={24} />}
            title="Pharmacy Pickup"
            subtitle="We'll pick up and deliver your medications."
            onPress={() => navigation.navigate('RequestDetails')}
          />
          <HelpOptionItem
            icon={<Car color={Colors.primary[500]} size={24} />}
            title="Transportation"
            subtitle="Need a ride to appointments or errands."
            onPress={() => navigation.navigate('RequestDetails')}
          />
          <HelpOptionItem
            icon={<Coffee color={Colors.primary[500]} size={24} />}
            title="Meal Delivery"
            subtitle="Nutritious meals delivered to you."
            onPress={() => navigation.navigate('RequestDetails')}
          />
          <HelpOptionItem
            icon={<Activity color={Colors.primary[500]} size={24} />}
            title="Wellness Check"
            subtitle="Someone will check in to see how you're doing."
            onPress={() => navigation.navigate('RequestDetails')}
          />
          <HelpOptionItem
            icon={<MoreHorizontal color={Colors.primary[500]} size={24} />}
            title="Other Assistance"
            subtitle="Describe your need and we'll help."
            onPress={() => navigation.navigate('RequestDetails')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const HelpOptionItem = ({icon, title, subtitle, onPress}: {icon: React.ReactNode, title: string, subtitle: string, onPress: () => void}) => (
  <TouchableOpacity style={styles.optionItem} onPress={onPress}>
    <View style={styles.iconContainer}>{icon}</View>
    <View style={styles.textContainer}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionSubtitle}>{subtitle}</Text>
    </View>
    <ChevronRight color={Colors.neutral[400]} size={20} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[500],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[0],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    ...Typography.h4,
    color: Colors.neutral[900],
    marginBottom: 24,
  },
  list: {
    gap: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  optionTitle: {
    ...Typography.labelLarge,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  optionSubtitle: {
    ...Typography.caption,
    color: Colors.neutral[500],
    lineHeight: 18,
  },
});
