import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orderAPI";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../colors";

const ACCENT = COLORS.gold;

export default function CheckoutScreen({ navigation }) {
  const { cart, clearCart, totalPrice } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = totalPrice || 0;
  const restaurantId = cart[0]?.restaurant_id || null;

  const handlePayment = async () => {
    if (!stripe || !elements) {
      setError("Stripe not loaded");
      return;
    }

    setLoading(true);

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

      const card = elements.getElement(CardElement);

      const { error: stripeErr, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card },
        });

      if (stripeErr) throw stripeErr;

      if (paymentIntent?.status === "succeeded") {
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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.black,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          backgroundColor: COLORS.darkCard,
          borderRadius: 20,
          padding: 24,
          border: `1px solid ${COLORS.border}`,
          boxShadow: `0 12px 24px rgba(255, 204, 0, 0.25)`,
        }}
      >
        <h1
          style={{
            color: ACCENT,
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Checkout
        </h1>

        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              color: COLORS.white,
              fontSize: 18,
              marginBottom: 8,
            }}
          >
            Order Summary
          </h3>
          {cart.map((item) => (
            <p
              key={item.food_id}
              style={{ color: COLORS.gray, margin: "4px 0" }}
            >
              {item.food_name} ×{item.quantity} — $
              {(item.price * item.quantity).toFixed(2)}
            </p>
          ))}
          <h2
            style={{
              color: ACCENT,
              fontSize: 20,
              marginTop: 10,
            }}
          >
            Total: ${total.toFixed(2)}
          </h2>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.input,
          }}
        >
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: COLORS.white,
                  "::placeholder": { color: COLORS.gray },
                },
              },
            }}
          />
        </div>

        {error && (
          <p style={{ color: "#D32F2F", marginTop: 12 }}>{error}</p>
        )}

        <button
          disabled={loading}
          onClick={handlePayment}
          style={{
            width: "100%",
            marginTop: 20,
            backgroundColor: ACCENT,
            padding: "12px 0",
            borderRadius: 14,
            border: "none",
            color: COLORS.black,
            fontWeight: 700,
            fontSize: 16,
            boxShadow: "0 8px 16px rgba(255, 204, 0, 0.35)",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
        </button>

        <button
          onClick={() => navigation.goBack()}
          style={{
            width: "100%",
            marginTop: 12,
            backgroundColor: "transparent",
            padding: "10px 0",
            borderRadius: 10,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.gray,
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
