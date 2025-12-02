// frontend/SplashScreen.js
import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../colors";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const role = await AsyncStorage.getItem("is_dasher");
        const isDasher = role === "true";

        if (token) {
          navigation.replace(isDasher ? "DasherHome" : "Home");
        } else {
          navigation.replace("Login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigation.replace("Login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus DoorDash</Text>
      <ActivityIndicator size="large" color={COLORS.gold} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.black,
  },
  title: {
    color: COLORS.gold,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
});
