// frontend/screens/dasher/ActiveOrdersScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../config";

export default function ActiveOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActive = async () => {
    const token = await AsyncStorage.getItem("access_token");
    try {
      const res = await axios.get(`${API_BASE}/api/dashers/orders/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("Error fetching active orders:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadActive();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="yellow" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 20 }}>
      <Text style={{ color: "white", fontSize: 26, marginBottom: 15 }}>
        Active Deliveries
      </Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              backgroundColor: "#222",
              borderRadius: 8,
              marginBottom: 15,
            }}
          >
            <Text style={{ color: "white", fontSize: 18 }}>
              Order #{item.order_id}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: "#0099ff",
                padding: 10,
                borderRadius: 6,
                marginTop: 10,
              }}
              onPress={() =>
                navigation.navigate("DasherOrderDetails", {
                  id: item.order_id,
                })
              }
            >
              <Text style={{ fontWeight: "bold" }}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
