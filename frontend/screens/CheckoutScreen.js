import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useCart } from "./CartContext";

export default function CheckoutScreen({ navigation }) {
  const { totalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    // TODO: Integrate Stripe here
    clearCart();
    navigation.replace("Confirmation");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.total}>Total: ${totalPrice.toFixed(2)}</Text>
      <TouchableOpacity style={styles.payButton} onPress={handleCheckout}>
        <Text style={styles.payText}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", padding: 16, justifyContent: "center" },
  title: { color: "yellow", fontSize: 24, textAlign: "center" },
  total: { color: "white", fontSize: 18, textAlign: "center", marginVertical: 10 },
  payButton: { backgroundColor: "yellow", padding: 15, borderRadius: 8 },
  payText: { color: "black", fontWeight: "bold", textAlign: "center" },
});
