import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { ChevronLeft } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import ContributionCard from '../../../components/ContributionCard';
// Force reload

import { useFocusEffect } from '@react-navigation/native';
import { donationsApi, Donation } from '../../../api/donations';

const TABS = ['All', 'Completed', 'Pending', 'Failed'];

export default function ContributionsListScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('All');
  const [contributions, setContributions] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContributions = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await donationsApi.getDonations();
      setContributions(data || []);
    } catch (error) {
      console.error('Failed to fetch contributions', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchContributions();
    }, [fetchContributions])
  );

  const filteredContributions = contributions.filter(c => 
    activeTab === 'All' || (c.status || 'Completed').toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <AppText variant="h4" color={Colors.neutral[0]}>
          My Contributions
        </AppText>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.container}>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.tabItemSelected]}
                onPress={() => setActiveTab(tab)}
              >
                <AppText 
                  variant="bodyMedium" 
                  color={activeTab === tab ? Colors.neutral[0] : Colors.neutral[600]}
                >
                  {tab}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List */}
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {filteredContributions.map((item) => (
            <ContributionCard 
              key={item.id} 
              item={item} 
              onPress={() => navigation.navigate('ContributionDetails', { contribution: item })} 
            />
          ))}
          {filteredContributions.length === 0 && (
            <View style={{padding: 40, alignItems: 'center'}}>
              <AppText variant="bodyLarge" color={Colors.neutral[500]}>No contributions found.</AppText>
            </View>
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[500],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  backButton: {
    padding: moderateScale(4),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: verticalScale(24),
  },
  tabsContainer: {
    marginBottom: verticalScale(16),
  },
  tabsScroll: {
    paddingHorizontal: horizontalScale(24),
    gap: horizontalScale(8),
  },
  tabItem: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  tabItemSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(32),
  }
});
