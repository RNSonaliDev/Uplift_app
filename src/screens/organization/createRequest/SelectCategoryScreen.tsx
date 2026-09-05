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
  ArrowLeft,
  Search,
  ShoppingBag,
  Pill,
  Car,
  Users,
  UserCheck,
  Grid,
} from 'lucide-react-native';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { api, getFullImageUrl } from '../../../api/client';

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
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      {Platform.OS === 'ios' && <SafeAreaView />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Category</Text>
        <View style={{ width: 40 }} /> {/* Placeholder to center title */}
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
              let IconComponent = Grid;
              if (titleLower.includes('grocer')) IconComponent = ShoppingBag;
              else if (titleLower.includes('pharmac')) IconComponent = Pill;
              else if (titleLower.includes('transport') || titleLower.includes('ride')) IconComponent = Car;
              else if (titleLower.includes('event')) IconComponent = Users;
              else if (titleLower.includes('senior')) IconComponent = UserCheck;

              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleSelectCategory(category)}
                >
                  {category.logo_url ? (
                    <View style={[styles.iconContainer, { backgroundColor: Colors.primary[50], overflow: 'hidden' }]}>
                      <Image source={{ uri: getFullImageUrl(category.logo_url) || '' }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    </View>
                  ) : (
                    <View style={[styles.iconContainer, { backgroundColor: Colors.primary[50] }]}>
                      <IconComponent color={Colors.primary[600]} size={24} />
                    </View>
                  )}
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{category.title}</Text>
                    <Text style={styles.description}>{category.short_description || category.title}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
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
    marginBottom: 24,
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
    gap: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 16,
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  description: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
});
