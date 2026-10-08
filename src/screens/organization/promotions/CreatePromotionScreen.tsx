import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { HtmlContentView } from '../../../components/HtmlContentView';
import { DatePickerModal } from '../../../components/DatePickerModal';
import {
  Megaphone,
  Calendar,
  MapPin,
  Globe,
  Tag,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Eye,
  Layers,
  Hash,
  Pencil,
  MapPin as LocationPinIcon,
  Navigation,
  X,
} from 'lucide-react-native';
import { horizontalScale, verticalScale, moderateScale, fontScale } from '../../../utils/responsive';
import Toast from 'react-native-toast-message';
import { api } from '../../../api/client';

export interface PromotionTypeItem {
  id: number;
  name: string;
  status?: string;
  position?: number;
}

export interface ProductCategoryItem {
  id: number;
  name: string;
  status?: string;
  position?: number;
}

const FALLBACK_PROMOTION_TYPES: PromotionTypeItem[] = [
  { id: 1, name: 'Discount or sale' },
  { id: 2, name: 'Buy one get one' },
  { id: 3, name: 'Free item with purchase' },
  { id: 4, name: 'Grand opening special' },
  { id: 5, name: 'Seasonal offer' },
  { id: 6, name: 'Limited time deal' },
  { id: 7, name: 'New product or service launch' },
];

const FALLBACK_PRODUCT_CATEGORIES: ProductCategoryItem[] = [
  { id: 1, name: 'Food & Drink' },
  { id: 2, name: 'Beauty & Wellness' },
  { id: 3, name: 'Retail & Shopping' },
  { id: 4, name: 'Health & Fitness' },
  { id: 5, name: 'Home & Services' },
  { id: 6, name: 'Technology' },
  { id: 7, name: 'Education & Tutoring' },
  { id: 8, name: 'Entertainment' },
  { id: 9, name: 'Other' },
];

type LocationType = 'in_store' | 'online' | 'both';

export const CreatePromotionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState<'create' | 'active'>('create');

  // Edit Mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Metadata from API
  const [promotionTypes, setPromotionTypes] = useState<PromotionTypeItem[]>(FALLBACK_PROMOTION_TYPES);
  const [productCategories, setProductCategories] = useState<ProductCategoryItem[]>(FALLBACK_PRODUCT_CATEGORIES);
  const [selectedPromotionType, setSelectedPromotionType] = useState<PromotionTypeItem>(FALLBACK_PROMOTION_TYPES[0]);
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategoryItem>(FALLBACK_PRODUCT_CATEGORIES[0]);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAfVdKkV8tvaV4yQnLLtCKZ91qbuRWFBR0';
  const googlePlacesRef = useRef<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  
  // Dates
  const [availableFrom, setAvailableFrom] = useState<Date>(new Date());
  const [availableUntil, setAvailableUntil] = useState<Date>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
  const [isUntilPickerOpen, setIsUntilPickerOpen] = useState(false);

  // Location
  const [locationType, setLocationType] = useState<LocationType>('in_store');
  const [storeAddress, setStoreAddress] = useState('');
  const [onlineUrl, setOnlineUrl] = useState('');

  // Map & Geolocation States
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [region, setRegion] = useState({
    latitude: 11.0168,
    longitude: 76.9558,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  const handleCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setRegion(prev => ({ ...prev, latitude: lat, longitude: lng }));

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const addressStr = data.results[0].formatted_address;
            setStoreAddress(addressStr);
            googlePlacesRef.current?.setAddressText(addressStr);
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
        }
      },
      error => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMarkerDragEnd = async (e: any) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setLatitude(lat.toString());
    setLongitude(lng.toString());
    setRegion(prev => ({ ...prev, latitude: lat, longitude: lng }));

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const addressStr = data.results[0].formatted_address;
        setStoreAddress(addressStr);
        googlePlacesRef.current?.setAddressText(addressStr);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Promo details
  const [promoCode, setPromoCode] = useState('UPLIFT');
  const [quantityAvailable, setQuantityAvailable] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [description, setDescription] = useState('');

  // Modals / Dropdowns
  const [activeDropdown, setActiveDropdown] = useState<'type' | 'category' | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Active Promotions List
  const [promotionsList, setPromotionsList] = useState<any[]>([]);

  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle('');
    setStoreAddress('');
    setOnlineUrl('');
    setQuantityAvailable('');
    setTermsConditions('');
    setDescription('');
    setPromoCode('UPLIFT');
    setLocationType('in_store');
    setFieldErrors({});
  };

  useEffect(() => {
    fetchMetadata();
    fetchPromotionsList();
  }, []);

  useEffect(() => {
    const promoToEdit = route.params?.promotionToEdit;
    if (promoToEdit) {
      setIsEditing(true);
      setEditingId(promoToEdit.id);
      setActiveTab('create');

      setTitle(promoToEdit.business_name || promoToEdit.title || '');
      const addr = promoToEdit.store_address || promoToEdit.address || '';
      setStoreAddress(addr);
      setTimeout(() => {
        googlePlacesRef.current?.setAddressText(addr);
      }, 300);
      setOnlineUrl(promoToEdit.online_url || promoToEdit.url || '');
      setLocationType(promoToEdit.location_type || 'in_store');
      setPromoCode(promoToEdit.promo_code || promoToEdit.promoCode || 'UPLIFT');
      setQuantityAvailable(
        promoToEdit.quantity_available !== null && promoToEdit.quantity_available !== undefined
          ? promoToEdit.quantity_available.toString()
          : (promoToEdit.quantity ? promoToEdit.quantity.replace(/[^0-9]/g, '') : '')
      );
      setTermsConditions(promoToEdit.terms_and_conditions || promoToEdit.termsConditions || '');
      setDescription(promoToEdit.description || '');

      if (promoToEdit.available_from || promoToEdit.availableFrom) {
        const d = new Date(promoToEdit.available_from || promoToEdit.availableFrom);
        if (!isNaN(d.getTime())) setAvailableFrom(d);
      }
      if (promoToEdit.available_until || promoToEdit.availableUntil) {
        const d = new Date(promoToEdit.available_until || promoToEdit.availableUntil);
        if (!isNaN(d.getTime())) setAvailableUntil(d);
      }

      if (promoToEdit.promotion_type_id || promoToEdit.type) {
        const matchType = promotionTypes.find(
          (t) => t.id === promoToEdit.promotion_type_id || t.name.toLowerCase() === (promoToEdit.type || '').toLowerCase()
        );
        if (matchType) setSelectedPromotionType(matchType);
      }

      if (promoToEdit.product_category_id || promoToEdit.category) {
        const matchCat = productCategories.find(
          (c) => c.id === promoToEdit.product_category_id || c.name.toLowerCase() === (promoToEdit.category || '').toLowerCase()
        );
        if (matchCat) setSelectedProductCategory(matchCat);
      }
    }
  }, [route.params?.promotionToEdit, promotionTypes, productCategories]);

  useEffect(() => {
    if (activeTab === 'active') {
      fetchPromotionsList();
    }
  }, [activeTab]);

  const fetchMetadata = async () => {
    try {
      setFetchingMetadata(true);
      const [typesRes, catsRes] = await Promise.all([
        api.get<PromotionTypeItem[]>('/promotion_types').catch(() => FALLBACK_PROMOTION_TYPES),
        api.get<ProductCategoryItem[]>('/product_categories').catch(() => FALLBACK_PRODUCT_CATEGORIES),
      ]);

      if (Array.isArray(typesRes) && typesRes.length > 0) {
        setPromotionTypes(typesRes);
        setSelectedPromotionType(typesRes[0]);
      }
      if (Array.isArray(catsRes) && catsRes.length > 0) {
        setProductCategories(catsRes);
        setSelectedProductCategory(catsRes[0]);
      }
    } catch (error) {
      console.error('Failed to fetch promotion metadata', error);
    } finally {
      setFetchingMetadata(false);
    }
  };

  const fetchPromotionsList = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoadingPromotions(true);

      const data = await api.get<any[]>('/promotions');
      if (Array.isArray(data)) {
        const formatted = data.map((item: any) => {
          let locText = 'Location TBD';
          if (item.location_type === 'in_store' || item.store_address) {
            locText = item.store_address || 'In store';
          } else if (item.location_type === 'online' || item.online_url) {
            locText = `Online (${item.online_url || ''})`;
          } else if (item.location_type === 'both') {
            locText = `${item.store_address || ''} & Online (${item.online_url || ''})`;
          }

          let formattedDates = 'Dates TBD';
          if (item.available_from && item.available_until) {
            const fromD = new Date(item.available_from);
            const untilD = new Date(item.available_until);
            if (!isNaN(fromD.getTime()) && !isNaN(untilD.getTime())) {
              formattedDates = `${formatDateString(fromD)} - ${formatDateString(untilD)}`;
            }
          } else if (item.dates) {
            formattedDates = item.dates;
          }

          return {
            id: item.id?.toString() || Date.now().toString(),
            title: item.business_name || item.title || 'Promotion',
            type: item.promotion_type?.name || item.promotion_type_name || item.type || 'Promotion',
            category: item.product_category?.name || item.product_category_name || item.category || 'General',
            promoCode: item.promo_code || 'UPLIFT',
            locationText: locText,
            dates: formattedDates,
            quantity: item.quantity_available !== null && item.quantity_available !== undefined
              ? `${item.quantity_available} Available`
              : 'Unlimited',
            views: item.views_count || item.views || 0,
            status: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'Active',
          };
        });
        setPromotionsList(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch promotions list', error);
    } finally {
      setLoadingPromotions(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchPromotionsList(true);
  };

  const formatDateString = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!title.trim()) {
      errors.title = 'Please enter business name';
    }

    if ((locationType === 'in_store' || locationType === 'both') && !storeAddress.trim()) {
      errors.storeAddress = 'Please enter business address';
    }

    if ((locationType === 'online' || locationType === 'both') && !onlineUrl.trim()) {
      errors.onlineUrl = 'Please enter online URL';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const rawPayload = {
      promotion: {
        promotion_type_id: selectedPromotionType?.id || 1,
        product_category_id: selectedProductCategory?.id || 1,
        business_name: title.trim(),
        available_from: availableFrom.toISOString(),
        available_until: availableUntil.toISOString(),
        location_type: locationType,
        store_address: storeAddress.trim(),
        online_url: onlineUrl.trim(),
        promo_code: promoCode.trim() || 'UPLIFT',
        quantity_available: quantityAvailable.trim() ? parseInt(quantityAvailable, 10) : null,
        terms_and_conditions: termsConditions.trim(),
      },
    };

    let locText = '';
    if (locationType === 'in_store') locText = storeAddress;
    else if (locationType === 'online') locText = `Online (${onlineUrl})`;
    else locText = `${storeAddress} & Online (${onlineUrl})`;

    const promoData = {
      id: isEditing ? editingId : undefined,
      business_name: title.trim(),
      title: title.trim(),
      promotion_type: selectedPromotionType,
      promotion_type_name: selectedPromotionType?.name,
      product_category: selectedProductCategory,
      product_category_name: selectedProductCategory?.name,
      type: selectedPromotionType?.name || 'Promotion',
      category: selectedProductCategory?.name || 'General',
      promo_code: promoCode.trim() || 'UPLIFT',
      promoCode: promoCode.trim() || 'UPLIFT',
      location_type: locationType,
      store_address: storeAddress.trim(),
      online_url: onlineUrl.trim(),
      locationText: locText,
      available_from: availableFrom.toISOString(),
      available_until: availableUntil.toISOString(),
      dates: `${formatDateString(availableFrom)} - ${formatDateString(availableUntil)}`,
      quantity_available: quantityAvailable.trim() ? parseInt(quantityAvailable, 10) : null,
      quantity: quantityAvailable.trim() ? `${quantityAvailable} Available` : 'Unlimited',
      terms_and_conditions: termsConditions.trim(),
      description: description.trim(),
      views: 0,
      status: 'Draft',
    };

    // Navigate to preview without calling backend API
    navigation.navigate('PromotionPreview', {
      promotion: promoData,
      rawPayload,
      isEditing: Boolean(isEditing),
      editingId: editingId || null,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.primary[500]} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAbsoluteCenter}>
          <AppText variant="h5" color={Colors.neutral[0]}>
            {isEditing ? 'Edit Promotion' : 'Create Promotion'}
          </AppText>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color={Colors.neutral[0]} size={28} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

              {/* Title / Business Name */}
              <Text style={styles.label}>
                Business Name <Text style={{ color: Colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, fieldErrors.title ? styles.inputError : null]}
                placeholder="XYZ LLC"
                placeholderTextColor={Colors.neutral[400]}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: '' }));
                }}
              />
              {fieldErrors.title ? <Text style={styles.fieldErrorText}>{fieldErrors.title}</Text> : null}

              {/* Promotion Type */}
              <Text style={styles.label}>
                Promotion Type <Text style={{ color: Colors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.dropdownInput, fieldErrors.promotionType ? styles.inputError : null]}
                onPress={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}>
                <Text style={styles.dropdownText}>
                  {selectedPromotionType?.name || 'Select Promotion Type'}
                </Text>
                <ChevronDown size={20} color={Colors.neutral[500]} />
              </TouchableOpacity>
              {fieldErrors.promotionType ? <Text style={styles.fieldErrorText}>{fieldErrors.promotionType}</Text> : null}
              {activeDropdown === 'type' && (
                <View style={styles.dropdownList}>
                  {promotionTypes.map((typeItem) => (
                    <TouchableOpacity
                      key={typeItem.id.toString()}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setSelectedPromotionType(typeItem);
                        setActiveDropdown(null);
                        if (fieldErrors.promotionType) setFieldErrors(prev => ({ ...prev, promotionType: '' }));
                      }}>
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          selectedPromotionType?.id === typeItem.id && {
                            color: Colors.primary[600],
                            fontFamily: FontFamily.semiBold,
                          },
                        ]}>
                        {typeItem.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Product Category */}
              <Text style={styles.label}>
                Product Category <Text style={{ color: Colors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.dropdownInput, fieldErrors.productCategory ? styles.inputError : null]}
                onPress={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}>
                <Text style={styles.dropdownText}>
                  {selectedProductCategory?.name || 'Select Product Category'}
                </Text>
                <ChevronDown size={20} color={Colors.neutral[500]} />
              </TouchableOpacity>
              {fieldErrors.productCategory ? <Text style={styles.fieldErrorText}>{fieldErrors.productCategory}</Text> : null}
              {activeDropdown === 'category' && (
                <View style={styles.dropdownList}>
                  {productCategories.map((catItem) => (
                    <TouchableOpacity
                      key={catItem.id.toString()}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setSelectedProductCategory(catItem);
                        setActiveDropdown(null);
                        if (fieldErrors.productCategory) setFieldErrors(prev => ({ ...prev, productCategory: '' }));
                      }}>
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          selectedProductCategory?.id === catItem.id && {
                            color: Colors.primary[600],
                            fontFamily: FontFamily.semiBold,
                          },
                        ]}>
                        {catItem.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Promotion Period */}
              <Text style={styles.label}>Promotion Period</Text>
              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.subLabel}>Available from</Text>
                  <TouchableOpacity
                    style={styles.datePickerInput}
                    onPress={() => setIsFromPickerOpen(true)}>
                    <Calendar size={18} color={Colors.primary[500]} style={{ marginRight: 8 }} />
                    <Text style={styles.datePickerText}>{formatDateString(availableFrom)}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.subLabel}>Available until</Text>
                  <TouchableOpacity
                    style={styles.datePickerInput}
                    onPress={() => setIsUntilPickerOpen(true)}>
                    <Calendar size={18} color={Colors.primary[500]} style={{ marginRight: 8 }} />
                    <Text style={styles.datePickerText}>{formatDateString(availableUntil)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Location */}
              <Text style={styles.label}>Location</Text>
              <View style={styles.pillRow}>
                <TouchableOpacity
                  style={[styles.pillButton, locationType === 'in_store' && styles.pillButtonActive]}
                  onPress={() => setLocationType('in_store')}>
                  <MapPin size={16} color={locationType === 'in_store' ? Colors.primary[600] : Colors.neutral[600]} />
                  <Text style={[styles.pillText, locationType === 'in_store' && styles.pillTextActive]}>
                    In store & address
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pillButton, locationType === 'online' && styles.pillButtonActive]}
                  onPress={() => setLocationType('online')}>
                  <Globe size={16} color={locationType === 'online' ? Colors.primary[600] : Colors.neutral[600]} />
                  <Text style={[styles.pillText, locationType === 'online' && styles.pillTextActive]}>
                    Online - URL
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pillButton, locationType === 'both' && styles.pillButtonActive]}
                  onPress={() => setLocationType('both')}>
                  <Layers size={16} color={locationType === 'both' ? Colors.primary[600] : Colors.neutral[600]} />
                  <Text style={[styles.pillText, locationType === 'both' && styles.pillTextActive]}>
                    Both
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Conditional Location Inputs */}
              {(locationType === 'in_store' || locationType === 'both') && (
                <View style={{ marginTop: 8, marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={[styles.subLabel, { marginBottom: 0 }]}>
                      Business Address <Text style={{ color: Colors.error }}>*</Text>
                    </Text>
                    {(latitude && longitude) ? (
                      <TouchableOpacity onPress={() => setIsMapModalVisible(true)}>
                        <AppText variant="bodyMedium" color={Colors.primary[500]} style={{ textDecorationLine: 'underline' }}>
                          Show on map
                        </AppText>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <GooglePlacesAutocomplete
                    ref={googlePlacesRef}
                    placeholder="e.g. 123 Community Lane, Coimbatore"
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                      if (details) {
                        setStoreAddress(data.description);
                        setLatitude(details.geometry.location.lat.toString());
                        setLongitude(details.geometry.location.lng.toString());
                        setRegion({
                          ...region,
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng,
                        });
                        if (fieldErrors.storeAddress) setFieldErrors(prev => ({ ...prev, storeAddress: '' }));
                      }
                    }}
                    query={{
                      key: GOOGLE_MAPS_API_KEY,
                      language: 'en',
                    }}
                    styles={{
                      container: { flex: 0 },
                      textInputContainer: {
                        backgroundColor: Colors.neutral[0],
                        borderRadius: moderateScale(12),
                        borderWidth: 1,
                        borderColor: fieldErrors.storeAddress ? Colors.error : Colors.neutral[200],
                        height: 52,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12,
                      },
                      textInput: {
                        ...Typography.bodyMedium,
                        color: Colors.neutral[900],
                        height: 50,
                        marginLeft: 8,
                        flex: 1,
                        backgroundColor: 'transparent',
                      },
                      listView: {
                        backgroundColor: Colors.neutral[0],
                        borderWidth: 1,
                        borderColor: Colors.neutral[200],
                        borderRadius: 8,
                        marginTop: 4,
                        elevation: 4,
                        zIndex: 999,
                      },
                    }}
                    textInputProps={{
                      placeholderTextColor: Colors.neutral[400],
                      onChangeText: (text) => {
                        setStoreAddress(text);
                        if (fieldErrors.storeAddress) setFieldErrors(prev => ({ ...prev, storeAddress: '' }));
                      },
                    }}
                    renderLeftButton={() => (
                      <View style={{ marginRight: 4 }}>
                        <LocationPinIcon color={Colors.primary[500]} size={20} />
                      </View>
                    )}
                    renderRightButton={() => (
                      <TouchableOpacity style={{ padding: 4 }} onPress={handleCurrentLocation}>
                        <Navigation color={Colors.primary[500]} size={20} />
                      </TouchableOpacity>
                    )}
                  />
                  {fieldErrors.storeAddress ? <Text style={styles.fieldErrorText}>{fieldErrors.storeAddress}</Text> : null}
                </View>
              )}

              {(locationType === 'online' || locationType === 'both') && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.subLabel}>
                    Online URL <Text style={{ color: Colors.error }}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, fieldErrors.onlineUrl ? styles.inputError : null]}
                    placeholder="https://yourwebsite.com/deal"
                    placeholderTextColor={Colors.neutral[400]}
                    autoCapitalize="none"
                    keyboardType="url"
                    value={onlineUrl}
                    onChangeText={(text) => {
                      setOnlineUrl(text);
                      if (fieldErrors.onlineUrl) setFieldErrors(prev => ({ ...prev, onlineUrl: '' }));
                    }}
                  />
                  {fieldErrors.onlineUrl ? <Text style={styles.fieldErrorText}>{fieldErrors.onlineUrl}</Text> : null}
                </View>
              )}

              {/* Promo Code */}
              <Text style={styles.label}>Promo Code</Text>
              <TextInput
                style={styles.input}
                placeholder="UPLIFT"
                placeholderTextColor={Colors.neutral[400]}
                autoCapitalize="characters"
                value={promoCode}
                onChangeText={setPromoCode}
              />
              <Text style={styles.helperText}>Default is UPLIFT or enter a custom promo code</Text>

              {/* Quantity Available */}
              <Text style={styles.label}>Quantity Available</Text>
              <TextInput
                style={styles.input}
                placeholder="Leave blank for unlimited"
                placeholderTextColor={Colors.neutral[400]}
                keyboardType="number-pad"
                value={quantityAvailable}
                onChangeText={(text) => setQuantityAvailable(text.replace(/[^0-9]/g, ''))}
              />
              <Text style={styles.helperText}>Leave blank for unlimited</Text>

              {/* Terms and Conditions */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
                <Text style={[styles.label, { marginBottom: 0 }]}>Terms and Conditions (HTML)</Text>
                <TouchableOpacity 
                  onPress={() => setShowHtmlPreview(!showHtmlPreview)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary[50], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                >
                  <Eye size={14} color={Colors.primary[600]} style={{ marginRight: 4 }} />
                  <AppText variant="caption" color={Colors.primary[600]} style={{ fontFamily: FontFamily.medium }}>
                    {showHtmlPreview ? 'Edit' : 'Preview'}
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* HTML Formatting Helper Toolbar */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }} contentContainerStyle={{ paddingVertical: 2 }}>
                <TouchableOpacity 
                  style={styles.htmlTagBtn} 
                  onPress={() => setTermsConditions(prev => prev + '<b>bold text</b>')}
                >
                  <AppText variant="caption" color={Colors.neutral[800]} style={{ fontFamily: FontFamily.bold }}>B</AppText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.htmlTagBtn} 
                  onPress={() => setTermsConditions(prev => prev + '<i>italic text</i>')}
                >
                  <AppText variant="caption" color={Colors.neutral[800]} style={{ fontFamily: FontFamily.italic }}>I</AppText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.htmlTagBtn} 
                  onPress={() => setTermsConditions(prev => prev + '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>')}
                >
                  <AppText variant="caption" color={Colors.neutral[800]}>• List</AppText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.htmlTagBtn} 
                  onPress={() => setTermsConditions(prev => prev + '<p>Paragraph text</p>')}
                >
                  <AppText variant="caption" color={Colors.neutral[800]}>&lt;p&gt;</AppText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.htmlTagBtn} 
                  onPress={() => setTermsConditions(prev => prev + '<br/>')}
                >
                  <AppText variant="caption" color={Colors.neutral[800]}>Break</AppText>
                </TouchableOpacity>
              </ScrollView>

              {showHtmlPreview ? (
                <View style={[styles.input, { minHeight: 90, backgroundColor: Colors.neutral[50], padding: 12 }]}>
                  {termsConditions.trim() ? (
                    <HtmlContentView htmlContent={termsConditions} />
                  ) : (
                    <AppText variant="bodySmall" color={Colors.neutral[400]}>No terms entered to preview.</AppText>
                  )}
                </View>
              ) : (
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="e.g. <b>One per customer.</b><br/>Valid until expiration date."
                  placeholderTextColor={Colors.neutral[400]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={termsConditions}
                  onChangeText={setTermsConditions}
                />
              )}

        </ScrollView>

        {/* Footer Action Button */}
        <View style={styles.footer}>
          <Button
            title={isEditing ? 'Update Promotion' : 'Preview Promotion'}
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            fullWidth
          />
        </View>
        {/* Date Picker Modals */}
        <DatePickerModal
          open={isFromPickerOpen}
          date={availableFrom}
          mode="date"
          onConfirm={(d) => {
            setAvailableFrom(d);
            setIsFromPickerOpen(false);
          }}
          onCancel={() => setIsFromPickerOpen(false)}
        />

        <DatePickerModal
          open={isUntilPickerOpen}
          date={availableUntil}
          mode="date"
          minimumDate={availableFrom}
          onConfirm={(d) => {
            setAvailableUntil(d);
            setIsUntilPickerOpen(false);
          }}
          onCancel={() => setIsUntilPickerOpen(false)}
        />

        {/* Location Map Modal */}
        <Modal visible={isMapModalVisible} transparent animationType="slide">
          <View style={styles.mapModalContainer}>
            <View style={styles.mapModalHeader}>
              <AppText variant="h5" style={{ color: Colors.neutral[900], fontFamily: FontFamily.semiBold }}>
                Location on Map
              </AppText>
              <TouchableOpacity onPress={() => setIsMapModalVisible(false)} style={{ padding: 4 }}>
                <X color={Colors.neutral[500]} size={24} />
              </TouchableOpacity>
            </View>
            <MapView
              style={{ flex: 1 }}
              region={{
                latitude: Number(latitude) || region.latitude,
                longitude: Number(longitude) || region.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                draggable
                coordinate={{
                  latitude: Number(latitude) || region.latitude,
                  longitude: Number(longitude) || region.longitude,
                }}
                onDragEnd={handleMarkerDragEnd}
              />
            </MapView>
            <View style={{ padding: moderateScale(16), backgroundColor: Colors.neutral[0] }}>
              <Button title="Done" onPress={() => setIsMapModalVisible(false)} fullWidth />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary[500],
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    marginTop: verticalScale(60),
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    overflow: 'hidden',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.primary[500],
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
  iconButton: { padding: 4 },
  footer: {
    backgroundColor: Colors.neutral[0],
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    marginHorizontal: horizontalScale(4),
  },
  tabButtonActive: {
    backgroundColor: Colors.primary[50],
  },
  tabText: {
    marginLeft: 6,
    fontFamily: FontFamily.medium,
    fontSize: fontScale(14),
    color: Colors.neutral[600],
  },
  tabTextActive: {
    color: Colors.primary[600],
    fontFamily: FontFamily.semiBold,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    elevation: 2,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  iconCircle: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(17),
    color: Colors.neutral[900],
  },
  formSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: fontScale(12),
    color: Colors.neutral[500],
    marginTop: 2,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.neutral[700],
    marginBottom: verticalScale(6),
    marginTop: verticalScale(14),
  },
  subLabel: {
    ...Typography.labelMedium,
    fontSize: fontScale(14),
    color: Colors.neutral[700],
    marginBottom: verticalScale(4),
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.neutral[500],
    marginTop: verticalScale(4),
  },
  input: {
    ...Typography.bodyMedium,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: moderateScale(8),
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(12),
    color: Colors.neutral[900],
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  fieldErrorText: {
    color: Colors.error,
    ...Typography.bodySmall,
    marginTop: verticalScale(4),
    marginLeft: horizontalScale(4),
  },
  multilineInput: {
    minHeight: verticalScale(80),
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: moderateScale(8),
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(12),
  },
  dropdownText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: moderateScale(8),
    marginTop: verticalScale(4),
    elevation: 4,
  },
  dropdownOption: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  dropdownOptionText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[700],
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: moderateScale(8),
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(12),
  },
  datePickerText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: verticalScale(6),
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(8),
  },
  pillButtonActive: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  pillText: {
    ...Typography.labelMedium,
    fontSize: fontScale(13.5),
    color: Colors.neutral[700],
    marginLeft: 6,
  },
  pillTextActive: {
    color: Colors.primary[700],
    fontFamily: FontFamily.semiBold,
  },
  submitButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(24),
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(15),
    color: Colors.neutral[0],
  },
  activeContainer: {
    marginTop: verticalScale(4),
  },
  promoCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(14),
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    elevation: 2,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  typeBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  typeBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: fontScale(11.5),
    color: Colors.primary[700],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary[50],
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(12),
  },
  statusText: {
    fontFamily: FontFamily.medium,
    fontSize: fontScale(11.5),
    color: Colors.secondary[700],
  },
  promoTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: fontScale(15),
    color: Colors.neutral[900],
    marginBottom: verticalScale(8),
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100],
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    marginRight: horizontalScale(8),
  },
  codeText: {
    fontFamily: FontFamily.bold,
    fontSize: fontScale(12.5),
    color: Colors.primary[700],
  },
  categoryBadge: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  categoryText: {
    fontFamily: FontFamily.regular,
    fontSize: fontScale(12),
    color: Colors.neutral[700],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(6),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  metaText: {
    fontFamily: FontFamily.regular,
    fontSize: fontScale(12),
    color: Colors.neutral[600],
    marginLeft: 6,
  },
  htmlTagBtn: {
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
});
