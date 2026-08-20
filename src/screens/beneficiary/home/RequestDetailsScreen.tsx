import React from 'react';
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
  ShoppingCart,
  Calendar,
  Clock,
  MapPin,
  AlignLeft,
  MessageSquare,
  Map,
  Star,
} from 'lucide-react-native';

export default function RequestDetailsScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Top Info */}
        <View style={styles.topInfo}>
          <View style={styles.bigIconContainer}>
            <ShoppingCart color={Colors.primary[500]} size={40} />
          </View>
          <Text style={styles.title}>Grocery Assistance</Text>
          <Text style={styles.statusText}>Your request has been accepted!</Text>
        </View>

        {/* Request Details Card */}
        <Text style={styles.sectionTitle}>Request Details</Text>
        <View style={styles.card}>
          <DetailRow icon={<Calendar color={Colors.neutral[500]} size={20} />} text="May 22, 2024" />
          <DetailRow icon={<Clock color={Colors.neutral[500]} size={20} />} text="2:00 PM - 3:00 PM" />
          <DetailRow 
            icon={<MapPin color={Colors.neutral[500]} size={20} />} 
            text="Central Park - Main Entrance\nNew York, NY 10022" 
          />
          <DetailRow 
            icon={<AlignLeft color={Colors.neutral[500]} size={20} />} 
            text="Please bring low-fat milk and eggs." 
          />
        </View>

        {/* Helper Card */}
        <Text style={styles.sectionTitle}>Helper</Text>
        <View style={styles.card}>
          <View style={styles.helperRow}>
            <Image 
              source={{uri: 'https://i.pravatar.cc/150?u=james'}} 
              style={styles.avatar} 
            />
            <View style={styles.helperInfo}>
              <Text style={styles.helperName}>James Anderson</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingText}>4.9</Text>
                <Star color={Colors.warning} fill={Colors.warning} size={14} style={{marginHorizontal: 4}} />
                <Text style={styles.ratingSubtext}>125 helpfuls</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.outlineBtn}>
            <MessageSquare color={Colors.primary[500]} size={20} />
            <Text style={styles.outlineBtnText}>Message Helper</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.primaryBtn}>
          <Map color={Colors.neutral[0]} size={20} />
          <Text style={styles.primaryBtnText}>View on Map</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({icon, text}: {icon: React.ReactNode, text: string}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>{icon}</View>
    <Text style={styles.detailText}>{text}</Text>
  </View>
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
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  topInfo: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  bigIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...Typography.h4,
    color: Colors.neutral[900],
    marginBottom: 8,
  },
  statusText: {
    ...Typography.labelMedium,
    color: Colors.success,
  },
  sectionTitle: {
    ...Typography.h6,
    color: Colors.neutral[900],
    marginBottom: 16,
    fontWeight: '600',
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
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  detailText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[700],
    flex: 1,
    lineHeight: 22,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  helperInfo: {
    flex: 1,
  },
  helperName: {
    ...Typography.labelLarge,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
  },
  ratingSubtext: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  outlineBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderRadius: 12,
    paddingVertical: 12,
  },
  outlineBtnText: {
    ...Typography.buttonMedium,
    color: Colors.primary[500],
    marginLeft: 8,
  },
  primaryBtn: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  primaryBtnText: {
    ...Typography.buttonLarge,
    color: Colors.neutral[0],
    marginLeft: 8,
  },
});
