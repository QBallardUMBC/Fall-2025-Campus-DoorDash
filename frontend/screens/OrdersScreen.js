import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { getOrderHistory } from "../api/orderAPI";

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError("");
    try {
      const data = await getOrderHistory();
      setOrders(data || []);
    } catch (err) {
      console.log("Error fetching order history:", err);
      setError("Failed to load order history. Pull to refresh.");
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

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}>
        <ActivityIndicator color="yellow" size="large" />
      </View>
    );
  }

  const renderStatusBadge = (status) => {
    const normalized = (status || "").toLowerCase();
    let color = "#4B5563";
    if (normalized === "pending") color = "#F59E0B";
    else if (normalized === "confirmed" || normalized === "preparing") color = "#3B82F6";
    else if (normalized === "delivered") color = "#10B981";
    else if (normalized === "cancelled") color = "#EF4444";

    return (
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: color,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 999,
          marginBottom: 4,
        }}
      >
        <Text style={{ color: "black", fontSize: 11, fontWeight: "700" }}>
          {(status || "UNKNOWN").toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 16 }}>
      <Text
        style={{
          color: "yellow",
          fontSize: 22,
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        My Orders
      </Text>
      {error ? (
        <Text style={{ color: "tomato", textAlign: "center", marginBottom: 8 }}>
          {error}
        </Text>
      ) : null}

      <FlatList
        data={orders}
        keyExtractor={(item, index) => item.order_id || item.id || String(index)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="yellow"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: "#222",
              padding: 16,
              marginVertical: 8,
              borderRadius: 10,
            }}
            onPress={() => navigation.navigate("OrderDetails", { order: item })}
          >
            {renderStatusBadge(item.status)}
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              {item.restaurant_name || "Restaurant"}
            </Text>
            <Text style={{ color: "gray", marginTop: 4 }}>
              {item.delivery_address || "Delivery address unavailable"}
            </Text>
            <Text style={{ color: "gray", marginTop: 4, fontSize: 12 }}>
              Placed:{" "}
              {item.created_at ||
                item.order_time ||
                new Date().toLocaleString()}
            </Text>
            {item.total != null && (
              <Text style={{ color: "yellow", marginTop: 6, fontWeight: "600" }}>
                Total: $
                {typeof item.total === "number"
                  ? item.total.toFixed(2)
                  : item.total}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ color: "gray", marginTop: 20, textAlign: "center" }}>
            You have not placed any orders yet.
          </Text>
        }
      />
    </View>
  );
}
