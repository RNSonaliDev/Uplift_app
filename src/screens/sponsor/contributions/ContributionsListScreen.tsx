import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { ChevronLeft } from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import ContributionCard from '../../../components/ContributionCard';
// Force reload

import { useFocusEffect } from '@react-navigation/native';
import { donationsApi, Donation } from '../../../api/donations';

const TABS = ['Success', 'Failed'];

export default function ContributionsListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState('Success');

  React.useEffect(() => {
    if (route.params?.timestamp) {
      if (route.params.activeTab) {
        setActiveTab(route.params.activeTab);
      } else {
        setActiveTab('Success');
      }
    }
  }, [route.params?.timestamp]);
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

  const filteredContributions = contributions.filter(c => {
    const status = (c.status || 'Completed').toLowerCase();
    if (activeTab === 'Success') return status === 'completed' || status === 'succeeded';
    return status === activeTab.toLowerCase();
  });

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
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <AppText 
                variant="labelMedium" 
                color={activeTab === tab ? Colors.primary[600] : Colors.neutral[500]}
              >
                {tab}
              </AppText>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {filteredContributions.map((item) => (
            <ContributionCard 
              key={item.id} 
              item={item} 
              onPress={() => {}}
              // onPress={() => navigation.navigate('ContributionDetails', { contribution: item })} 
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    marginBottom: verticalScale(16),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTab: {
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary[600],
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(32),
  }
});
