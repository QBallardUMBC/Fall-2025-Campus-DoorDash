import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://10.200.70.88:8080";
 // <-- replace with your local IP address

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const response = await axios.get(`${API_BASE}/restaurants`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRestaurants(response.data.restaurants || []);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    navigation.replace("Login");
  };

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate("RestaurantDetails", { restaurant: item })}
    >
      <Text style={styles.restaurantName}>{item.name}</Text>
      <Text style={styles.restaurantInfo}>{item.cuisine}</Text>
      <Text style={styles.restaurantInfo}>{item.location}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Campus DoorDash - UMBC</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRestaurant}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  header: {
    color: "#FFD700",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  restaurantCard: {
    backgroundColor: "#1C1C1C",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  restaurantName: {
    color: "#FFD700",
    fontSize: 20,
    fontWeight: "bold",
  },
  restaurantInfo: {
    color: "white",
    fontSize: 14,
  },
  logoutButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#FFD700",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  logoutText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
});
