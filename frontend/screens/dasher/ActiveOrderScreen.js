// frontend/screens/dasher/ActiveOrdersScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getActiveDasherOrders } from "../../api/dasherAPI";

export default function ActiveOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadActive = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError("");
    try {
      const data = await getActiveDasherOrders();
      setOrders(data || []);
    } catch (err) {
      console.log("Error fetching active orders:", err);
      setError("Failed to load active orders. Pull to refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadActive(false);
  }, [loadActive]);

  useFocusEffect(
    useCallback(() => {
      loadActive(true);
    }, [loadActive])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadActive(true);
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
        Active Deliveries
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
              Status: {item.status?.toUpperCase() || "CONFIRMED"}
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
        ListEmptyComponent={
          <Text style={{ color: "gray", marginTop: 20, textAlign: "center" }}>
            You have no active deliveries right now.
          </Text>
        }
      />
    </View>
  );
}
