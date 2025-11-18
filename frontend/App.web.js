import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import RestaurantDetails from "./screens/RestaurantDetails";
import CheckoutScreen from "./screens/CheckoutScreen.web";   // Web version
import CartScreen from "./screens/CartScreen";
import OrderDetailsScreen from "./screens/OrderDetailsScreen";
import OrdersScreen from "./screens/OrdersScreen";
import ConfirmationScreen from "./screens/ConfirmationScreen";

import { CartProvider } from "./context/CartContext";

// Load Stripe publishable key from env
// Must match EXPO_PUBLIC_STRIPE_PUBLIC_KEY in frontend/.env
const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY;
console.log("[Stripe][web] publishableKey:", publishableKey);

// Stripe for web ONLY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <StackNavigator />
          </Elements>
        ) : (
          <StackNavigator />
        )}
      </NavigationContainer>
    </CartProvider>
  );
}

function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RestaurantDetails" component={RestaurantDetails} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
    </Stack.Navigator>
  );
}
