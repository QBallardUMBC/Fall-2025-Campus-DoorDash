// frontend/utils/stripe.native.js
// This file is automatically used on iOS/Android (Platform.OS === 'ios' or 'android')
// Metro bundler will use this file instead of stripe.web.js on native platforms

import { StripeProvider, useStripe } from "@stripe/stripe-react-native";

export const getStripeModule = async () => {
  return {
    isWeb: false,
    StripeProvider,
    useStripe,
  };
};