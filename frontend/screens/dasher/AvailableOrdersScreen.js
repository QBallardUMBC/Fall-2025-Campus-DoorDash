// frontend/screens/dasher/AvailableOrdersScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  getAvailableDasherOrders,
  acceptDasherOrder,
} from "../../api/dasherAPI";

export default function AvailableOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError("");
    try {
      const data = await getAvailableDasherOrders();
      setOrders(data || []);
    } catch (err) {
      console.log("Error fetching available orders:", err);
      setError("Failed to load available orders. Pull to refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(false);
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders(true);
  };

  const handleAccept = async (orderId) => {
    // optimistic update
    const previous = orders;
    setOrders((current) => current.filter((o) => o.order_id !== orderId));
    try {
      await acceptDasherOrder(orderId);
      navigation.navigate("DasherActiveOrders");
    } catch (err) {
      console.log("Error accepting order:", err);
      setError("Could not accept order. Please try again.");
      setOrders(previous);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="yellow" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 20 }}>
      <Text style={{ color: "white", fontSize: 26, marginBottom: 8 }}>
        Available Orders
      </Text>
      {error ? (
        <Text style={{ color: "tomato", marginBottom: 8 }}>{error}</Text>
      ) : null}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="yellow"
          />
        }
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
            <Text style={{ color: "white", marginTop: 4 }}>
              Restaurant: {item.restaurant_name || "Unknown"}
            </Text>
            <Text style={{ color: "gray", marginTop: 4 }}>
              Status: {item.status?.toUpperCase() || "PENDING"}
            </Text>

            <TouchableOpacity
              onPress={() => handleAccept(item.order_id)}
              style={{
                backgroundColor: "#00cc44",
                padding: 10,
                borderRadius: 6,
                marginTop: 10,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Accept Order</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "gray", marginTop: 20, textAlign: "center" }}>
            No available orders right now.
          </Text>
        }
      />
    </View>
  );
}
