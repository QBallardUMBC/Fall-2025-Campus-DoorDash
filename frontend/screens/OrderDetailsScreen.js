import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { getOrderById } from "../api/orderAPI";
import moment from "moment";
import { COLORS, STATUS_COLORS } from "../colors";

const OrderDetailsScreen = () => {
  const route = useRoute();
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, fadeAnim]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Order not found.</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]}>
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
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    paddingHorizontal: 15,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.black,
  },
  loadingText: {
    color: COLORS.gray,
    marginTop: 8,
  },
  errorText: {
    color: "#D32F2F",
  },
  header: {
    paddingVertical: 10,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    marginBottom: 15,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  status: {
    fontSize: 16,
    fontWeight: "700",
    color: STATUS_COLORS.pending,
    marginTop: 5,
  },
  date: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
    color: COLORS.white,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemName: {
    fontSize: 16,
    color: COLORS.white,
    flex: 1,
  },
  itemQty: {
    fontSize: 16,
    color: COLORS.gray,
    width: 40,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gold,
  },
  summaryBox: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryText: {
    fontSize: 16,
    color: COLORS.gray,
    marginVertical: 3,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    color: COLORS.gold,
  },
  deliveryBox: {
    marginTop: 20,
    marginBottom: 40,
  },
  address: {
    fontSize: 16,
    color: COLORS.white,
  },
  instructions: {
    marginTop: 5,
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default OrderDetailsScreen;
