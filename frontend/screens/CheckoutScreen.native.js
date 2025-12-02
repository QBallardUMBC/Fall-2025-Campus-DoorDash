import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orderAPI";
import { useStripe } from "@stripe/stripe-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../colors";

const ACCENT = COLORS.gold;

export default function CheckoutScreen({ navigation }) {
  const { cart, clearCart, totalPrice } = useCart();
  const stripe = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const total = totalPrice || 0;
  const restaurantId = cart[0]?.restaurant_id || null;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = await AsyncStorage.getItem("user_id");
      const orderData = {
        customer_id: userId,
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
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Checkout</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={handlePayment}
            disabled={loading}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.black} />
            ) : (
              <Text style={styles.buttonText}>Pay ${total.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.black,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: ACCENT,
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  total: {
    fontSize: 22,
    color: ACCENT,
    fontWeight: "700",
    marginBottom: 16,
  },
  error: { color: "#D32F2F", marginBottom: 20 },
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: "700",
  },
  back: {
    marginTop: 20,
    color: COLORS.gray,
    fontSize: 16,
    textAlign: "center",
  },
});
