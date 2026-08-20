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
  Bell,
  Plus,
  List,
  MessageSquare,
  User,
  Heart,
  ShoppingCart,
  Pill,
  ChevronRight,
  MapPin,
  Calendar,
} from 'lucide-react-native';

export default function BeneficiaryDashboardScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>Sarah 👋</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell color={Colors.neutral[0]} size={24} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* Upcoming Request */}
          <Text style={styles.sectionTitle}>Upcoming Request</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <ShoppingCart color={Colors.primary[500]} size={24} />
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>Grocery Assistance</Text>
                <View style={styles.row}>
                  <Calendar color={Colors.neutral[500]} size={14} />
                  <Text style={styles.cardSubtitle}> May 22, 2024 · 2:00 PM - 3:00 PM</Text>
                </View>
                <View style={styles.row}>
                  <MapPin color={Colors.neutral[500]} size={14} />
                  <Text style={styles.cardSubtitle}> Central Park - Main Entrance</Text>
                </View>
                <Text style={styles.cardSubtext}>New York, NY 10022</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.requestHelpBtn}
              onPress={() => navigation.navigate('RequestHelp')}
            >
              <Plus color={Colors.neutral[0]} size={20} />
              <Text style={styles.requestHelpText}>Request Help</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionItem 
              icon={<List color={Colors.neutral[700]} size={24} />} 
              label="My Requests" 
              onPress={() => navigation.navigate('RequestsTab' as never)}
            />
            <QuickActionItem 
              icon={<MessageSquare color={Colors.neutral[700]} size={24} />} 
              label="Message" 
              onPress={() => navigation.navigate('MessagesTab' as never)}
            />
            <QuickActionItem 
              icon={<User color={Colors.neutral[700]} size={24} />} 
              label="My Profile" 
              onPress={() => navigation.navigate('ProfileTab' as never)}
            />
            <QuickActionItem 
              icon={<Heart color={Colors.neutral[700]} size={24} />} 
              label="Donate" 
              onPress={() => {}}
            />
          </View>

          {/* Need Help with? */}
          <Text style={styles.sectionTitle}>Need Help with?</Text>
          <HelpCategoryItem 
            icon={<ShoppingCart color={Colors.primary[500]} size={24} />}
            title="Grocery Assistance"
            onPress={() => navigation.navigate('RequestHelp')}
          />
          <HelpCategoryItem 
            icon={<Pill color={Colors.primary[500]} size={24} />}
            title="Pharmacy Pickup"
            onPress={() => navigation.navigate('RequestHelp')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const QuickActionItem = ({icon, label, onPress}: {icon: React.ReactNode, label: string, onPress: () => void}) => (
  <TouchableOpacity style={styles.quickActionItem} onPress={onPress}>
    <View style={styles.quickActionIcon}>{icon}</View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const HelpCategoryItem = ({icon, title, onPress}: {icon: React.ReactNode, title: string, onPress: () => void}) => (
  <TouchableOpacity style={styles.helpCategoryItem} onPress={onPress}>
    <View style={styles.helpCategoryLeft}>
      <View style={styles.helpCategoryIcon}>{icon}</View>
      <Text style={styles.helpCategoryTitle}>{title}</Text>
    </View>
    <ChevronRight color={Colors.neutral[400]} size={20} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[500],
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[200],
  },
  nameText: {
    ...Typography.h3,
    color: Colors.neutral[0],
    marginTop: 4,
  },
  notificationBtn: {
    padding: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  mainContent: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 20,
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
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.labelLarge,
    color: Colors.neutral[900],
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginLeft: 4,
  },
  cardSubtext: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginLeft: 18,
  },
  requestHelpBtn: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  requestHelpText: {
    ...Typography.buttonMedium,
    color: Colors.neutral[0],
    marginLeft: 8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionLabel: {
    ...Typography.caption,
    color: Colors.neutral[700],
    fontWeight: '500',
  },
  helpCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  helpCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpCategoryTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
  },
});
