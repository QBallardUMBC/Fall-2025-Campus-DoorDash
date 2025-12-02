// frontend/screens/dasher/DasherHomeScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../colors";

const ACCENT = COLORS.gold;

export default function DasherHomeScreen({ navigation }) {
  const [dasherEmail, setDasherEmail] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      const stored = await AsyncStorage.getItem("user_email");
      setDasherEmail(stored);
    };
    loadProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Dasher Dashboard</Text>

      <Text style={styles.subheading}>
        Logged in as: {dasherEmail || "Loading..."}
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("DasherAvailableOrders")}
        activeOpacity={0.9}
      >
        <Text style={styles.primaryButtonText}>View Available Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("DasherActiveOrders")}
        activeOpacity={0.9}
      >
        <Text style={styles.secondaryButtonText}>View Active Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        activeOpacity={0.9}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    padding: 24,
  },
  heading: {
    color: ACCENT,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  subheading: {
    color: COLORS.gray,
    marginBottom: 28,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: COLORS.darkCard,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: "auto",
  },
  logoutText: {
    color: COLORS.black,
    fontWeight: "700",
    fontSize: 16,
  },
});
