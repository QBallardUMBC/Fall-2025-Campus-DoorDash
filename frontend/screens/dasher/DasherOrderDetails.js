// frontend/screens/dasher/DasherOrderDetails.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../config";

export default function DasherOrderDetails({ route, navigation }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);

  const loadOrder = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const res = await axios.get(`${API_BASE}/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOrder(res.data.order);
  };

  const markDelivered = async () => {
    const token = await AsyncStorage.getItem("access_token");
    await axios.post(
      `${API_BASE}/api/orders/${id}/status`,
      { status: "delivered" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    navigation.navigate("DasherActiveOrders");
  };

  useEffect(() => {
    loadOrder();
  }, []);

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="yellow" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 20 }}>
      <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
        Delivery Details
      </Text>

      <Text style={{ color: "white", marginTop: 15 }}>
        Order #{order.order_id}
      </Text>

      <Text style={{ color: "white", marginTop: 10 }}>
        Restaurant: {order.restaurant_name}
      </Text>

      <Text style={{ color: "white", marginTop: 10, marginBottom: 20 }}>
        Customer Address: {order.delivery_address}
      </Text>

      <TouchableOpacity
        style={{
          padding: 15,
          backgroundColor: "#00cc44",
          borderRadius: 8,
        }}
        onPress={markDelivered}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Mark as Delivered</Text>
      </TouchableOpacity>
    </View>
  );
}
