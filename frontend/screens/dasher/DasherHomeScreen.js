// frontend/screens/dasher/DasherHomeScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function DasherHomeScreen({ navigation, setToken, setIsDasher }) {
  const [dasherEmail, setDasherEmail] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const stored = await AsyncStorage.getItem("user_email");
      setDasherEmail(stored);
    };
    loadProfile();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 20 }}>
      <Text style={{ color: "white", fontSize: 32, fontWeight: "bold", marginBottom: 10 }}>
        Dasher Dashboard
      </Text>

      <Text style={{ color: "white", marginBottom: 30 }}>
        Logged in as: {dasherEmail || "Loading..."}
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: "#ffcc00",
          padding: 15,
          borderRadius: 8,
          marginBottom: 15,
        }}
        onPress={() => navigation.navigate("DasherAvailableOrders")}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>View Available Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#ffa500",
          padding: 15,
          borderRadius: 8,
        }}
        onPress={() => navigation.navigate("DasherActiveOrders")}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>View Active Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "yellow",
          padding: 12,
          borderRadius: 8,
          marginTop: 20,
        }}
        onPress={async () => {
          await AsyncStorage.multiRemove([
            "access_token",
            "refresh_token",
            "is_dasher",
            "user_email",
          ]);
          setToken(null);
          setIsDasher(false);
          navigation.replace("Login");
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
