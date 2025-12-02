import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useCart } from "../context/CartContext";
import { COLORS } from "../colors";

const ACCENT = COLORS.gold;

export default function CartScreen({ navigation }) {
  const { cart, totalPrice, removeFromCart } = useCart();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Your Cart</Text>

      {cart.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.food_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <View style={styles.itemLeft}>
                  <Text style={styles.name}>{item.food_name}</Text>
                  <Text style={styles.qty}>Qty: {item.quantity}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.price}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.food_id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <Text style={styles.total}>
            Total: ${totalPrice.toFixed(2)}
          </Text>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate("Checkout")}
            activeOpacity={0.9}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    padding: 16,
  },
  title: {
    color: ACCENT,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  itemLeft: {
    flex: 1,
  },
  itemRight: {
    alignItems: "flex-end",
  },
  name: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  qty: {
    color: COLORS.gray,
    marginTop: 4,
  },
  price: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: "700",
  },
  removeButton: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  removeText: {
    color: "#D32F2F",
    fontSize: 12,
    fontWeight: "600",
  },
  total: {
    color: ACCENT,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 16,
  },
  checkoutButton: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutText: {
    color: COLORS.black,
    fontWeight: "700",
    fontSize: 16,
  },
  empty: {
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
