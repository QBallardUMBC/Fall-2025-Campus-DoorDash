import React, { useEffect, useState } from "react";
import {
  useWindowDimensions,
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
import { restaurantImages } from "../assets/images/restaurantImages";

export default function HomeScreen({ navigation, setToken, setIsDasher }) {
  const { width } = useWindowDimensions();
  const numColumns = width > 900 ? 3 : 2; // 3 on desktop, 2 on mobile/tablet
  const CARD_SIZE = width / numColumns - 24;

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      console.log("ACCESS TOKEN:", token);

      const response = await axios.get(`${API_BASE}/api/restaurants`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Restaurants returned from backend:", response.data.restaurants.map(r => r.restaurant_name));
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      Alert.alert("Error", "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { width: CARD_SIZE, height: CARD_SIZE * 0.85 }]}
      onPress={() =>
        navigation.navigate("RestaurantDetails", { restaurant: item })
      }
    >
      <Image
        source={{
          uri:
            restaurantImages[item.restaurant_name] ||
            "https://images.unsplash.com/photo-1555992336-03a23c8b1f88?auto=format&fit=crop&w=800&q=60",
        }}
        style={styles.image}
      />
      <View style={styles.cardBottom}>
        <Text style={styles.name} numberOfLines={1}>
          {item.restaurant_name}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
          keyExtractor={(item) => item.restaurant_id}
          renderItem={renderRestaurant}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.multiRemove([
            "access_token",
            "refresh_token",
            "is_dasher",
            "user_email",
          ]);
          setToken(null);
          setIsDasher(false);
          navigation.replace("Login");
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  title: {
    color: "yellow",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    margin: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "75%",
    resizeMode: "cover",
  },
  cardBottom: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  noData: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: "yellow",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  logoutText: {
    textAlign: "center",
    fontWeight: "bold",
  },
});
