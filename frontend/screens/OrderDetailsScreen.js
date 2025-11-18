import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { getOrderById } from "../api/orderAPI"; // You'll create this in orders.js
import moment from "moment";

const OrderDetailsScreen = () => {
  const route = useRoute();
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E23744" />
        <Text>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Order not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 🧾 Order Header */}
      <View style={styles.header}>
        <Text style={styles.orderId}>Order ID: {order.id}</Text>
        <Text style={styles.status}>Status: {order.status.toUpperCase()}</Text>
        <Text style={styles.date}>
          Placed on {moment(order.created_at).format("MMMM Do YYYY, h:mm a")}
        </Text>
      </View>

      {/* 🍔 Order Items */}
      <Text style={styles.sectionTitle}>Items</Text>
      <FlatList
        data={order.order_items}
        keyExtractor={(item, index) => `${item.food_id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.food_name}</Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          </View>
        )}
      />

      {/* 💵 Order Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Subtotal: ${order.subtotal.toFixed(2)}</Text>
        <Text style={styles.summaryText}>Delivery Fee: ${order.delivery_fee.toFixed(2)}</Text>
        <Text style={styles.summaryText}>Dasher Fee: ${order.dasher_fee.toFixed(2)}</Text>
        <Text style={styles.totalText}>Total: ${order.total.toFixed(2)}</Text>
      </View>

      {/* 📍 Delivery Info */}
      <View style={styles.deliveryBox}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <Text style={styles.address}>{order.delivery_address}</Text>
        {order.delivery_instructions && (
          <Text style={styles.instructions}>
            Note: {order.delivery_instructions}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingVertical: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginBottom: 15,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
  },
  status: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E23744",
    marginTop: 5,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemQty: {
    fontSize: 16,
    width: 40,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryBox: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  summaryText: {
    fontSize: 16,
    marginVertical: 3,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  deliveryBox: {
    marginTop: 20,
    marginBottom: 40,
  },
  address: {
    fontSize: 16,
  },
  instructions: {
    marginTop: 5,
    fontSize: 14,
    color: "#555",
  },
});

export default OrderDetailsScreen;
