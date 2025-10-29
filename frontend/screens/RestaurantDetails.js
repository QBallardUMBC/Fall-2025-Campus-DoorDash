import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../config";
import { useCart } from "./CartContext";

export default function RestaurantDetails({ route, navigation }) {
  const { restaurant } = route.params;
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchMenu = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.warn("Missing token");
        return;
      }

      console.log("Fetching menu for:", restaurant.restaurant_name);
      const response = await axios.get(
        `${API_BASE}/api/restaurants/${restaurant.restaurant_id}/menu`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("MENU RESPONSE:", response.data);
      setMenu(response.data.menu || []);
    } catch (error) {
      console.error("Error fetching menu:", error);
      Alert.alert("Error", "Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuCard}>
      <Image
        source={{
          uri:
            item.image_url ||
            "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=60",
        }}
        style={styles.menuImage}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.foodName}>{item.food_name}</Text>
        <Text style={styles.price}>
          ${item.price ? item.price.toFixed(2) : "N/A"}
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addToCart(item)}
        >
          <Text style={styles.addText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              restaurant.image_url ||
              "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=60",
          }}
          style={styles.banner}
        />
        <Text style={styles.title}>{restaurant.restaurant_name}</Text>
        <Text style={styles.subtitle}>Menu & Specials</Text>
      </View>

      {/* Menu */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="yellow"
          style={{ marginTop: 30 }}
        />
      ) : menu.length === 0 ? (
        <Text style={styles.noMenu}>No menu items available.</Text>
      ) : (
        <FlatList
          data={menu}
          keyExtractor={(item) => item.food_id.toString()}
          renderItem={renderMenuItem}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}

      {/* View Cart Button */}
      <TouchableOpacity
        style={styles.viewCartButton}
        onPress={() => navigation.navigate("Cart")}
      >
        <Text style={styles.viewCartText}>View Cart 🛒</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    alignItems: "center",
    paddingBottom: 20,
  },
  banner: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  title: {
    color: "yellow",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  subtitle: {
    color: "gray",
    fontSize: 16,
    marginTop: 4,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  foodName: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  price: {
    color: "yellow",
    fontSize: 16,
    marginTop: 5,
  },
  addButton: {
    backgroundColor: "yellow",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  addText: {
    fontWeight: "bold",
    color: "black",
  },
  noMenu: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  viewCartButton: {
    backgroundColor: "yellow",
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  viewCartText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});
