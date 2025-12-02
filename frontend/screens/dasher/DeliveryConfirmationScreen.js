import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function DeliveryConfirmationScreen({ route, navigation }) {
  const { orderId } = route.params || {};

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        Delivery complete
      </Text>
      <Text style={{ color: "gray", fontSize: 16, marginBottom: 24 }}>
        {orderId ? `Order #${orderId} has been marked delivered.` : "Order has been marked delivered."}
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: "#ffcc00",
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 10,
        }}
        onPress={() => navigation.replace("DasherActiveOrders")}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Back to Active Orders</Text>
      </TouchableOpacity>
    </View>
  );
}

