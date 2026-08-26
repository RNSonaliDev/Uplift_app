import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {Typography, FontFamily} from '../../../theme/typography';
import {horizontalScale, verticalScale, moderateScale} from '../../../utils/responsive';
import {
  ChevronLeft,
  ShoppingCart,
  Pill,
  Car,
  Soup,
  Users,
  MoreHorizontal,
} from 'lucide-react-native';
import {authApi, CategoryResponse} from '../../../api/auth';
import {api, getFullImageUrl} from '../../../api/client';

const {width} = Dimensions.get('window');
const CARD_GAP = horizontalScale(16);
const CARD_WIDTH = Math.floor((width - horizontalScale(48) - CARD_GAP) / 2); // 48 is horizontal padding (24 * 2)

export default function RequestHelpScreen() {
  const navigation = useNavigation<any>();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await authApi.getCategories();
      const beneficiaryCategories = data.filter((cat) => cat.category_type === 'beneficiary');
      setCategories(beneficiaryCategories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('groc') || t.includes('shop')) return <ShoppingCart color={Colors.primary[500]} size={moderateScale(32)} />;
    if (t.includes('pharm') || t.includes('med') || t.includes('pill')) return <Pill color={Colors.primary[500]} size={moderateScale(32)} />;
    if (t.includes('meal') || t.includes('food') || t.includes('soup')) return <Soup color={Colors.secondary[500]} size={moderateScale(32)} />;
    if (t.includes('trans') || t.includes('drive') || t.includes('car')) return <Car color={Colors.primary[500]} size={moderateScale(32)} />;
    if (t.includes('comp') || t.includes('people') || t.includes('user')) return <Users color={Colors.primary[500]} size={moderateScale(32)} />;
    return <MoreHorizontal color={Colors.primary[500]} size={moderateScale(32)} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Help</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>What do you need help with?</Text>
        <Text style={styles.subtitle}>Choose a category to get started</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary[500]} style={{marginTop: 40}} />
        ) : (
          <View style={styles.grid}>
            {categories.map((cat) => (
              <HelpCategoryCard
                key={cat.id.toString()}
                icon={cat.logo_url ? (
                  <Image 
                    source={{ uri: getFullImageUrl(cat.logo_url) as string }}
                    style={{ width: 32, height: 32 }}
                    resizeMode="contain"
                  />
                ) : getIconForCategory(cat.title)}
                title={cat.title}
                onPress={() => navigation.navigate('RequestsTab', {
                  screen: 'CreateRequest',
                  params: { category_id: cat.id.toString() }
                })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const HelpCategoryCard = ({icon, title, onPress}: {icon: React.ReactNode, title: string, onPress: () => void}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.iconContainer}>{icon}</View>
    <Text style={styles.cardTitle} numberOfLines={2} textAlign="center">{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backBtn: {
    padding: moderateScale(4),
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  content: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  title: {
    ...Typography.h4,
    color: Colors.neutral[900],
    marginBottom: verticalScale(8),
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
    marginBottom: verticalScale(24),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    marginBottom: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: {width: 0, height: verticalScale(4)},
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(12),
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    minHeight: verticalScale(140),
  },
  iconContainer: {
    marginBottom: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
});
