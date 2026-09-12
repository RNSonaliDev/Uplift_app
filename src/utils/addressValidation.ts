export type ValidationResult = {
  isBusinessAddress: boolean | 'unknown';
  addressType: 'business' | 'residential' | 'mixed_use' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  message: string;
};

export const validateAddressType = (types: string[] = []): ValidationResult => {
  if (!types || types.length === 0) {
    return {
      isBusinessAddress: 'unknown',
      addressType: 'unknown',
      confidence: 'low',
      message: 'Unable to verify address type. Please ensure this is a public business address.',
    };
  }

  const residentialTypes = [
    'premise',
    'subpremise',
    'street_address',
    'route',
    'intersection',
    'neighborhood',
    'postal_code',
  ];

  const businessTypes = [
    'establishment',
    'point_of_interest',
    'store',
    'restaurant',
    'bank',
    'health',
    'lodging',
    'place_of_worship',
    'local_government_office',
    'shopping_mall',
    'cafe',
    'library',
    'park',
    'school',
    'university',
    'transit_station',
    'museum',
    'hospital',
    'police',
    'airport'
  ];

  const hasBusiness = types.some(t => businessTypes.includes(t));
  const hasResidential = types.some(t => residentialTypes.includes(t));

  if (hasBusiness) {
    return {
      isBusinessAddress: true,
      addressType: 'business',
      confidence: 'high',
      message: 'The selected address has been verified as a business address.',
    };
  }

  // If it only has residential/geocoding types and no business types
  if (hasResidential && !hasBusiness) {
    return {
      isBusinessAddress: false,
      addressType: 'residential',
      confidence: 'high',
      message: 'This appears to be a residential address. For your safety, we recommend meeting at a public business address if possible.',
    };
  }

  return {
    isBusinessAddress: 'unknown',
    addressType: 'unknown',
    confidence: 'low',
    message: 'Unable to confidently verify the property type. Please ensure this is a public business address.',
  };
};
