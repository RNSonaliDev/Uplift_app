import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBag,
  Pill,
  Car,
  Users,
  UserCheck,
  Grid,
  MoreHorizontal,
  ShoppingCart,
} from 'lucide-react-native';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { api, getFullImageUrl } from '../../../api/client';
import { AppText } from '../../../components';

export const SelectCategoryScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<any[]>('/categories?category_type=organization');
        setCategories(response);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCategory = (category: any) => {
    navigation.navigate('RequestDetails', { categoryId: category.id, categoryTitle: category.title });
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAbsoluteCenter}>
          <AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: 'center'}}>Select Category</AppText>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color={Colors.neutral[0]} size={28} />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search color={Colors.neutral[400]} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search category..."
            placeholderTextColor={Colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories List */}
        {loading ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary[600]} />
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredCategories.map((category) => {
              const titleLower = category.title.toLowerCase();
              let IconComponent = MoreHorizontal;
              if (titleLower.includes('grocer') || titleLower.includes('shop')) IconComponent = ShoppingCart;
              else if (titleLower.includes('pharmac')) IconComponent = Pill;
              else if (titleLower.includes('transport') || titleLower.includes('ride')) IconComponent = Car;
              else if (titleLower.includes('event')) IconComponent = Users;
              else if (titleLower.includes('senior')) IconComponent = UserCheck;

              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleSelectCategory(category)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryLeft}>
                    {category.logo_url ? (
                      <View style={styles.iconContainer}>
                        <Image source={{ uri: getFullImageUrl(category.logo_url) || '' }} style={{ width: 24, height: 24 }} resizeMode="contain" />
                      </View>
                    ) : (
                      <View style={styles.iconContainer}>
                        <IconComponent color={Colors.primary[600]} size={24} />
                      </View>
                    )}
                    <Text style={styles.title}>{category.title}</Text>
                  </View>
                  <ChevronRight color={Colors.neutral[400]} size={20} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
    position: 'relative',
  },
  headerAbsoluteCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[0],
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    height: '100%',
  },
  listContainer: {
    flexDirection: 'column',
  },
  categoryCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    fontFamily: FontFamily.medium,
    fontSize: 16,
    flex: 1,
  },
});
