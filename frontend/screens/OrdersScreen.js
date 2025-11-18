import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { getCustomerOrders } from "../api/orderAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = await AsyncStorage.getItem("user_id");
      const data = await getCustomerOrders(userId);
      setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <ActivityIndicator color="yellow" size="large" />;

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 16 }}>
      <Text style={{ color: "yellow", fontSize: 22, textAlign: "center", marginBottom: 10 }}>
        My Orders
      </Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
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
            <Text style={{ color: "white", fontSize: 18 }}>{item.status.toUpperCase()}</Text>
            <Text style={{ color: "gray" }}>{item.delivery_address}</Text>
            <Text style={{ color: "yellow" }}>Total: ${item.total.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
