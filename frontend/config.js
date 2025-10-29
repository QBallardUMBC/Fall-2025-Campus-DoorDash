// config.js
import { Platform } from "react-native";

const LOCALHOST = "http://localhost:8080";
const ANDROID_LOCAL = "http://10.0.2.2:8080"; // for Android emulator

export const API_BASE =
  Platform.OS === "android" ? ANDROID_LOCAL : LOCALHOST;
