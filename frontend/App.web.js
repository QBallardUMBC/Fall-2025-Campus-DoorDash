// App.web.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { CartProvider } from "./context/CartContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { publishableKey } from "./config";

// AUTH SCREENS
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";

// CUSTOMER SCREENS
import HomeScreen from "./screens/HomeScreen";
import RestaurantDetails from "./screens/RestaurantDetails";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen.web";
import OrdersScreen from "./screens/OrdersScreen";
import OrderDetailsScreen from "./screens/OrderDetailsScreen";

// DASHER SCREENS (web versions)
import DasherHomeScreen from "./screens/dasher/DasherHomeScreen";
import AvailableOrdersScreen from "./screens/dasher/AvailableOrdersScreen";
import ActiveOrderScreen from "./screens/dasher/ActiveOrderScreen";
import DasherOrderDetails from "./screens/dasher/DasherOrderDetails";

const Stack = createNativeStackNavigator();
const stripePromise = loadStripe(publishableKey);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isDasher, setIsDasher] = useState(false);
  const [token, setToken] = useState(null);

  // Load stored user info to route correctly
  useEffect(() => {
    async function loadUser() {
      const savedToken = await AsyncStorage.getItem("access_token");
      const savedRole = await AsyncStorage.getItem("is_dasher");
      setToken(savedToken);
      setIsDasher(savedRole === "true");
      setLoading(false);
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <CartProvider>
      <Elements stripe={stripePromise}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* If not logged in, go to auth flow */}
        {!token ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : isDasher ? (
          // === DASHER FLOW ===
          <>
            <Stack.Screen name="DasherHome" component={DasherHomeScreen} />
            <Stack.Screen
              name="DasherAvailableOrders"
              component={AvailableOrdersScreen}
            />
            <Stack.Screen
              name="DasherActiveOrder"
              component={ActiveOrderScreen}
            />
            <Stack.Screen
              name="DasherOrderDetails"
              component={DasherOrderDetails}
            />
          </>
          ) : (
            // === CUSTOMER FLOW ===
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="RestaurantDetails"
                component={RestaurantDetails}
              />
              <Stack.Screen name="Cart" component={CartScreen} />
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
      </Elements>
    </CartProvider>
  );
}
