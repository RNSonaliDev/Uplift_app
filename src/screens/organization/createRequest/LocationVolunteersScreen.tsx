import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  PanResponder,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Crosshair, Map, Minus, Plus, Navigation } from 'lucide-react-native';
import MapView, { Marker, Circle as MapCircle } from 'react-native-maps';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';

import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';

export const LocationVolunteersScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  
  const params = route.params || {};

  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [radius, setRadius] = useState(10); // in km
  const [trackWidth, setTrackWidth] = useState(0);
  const radiusRef = useRef(radius);

  useEffect(() => {
    radiusRef.current = radius;
  }, [radius]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        if (trackWidth > 0) {
          const tapX = evt.nativeEvent.locationX - 16; // account for paddingHorizontal
          const percentage = Math.max(0, Math.min(1, tapX / trackWidth));
          const newRadius = Math.round(1 + percentage * 24);
          setRadius(newRadius);
          radiusRef.current = newRadius;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (trackWidth > 0) {
          const percentageChange = gestureState.dx / trackWidth;
          const newRadius = Math.round(radiusRef.current + percentageChange * 24);
          setRadius(Math.max(1, Math.min(25, newRadius)));
        }
      },
    })
  ).current;

  const [volunteersNeeded, setVolunteersNeeded] = useState(params.helpType === 'single' ? 1 : 2);
  const [urgency, setUrgency] = useState<'Normal' | 'High' | 'Urgent'>('High');

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAd20tmxrXZ1VCyhZx4q9aK0ejZtQtE92s';
  const googlePlacesRef = useRef<GooglePlacesAutocompleteRef>(null);

  const handleCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setRegion({
          ...region,
          latitude: lat,
          longitude: lng,
        });
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setAddress('Current Location');
        googlePlacesRef.current?.setAddressText('Current Location');
      },
      (error) => console.log(error.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMarkerDragEnd = async (e: any) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setRegion({
      ...region,
      latitude: lat,
      longitude: lng,
    });
    setLatitude(lat.toString());
    setLongitude(lng.toString());
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const fetchedAddress = data.results[0].formatted_address;
        setAddress(fetchedAddress);
        googlePlacesRef.current?.setAddressText(fetchedAddress);
      }
    } catch (error) {
      console.error('Error fetching reverse geocoding:', error);
    }
  };

  const handleContinue = () => {
    if (!address.trim()) {
      setAddressError('Please enter an address');
      return;
    }

    navigation.navigate('ReviewRequest', {
      ...params,
      address,
      latitude,
      longitude,
      radius,
      volunteersNeeded,
      urgency,
    });
  };

  const incrementVolunteers = () => setVolunteersNeeded(v => v + 1);
  const decrementVolunteers = () => setVolunteersNeeded(v => Math.max(1, v - 1));

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
        <Text style={styles.headerTitle}>Location & Volunteers</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder="Enter address"
            fetchDetails={true}
            onPress={(data, details = null) => {
              if (addressError) setAddressError('');
              if (details) {
                setAddress(data.description);
                setLatitude(details.geometry.location.lat.toString());
                setLongitude(details.geometry.location.lng.toString());
                setRegion({
                  ...region,
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                });
              }
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: 'en',
            }}
            styles={{
              container: { flex: 0 },
              textInputContainer: {
                backgroundColor: Colors.neutral[50],
                borderRadius: 12,
                borderWidth: 1,
                borderColor: addressError ? Colors.error : Colors.neutral[200],
                height: 52,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
              },
              textInput: {
                color: Colors.neutral[900],
                fontSize: 16,
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
              },
            }}
            textInputProps={{
              placeholderTextColor: Colors.neutral[400],
              onChangeText: (text) => {
                setAddress(text);
                if (addressError) setAddressError('');
              }
            }}
            listViewProps={{
              nestedScrollEnabled: true,
            }}
            renderLeftButton={() => (
              <View style={{marginRight: 4}}>
                <MapPin color={Colors.primary[500]} size={20} />
              </View>
            )}
            renderRightButton={() => (
              <TouchableOpacity style={{padding: 4}} onPress={handleCurrentLocation}>
                <Navigation color={Colors.primary[500]} size={20} />
              </TouchableOpacity>
            )}
          />
          {!!addressError && <Text style={styles.errorText}>{addressError}</Text>}
        </View>

        {/* Map */}
        {(latitude && longitude) ? (
          <View style={styles.mapContainer}>
            <MapView
              style={{ flex: 1 }}
              region={{
                latitude: Number(latitude),
                longitude: Number(longitude),
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Marker 
                draggable
                coordinate={{ latitude: Number(latitude), longitude: Number(longitude) }} 
                onDragEnd={handleMarkerDragEnd}
              />
              <MapCircle
                center={{ latitude: Number(latitude), longitude: Number(longitude) }}
                radius={radius * 1000} // converting km to meters
                fillColor="rgba(91, 77, 255, 0.2)"
                strokeColor="rgba(91, 77, 255, 0.5)"
              />
            </MapView>
          </View>
        ) : null}

        {/* Volunteers Needed */}
        {params.helpType !== 'single' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Volunteers Needed</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity style={styles.counterButton} onPress={decrementVolunteers}>
                <Minus color={Colors.neutral[900]} size={24} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{volunteersNeeded}</Text>
              <TouchableOpacity style={styles.counterButton} onPress={incrementVolunteers}>
                <Plus color={Colors.neutral[900]} size={24} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Urgency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Urgency</Text>
          <View style={styles.urgencyGroup}>
            {['Normal', 'High', 'Urgent'].map((level) => {
              const isActive = urgency === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[styles.urgencyButton, isActive && styles.urgencyButtonActive]}
                  onPress={() => setUrgency(level as any)}
                >
                  <Text style={[styles.urgencyText, isActive && styles.urgencyTextActive]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleContinue}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.neutral[900],
    marginBottom: 8,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 12,
    backgroundColor: Colors.neutral[50],
  },
  addressText: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
  },
  iconButton: {
    padding: 8,
  },
  mapContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#E5E5CA', // Map-like background color
  },
  mapBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  mapRadiusCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(91, 77, 255, 0.2)', // Primary color with opacity
    borderWidth: 1,
    borderColor: 'rgba(91, 77, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPin: {
    marginTop: -12,
  },
  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  radiusValue: {
    ...Typography.labelMedium,
    color: Colors.primary[600],
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
    position: 'relative',
    marginBottom: 16,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary[600],
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary[600],
    top: -8,
    marginLeft: -10, // Center thumb
    borderWidth: 2,
    borderColor: Colors.neutral[0],
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.neutral[50],
  },
  counterButton: {
    padding: 16,
  },
  counterValue: {
    ...Typography.h4,
    color: Colors.neutral[900],
  },
  urgencyGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    backgroundColor: Colors.neutral[50],
  },
  urgencyButtonActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  urgencyText: {
    ...Typography.labelMedium,
    color: Colors.neutral[700],
  },
  urgencyTextActive: {
    color: Colors.neutral[0],
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  primaryButton: {
    backgroundColor: Colors.primary[600],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.buttonLarge,
    color: Colors.neutral[0],
  },
});
