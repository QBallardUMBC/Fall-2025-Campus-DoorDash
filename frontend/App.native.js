// App.native.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { CartProvider } from "./context/CartContext";

// AUTH SCREENS
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";

// CUSTOMER SCREENS
import HomeScreen from "./screens/HomeScreen";
import RestaurantDetails from "./screens/RestaurantDetails";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen.native";
import OrdersScreen from "./screens/OrdersScreen";
import OrderDetailsScreen from "./screens/OrderDetailsScreen";

// DASHER SCREENS (native)
import DasherHomeScreen from "./screens/dasher/DasherHomeScreen";
import AvailableOrdersScreen from "./screens/dasher/AvailableOrdersScreen";
import ActiveOrderScreen from "./screens/dasher/ActiveOrderScreen";
import DasherOrderDetails from "./screens/dasher/DasherOrderDetails";

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isDasher, setIsDasher] = useState(false);
  const [token, setToken] = useState(null);

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
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* Auth */}
        {!token ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  setToken={setToken}
                  setIsDasher={setIsDasher}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : isDasher ? (
          // Dasher flow
          <>
            <Stack.Screen name="DasherHome">
              {(props) => (
                <DasherHomeScreen
                  {...props}
                  setToken={setToken}
                  setIsDasher={setIsDasher}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="DasherAvailableOrders" component={AvailableOrdersScreen} />
            <Stack.Screen name="DasherActiveOrder" component={ActiveOrderScreen} />
            <Stack.Screen name="DasherOrderDetails" component={DasherOrderDetails} />
          </>
        ) : (
          // Customer flow
          <>
            <Stack.Screen name="Home">
              {(props) => (
                <HomeScreen
                  {...props}
                  setToken={setToken}
                  setIsDasher={setIsDasher}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="RestaurantDetails" component={RestaurantDetails} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
          </>
        )}

        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
