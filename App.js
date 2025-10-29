import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./frontend/screens/SplashScreen";
import LoginScreen from "./frontend/screens/LoginScreen";
import SignupScreen from "./frontend/screens/SignupScreen";
import HomeScreen from "./frontend/screens/HomeScreen";
import RestaurantDetails from "./frontend/screens/RestaurantDetails";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RestaurantDetails" component={RestaurantDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
