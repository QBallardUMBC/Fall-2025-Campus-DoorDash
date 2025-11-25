// config.js
import { Platform } from "react-native";

const LOCALHOST = "http://localhost:8080";
const ANDROID_LOCAL = "http://10.0.2.2:8080"; // for Android emulator

export const API_BASE =
  Platform.OS === "android" ? ANDROID_LOCAL : LOCALHOST;

// Stripe publishable key (web)
// Support both naming styles so env mismatch doesn't break things.
export const publishableKey =
  process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY ||
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "";
