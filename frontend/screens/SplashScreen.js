// frontend/SplashScreen.js
import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");

        if (token) {
          console.log("Existing token found. Auto-login...");
          navigation.replace("Home"); // redirect to Home
        } else {
          navigation.replace("Login"); // no token → go to Login
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
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  title: {
    color: "#FFD700",
    fontSize: 24,
    marginBottom: 20,
  },
});
