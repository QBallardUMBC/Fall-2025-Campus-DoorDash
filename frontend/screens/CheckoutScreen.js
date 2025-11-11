import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { CartContext } from "../context/CartContext";
import { createOrder } from "../api/orders";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CheckoutScreen({ navigation }) {
  const { cartItems, clearCart, restaurant } = useContext(CartContext);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      const userId = await AsyncStorage.getItem("user_id"); // store this at login

      const orderItems = cartItems.map((item) => ({
        food_id: item.id,
        quantity: item.quantity,
        price: item.price,
        food_name: item.name,
      }));

      const orderData = {
        customer_id: userId,
        restaurant_id: restaurant.id,
        order_items: orderItems,
        delivery_address: "UMBC Commons, Baltimore, MD",
        delivery_instructions: "Leave at counter",
      };

      const result = await createOrder(orderData);
      console.log("ORDER CREATED:", result);

      Alert.alert("Success", "Your order was placed successfully!");
      clearCart();
      navigation.navigate("Orders");
    } catch (error) {
      Alert.alert("Error", "Could not place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ color: "white", fontSize: 22, marginBottom: 10 }}>
        Checkout
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="yellow" />
      ) : (
        <TouchableOpacity
          style={{ backgroundColor: "yellow", padding: 15, borderRadius: 10 }}
          onPress={handlePlaceOrder}
        >
          <Text style={{ textAlign: "center", fontWeight: "bold" }}>
            Place Order
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
