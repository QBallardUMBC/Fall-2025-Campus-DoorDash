import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
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
      console.error("Fetch error:", error.response?.data || error.message);
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="yellow" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Campus DoorDash - UMBC</Text>

      {restaurants.length === 0 ? (
        <Text style={styles.noData}>No restaurants available.</Text>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.restaurant_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("RestaurantDetails", { restaurant: item })
              }
            >
              <Image
                source={{
                  uri:
                    item.image_url ||
                    "https://via.placeholder.com/300x200.png?text=Restaurant",
                }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.restaurant_name}</Text>
                <Text style={styles.desc}>
                  {item.description || "Delicious meals available"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  header: {
    color: "yellow",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
  },
  info: {
    padding: 12,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  desc: {
    color: "#aaa",
    marginTop: 5,
  },
  noData: {
    color: "#888",
    textAlign: "center",
    marginTop: 30,
  },
  logoutButton: {
    backgroundColor: "yellow",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  logoutText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
