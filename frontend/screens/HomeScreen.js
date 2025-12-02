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
import { COLORS } from "../colors";
import { useAuth } from "../context/AuthContext";

const ACCENT = COLORS.gold;

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const numColumns = width > 900 ? 3 : 2; // 3 on desktop, 2 on mobile/tablet
  const CARD_SIZE = width / numColumns - 24;

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const { logout } = useAuth();

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
        <ActivityIndicator size="large" color={ACCENT} />
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
        onPress={logout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    paddingTop: 50,
    paddingHorizontal: 12,
  },
  title: {
    color: ACCENT,
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 18,
    margin: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
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
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  noData: {
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  logoutText: {
    textAlign: "center",
    fontWeight: "700",
    color: COLORS.black,
  },
});
