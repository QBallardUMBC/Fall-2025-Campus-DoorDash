// frontend/screens/dasher/DasherOrderDetails.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { getOrderById } from "../../api/orderAPI";
import { completeDasherOrder } from "../../api/dasherAPI";

export default function DasherOrderDetails({ route, navigation }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOrderById(id);
      // backend sometimes returns wrapped object or bare order
      const payload = res.order || res;
      setOrder(payload);
    } catch (err) {
      console.log("Error fetching order details:", err);
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const markDelivered = async () => {
    if (!order) return;
    setSubmitting(true);
    setError("");
    try {
      await completeDasherOrder(id);
      navigation.replace("DasherDeliveryConfirmation", { orderId: id });
    } catch (err) {
      console.log("Error marking order delivered:", err);
      setError("Could not complete order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="yellow" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center", padding: 20 }}>
        <Text style={{ color: "tomato", textAlign: "center" }}>
          {error || "Order not found."}
        </Text>
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
        Restaurant: {order.restaurant_name || "Unknown"}
      </Text>

      <Text style={{ color: "white", marginTop: 10, marginBottom: 20 }}>
        Customer Address: {order.delivery_address || "N/A"}
      </Text>

      {error ? (
        <Text style={{ color: "tomato", marginBottom: 10 }}>{error}</Text>
      ) : null}

      <TouchableOpacity
        style={{
          padding: 15,
          backgroundColor: submitting ? "#228B22" : "#00cc44",
          borderRadius: 8,
          opacity: submitting ? 0.7 : 1,
        }}
        onPress={markDelivered}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>Mark as Delivered</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
