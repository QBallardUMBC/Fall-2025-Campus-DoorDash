import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orderAPI";
import { useStripe } from "@stripe/stripe-react-native";

export default function CheckoutScreen({ navigation }) {
  const { cart, clearCart, totalPrice } = useCart();
  const stripe = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = totalPrice || 0;
  const restaurantId = cart[0]?.restaurant_id || null;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderData = {
        customer_id: "CUSTOMER_ID",
        restaurant_id: restaurantId,
        order_items: cart.map((i) => ({
          food_id: i.food_id,
          quantity: i.quantity,
          price: i.price,
          food_name: i.food_name,
        })),
        delivery_address: "123 Campus Dr",
        delivery_instructions: "Leave at door",
      };

      const res = await createOrder(orderData);
      const clientSecret = res.client_secret;

      const { error: stripeErr, paymentIntent } =
        await stripe.confirmPayment(clientSecret, {
          paymentMethodType: "Card",
        });

      if (stripeErr) throw stripeErr;

      if (paymentIntent) {
        alert("Payment successful!");
        clearCart();
        navigation.navigate("Orders");
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Payment failed";
      setError(message);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pay ${total.toFixed(2)}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  total: { fontSize: 22, marginBottom: 20 },
  error: { color: "red", marginBottom: 20 },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18 },
  back: { marginTop: 20, color: "#007AFF", fontSize: 16 },
});
