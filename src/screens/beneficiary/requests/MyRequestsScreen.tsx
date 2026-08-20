import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
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
} from 'lucide-react-native';

export default function MyRequestsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
        <View style={{width: 28}} />
      </View>

      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
            onPress={() => setActiveTab('Active')}
          >
            <Text style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'History' && styles.activeTab]}
            onPress={() => setActiveTab('History')}
          >
            <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === 'Active' ? (
            <>
              <RequestCard 
                icon={<ShoppingCart color={Colors.primary[500]} size={24} />}
                title="Grocery Assistance"
                date="May 22, 2024 · 2:00 PM"
                location="Central Park - Main Entrance\nNew York, NY 10022"
                status="Accepted"
                statusColor={Colors.success}
                helperImage="https://i.pravatar.cc/150?u=sarah"
                onPress={() => navigation.navigate('RequestTracking')}
              />
              <RequestCard 
                icon={<Pill color={Colors.primary[500]} size={24} />}
                title="Pharmacy Pickup"
                date="May 25, 2024 · 11:00 AM"
                location="CVS Pharmacy\n123 5th Ave, New York, NY 10001"
                status="Pending"
                statusColor={Colors.warning}
                onPress={() => navigation.navigate('RequestTracking')}
              />
              <RequestCard 
                icon={<Car color={Colors.primary[500]} size={24} />}
                title="Transportation"
                date="May 28, 2024 · 3:30 PM"
                location="From: 123 Main St, NY\nTo: Downtown Hospital"
                status="Confirmed"
                statusColor={Colors.info}
                onPress={() => navigation.navigate('RequestTracking')}
              />
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No history found.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const RequestCard = ({
  icon, title, date, location, status, statusColor, helperImage, onPress
}: {
  icon: React.ReactNode, title: string, date: string, location: string, status: string, statusColor: string, helperImage?: string, onPress: () => void
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardHeader}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDate}>{date}</Text>
      </View>
      <ChevronRight color={Colors.primary[300]} size={20} />
    </View>
    <View style={styles.cardBody}>
      <Text style={styles.cardLocation}>{location}</Text>
    </View>
    <View style={styles.cardFooter}>
      <Text style={[styles.statusText, {color: statusColor}]}>{status}</Text>
      {helperImage && (
        <Image source={{uri: helperImage}} style={styles.helperAvatar} />
      )}
    </View>
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
    backgroundColor: Colors.neutral[50],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary[500],
  },
  tabText: {
    ...Typography.labelMedium,
    color: Colors.neutral[500],
  },
  activeTabText: {
    color: Colors.primary[500],
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    marginBottom: 2,
  },
  cardDate: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  cardBody: {
    marginLeft: 52,
    marginBottom: 12,
  },
  cardLocation: {
    ...Typography.caption,
    color: Colors.neutral[500],
    lineHeight: 18,
  },
  cardFooter: {
    marginLeft: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    ...Typography.labelMedium,
  },
  helperAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
  },
});
