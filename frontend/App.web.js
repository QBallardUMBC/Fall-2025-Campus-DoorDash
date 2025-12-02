// frontend/App.web.js
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import CartScreen from "./screens/CartScreen";
import RestaurantDetails from "./screens/RestaurantDetails";
import CheckoutScreen from "./screens/CheckoutScreen.web";
import OrdersScreen from "./screens/OrdersScreen";
import OrderDetailsScreen from "./screens/OrderDetailsScreen";

import DasherHomeScreen from "./screens/dasher/DasherHomeScreen";
import AvailableOrdersScreen from "./screens/dasher/AvailableOrdersScreen";
import ActiveOrdersScreen from "./screens/dasher/ActiveOrderScreen";
import DasherOrderDetails from "./screens/dasher/DasherOrderDetails";
import DeliveryConfirmationScreen from "./screens/dasher/DeliveryConfirmationScreen";

import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { publishableKey } from "./config";

const Stack = createNativeStackNavigator();
const stripePromise = loadStripe(publishableKey);

function RootNavigator() {
  const { token, isDasher, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#FFCC00" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : isDasher ? (
          <>
            <Stack.Screen name="DasherHome" component={DasherHomeScreen} />
            <Stack.Screen
              name="DasherAvailableOrders"
              component={AvailableOrdersScreen}
            />
            <Stack.Screen
              name="DasherActiveOrders"
              component={ActiveOrdersScreen}
            />
            <Stack.Screen
              name="DasherOrderDetails"
              component={DasherOrderDetails}
            />
            <Stack.Screen
              name="DasherDeliveryConfirmation"
              component={DeliveryConfirmationScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen
              name="RestaurantDetails"
              component={RestaurantDetails}
            />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Elements stripe={stripePromise}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </Elements>
    </CartProvider>
  );
}
