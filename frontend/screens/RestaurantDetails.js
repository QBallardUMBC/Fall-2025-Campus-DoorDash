import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";


import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView, 
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RestaurantDetails({ route, navigation }) {
  const { restaurant } = route.params;
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  const API_BASE = "http://10.200.70.88:8080"; // replace with your backend IP

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const response = await axios.get(`${API_BASE}/restaurants/${restaurant.id}/menu`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenuItems(response.data.menu || []);
      } catch (error) {
        console.error("Error fetching menu:", error);
        Alert.alert("Error", "Unable to load menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [restaurant.id]);

  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
    Alert.alert("Added to Cart", `${item.name} added to your order.`);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Add at least one item before checkout.");
      return;
    }
    navigation.navigate("Checkout", { restaurant, cart });
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItem}>
      <View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.restaurantName}>{restaurant.name}</Text>
      <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMenuItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.cartText}>Items in Cart: {cart.length}</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={proceedToCheckout}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  restaurantName: {
    color: "#FFD700",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  restaurantCuisine: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  menuItem: {
    backgroundColor: "#1C1C1C",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFD700",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDescription: {
    color: "#ccc",
    fontSize: 13,
    marginVertical: 3,
  },
  itemPrice: {
    color: "white",
    fontSize: 15,
  },
  addButton: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111",
    padding: 15,
    borderTopColor: "#FFD700",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartText: {
    color: "white",
    fontSize: 16,
  },
  checkoutButton: {
    backgroundColor: "#FFD700",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  checkoutText: {
    color: "black",
    fontWeight: "bold",
  },
});
