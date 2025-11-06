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
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../config";

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch restaurants from backend
  const fetchRestaurants = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.warn("No token found");
        navigation.replace("Login");
        return;
      }

      console.log("ACCESS TOKEN:", token);

      const response = await axios.get(`${API_BASE}/api/restaurants`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("RESTAURANTS RESPONSE:", response.data);
      setRestaurants(response.data.restaurants || []); // Ensure array
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      Alert.alert("Error", "Failed to load restaurants");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Refresh control (pull-to-refresh)
  const onRefresh = () => {
    setRefreshing(true);
    fetchRestaurants();
  };

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("RestaurantDetails", { restaurant: item })}
    >
      <Image
        source={{
          uri:
            item.image_url ||
            "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=60", // fallback
        }}
        style={styles.image}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.restaurant_name}</Text>
        <Text style={styles.subtitle}>Tap to view menu</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus DoorDash - UMBC</Text>

      {loading ? (
        <ActivityIndicator size="large" color="yellow" style={{ marginTop: 30 }} />
      ) : restaurants.length === 0 ? (
        <Text style={styles.noData}>No restaurants available.</Text>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.restaurant_id}
          renderItem={renderRestaurant}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="yellow"
            />
          }
        />
      )}

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.removeItem("access_token");
          navigation.replace("Login");
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

//  Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    color: "yellow",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#fff",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 180,
  },
  cardInfo: {
    padding: 10,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    color: "gray",
    fontSize: 14,
    marginTop: 3,
  },
  noData: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "yellow",
    padding: 14,
    borderRadius: 8,
    marginVertical: 12,
  },
  logoutText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
});
