const STRIPE_SECRET_KEY = process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY || 'your_secret_key_here';

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
