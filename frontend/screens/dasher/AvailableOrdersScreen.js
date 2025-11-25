// frontend/screens/dasher/AvailableOrdersScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../config";

export default function AvailableOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const token = await AsyncStorage.getItem("access_token");
    try {
      const res = await axios.get(`${API_BASE}/api/dashers/orders/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log("Error fetching available orders:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const acceptOrder = async (orderId) => {
    const token = await AsyncStorage.getItem("access_token");
    try {
      await axios.post(
        `${API_BASE}/api/dashers/orders/accept/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.navigate("DasherActiveOrders");
    } catch (err) {
      console.log("Error accepting order:", err.response?.data || err);
    }
  };

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
        Available Orders
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
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
              Order #{item.order_id}
            </Text>
            <Text style={{ color: "white", marginBottom: 10 }}>
              Restaurant: {item.restaurant_name}
            </Text>

            <TouchableOpacity
              onPress={() => acceptOrder(item.order_id)}
              style={{
                backgroundColor: "#00cc44",
                padding: 10,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Accept Order</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
