import AsyncStorage from '@react-native-async-storage/async-storage';

declare const process: any;

const STRIPE_SECRET_KEY = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_STRIPE_SECRET_KEY) || '';

export interface StripeConfig {
  processing_fee_percent: number;
  fixed_charge: number;
}

export const DEFAULT_STRIPE_CONFIG: StripeConfig = {
  processing_fee_percent: 2.9,
  fixed_charge: 0.3,
};

const STRIPE_CONFIG_STORAGE_KEY = '@stripe_config';

export const saveStripeConfig = async (config: any): Promise<StripeConfig | null> => {
  if (!config) return null;
  try {
    const feePercent = typeof config.processing_fee_percent === 'number'
      ? config.processing_fee_percent
      : parseFloat(config.processing_fee_percent);
    const fixedCharge = typeof config.fixed_charge === 'number'
      ? config.fixed_charge
      : parseFloat(config.fixed_charge);

    if (!isNaN(feePercent) && !isNaN(fixedCharge)) {
      const validConfig: StripeConfig = {
        processing_fee_percent: feePercent,
        fixed_charge: fixedCharge,
      };
      await AsyncStorage.setItem(STRIPE_CONFIG_STORAGE_KEY, JSON.stringify(validConfig));
      return validConfig;
    }
  } catch (error) {
    console.error('Error saving stripe config:', error);
  }
  return null;
};

export const getStripeConfig = async (): Promise<StripeConfig> => {
  try {
    const data = await AsyncStorage.getItem(STRIPE_CONFIG_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (typeof parsed?.processing_fee_percent === 'number' && typeof parsed?.fixed_charge === 'number') {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading stripe config:', error);
  }
  return DEFAULT_STRIPE_CONFIG;
};

export const calculateStripeFee = (
  amount: number,
  config: StripeConfig = DEFAULT_STRIPE_CONFIG
) => {
  const numAmount = Number(amount) || 0;
  if (numAmount <= 0) {
    return {
      baseAmount: 0,
      fee: 0,
      total: 0,
      feePercent: config.processing_fee_percent,
      fixedCharge: config.fixed_charge,
    };
  }
  const fee = (numAmount * (config.processing_fee_percent / 100)) + config.fixed_charge;
  const roundedFee = Math.round(fee * 100) / 100;
  const total = Math.round((numAmount + roundedFee) * 100) / 100;
  return {
    baseAmount: numAmount,
    fee: roundedFee,
    total,
    feePercent: config.processing_fee_percent,
    fixedCharge: config.fixed_charge,
  };
};

export const stripeApi = {
  /**
   * IMPORTANT: This is a frontend mock to hit the Stripe REST API directly.
   * IN PRODUCTION, this must be done on your backend server. Do not bundle your secret key!
   */
  createPaymentIntent: async (amount: number, currency: string = 'usd') => {
    try {
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: Math.round(amount * 100).toString(), // Stripe takes amount in cents
          currency: currency,
          'payment_method_types[]': 'card',
        }).toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create PaymentIntent');
      }

      return data.client_secret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }
};
