import Constants from "expo-constants";

const expoExtra = Constants?.expoConfig?.extra ?? {};
const API_BASE =
  expoExtra.API_BASE ??
  process.env.EXPO_PUBLIC_API_BASE ??
  process.env.API_BASE ??
  "http://localhost:8080";

export default {
  API_BASE,
};
