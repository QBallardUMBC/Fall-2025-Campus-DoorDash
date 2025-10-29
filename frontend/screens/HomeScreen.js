import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../config";

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        Alert.alert("Unauthorized", "Please log in first.");
        navigation.navigate("Login");
        return;
      }

      const response = await axios.get(`${API_BASE}/api/restaurants`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRestaurants(response.data);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error.response?.data || error.message);
      Alert.alert("Error", "Could not load restaurants. Try logging in again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("access_token");
    navigation.navigate("Login");
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="yellow" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus DoorDash - UMBC</Text>

      {restaurants.length === 0 ? (
        <Text style={styles.noData}>No restaurants available.</Text>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("RestaurantDetails", { restaurant: item })
              }
            >
              <Text style={styles.restaurantName}>{item.name}</Text>
              <Text style={styles.restaurantDesc}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  title: {
    color: "yellow",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  restaurantName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  restaurantDesc: {
    color: "#aaa",
    marginTop: 5,
  },
  noData: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: "yellow",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
