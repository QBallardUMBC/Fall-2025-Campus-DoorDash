import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orderAPI";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

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
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>Checkout</h1>

      <div>
        <h3>Order Summary</h3>
        {cart.map((item) => (
          <p key={item.food_id}>
            {item.food_name} ×{item.quantity} — $
            {(item.price * item.quantity).toFixed(2)}
          </p>
        ))}
        <h2>Total: ${total.toFixed(2)}</h2>
      </div>

      <div style={{ marginTop: 20 }}>
        <CardElement />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button disabled={loading} onClick={handlePayment}>
        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>

      <button onClick={() => navigation.goBack()}>Back</button>
    </div>
  );
}
