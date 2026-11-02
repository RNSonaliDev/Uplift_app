import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronDown, ChevronUp, Search, X, HelpCircle } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { FontFamily } from '../../../theme/typography';
import { contentApi, FAQItem } from '../../../api';
import { HtmlContentView } from '../../../components/HtmlContentView';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const FAQScreen = () => {
  const navigation = useNavigation<any>();

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchFaqs = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await contentApi.getFaqs();
      setFaqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Extract unique category types from the FAQ data
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    faqs.forEach((faq) => {
      if (faq.type && typeof faq.type === 'string') {
        types.add(faq.type.toLowerCase());
      }
    });
    return ['all', ...Array.from(types)];
  }, [faqs]);

  // Format type name for display (e.g. "beneficiaries" -> "Beneficiaries")
  const formatTypeName = (type: string) => {
    if (type === 'all') return 'All';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Filter FAQs by category and search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      // Type filter
      if (selectedType !== 'all') {
        if ((faq.type || '').toLowerCase() !== selectedType.toLowerCase()) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = (faq.title || '').toLowerCase().includes(query);
        // Strip html tags from description for searching
        const cleanDesc = (faq.description || '').replace(/<[^>]*>/g, '').toLowerCase();
        const descMatch = cleanDesc.includes(query);
        return titleMatch || descMatch;
      }

      return true;
    });
  }, [faqs, selectedType, searchQuery]);

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={Colors.neutral[0]} size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            FAQs
          </Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search color={Colors.neutral[400]} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search FAQs..."
              placeholderTextColor={Colors.neutral[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X color={Colors.neutral[400]} size={18} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Pills */}
        {availableTypes.length > 2 && (
          <View style={styles.categoryContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContent}
            >
              {availableTypes.map((type) => {
                const isSelected = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                    onPress={() => setSelectedType(type)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                      {formatTypeName(type)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* FAQ Content List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        ) : (
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchFaqs(true)}
                tintColor={Colors.primary[500]}
              />
            }
          >
            {filteredFaqs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <HelpCircle color={Colors.neutral[300]} size={56} />
                <Text style={styles.emptyTitle}>
                  No FAQs found
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery.trim()
                    ? `No questions matching "${searchQuery}"`
                    : 'There are no FAQs available in this category.'}
                </Text>
              </View>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <View key={faq.id} style={styles.card}>
                    <TouchableOpacity
                      style={styles.cardHeader}
                      onPress={() => toggleExpand(faq.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardHeaderLeft}>
                        <Text style={styles.questionText}>
                          {faq.title}
                        </Text>
                      </View>
                      <View style={styles.iconContainer}>
                        {isExpanded ? (
                          <ChevronUp color={Colors.primary[600]} size={22} />
                        ) : (
                          <ChevronDown color={Colors.neutral[400]} size={22} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.answerContainer}>
                        <View style={styles.divider} />
                        <HtmlContentView htmlContent={faq.description} textColor={Colors.neutral[700]} />
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
};

export default FAQScreen;

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
    paddingVertical: verticalScale(12),
    backgroundColor: Colors.primary[500],
  },
  headerTitle: {
    fontFamily: FontFamily.medium,
    fontSize: fontScale(18),
    color: Colors.neutral[0],
    textAlign: 'center',
  },
  backBtn: {
    padding: moderateScale(4),
  },
  headerRightPlaceholder: {
    width: 28,
  },
  searchContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(8),
    backgroundColor: Colors.neutral[0],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(12),
    height: verticalScale(44),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: horizontalScale(8),
    fontSize: fontScale(14),
    fontFamily: FontFamily.regular,
    color: Colors.neutral[900],
    paddingVertical: 0,
  },
  categoryContainer: {
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    paddingBottom: verticalScale(10),
  },
  categoryContent: {
    paddingHorizontal: horizontalScale(16),
    gap: horizontalScale(8),
  },
  categoryPill: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.neutral[100],
  },
  categoryPillActive: {
    backgroundColor: Colors.primary[500],
  },
  categoryPillText: {
    fontFamily: FontFamily.medium,
    fontSize: fontScale(13),
    color: Colors.neutral[700],
  },
  categoryPillTextActive: {
    fontFamily: FontFamily.semiBold,
    color: Colors.neutral[0],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: moderateScale(16),
    paddingBottom: verticalScale(32),
  },
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(14),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    overflow: 'hidden',
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(16),
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: horizontalScale(12),
  },
  questionText: {
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(15),
    color: Colors.neutral[900],
    lineHeight: fontScale(22),
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerContainer: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(16),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginBottom: verticalScale(12),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(60),
    paddingHorizontal: horizontalScale(32),
  },
  emptyTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(16),
    color: Colors.neutral[700],
    marginTop: verticalScale(16),
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: fontScale(13),
    color: Colors.neutral[500],
    marginTop: verticalScale(6),
    textAlign: 'center',
  },
});
