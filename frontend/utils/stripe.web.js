// frontend/utils/stripe.web.js
// This file is automatically used on web (Platform.OS === 'web')

import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export const getStripeModule = async () => {
  return {
    isWeb: true,
    Elements,
    loadStripe,
    useStripe,
    useElements,
  };
};