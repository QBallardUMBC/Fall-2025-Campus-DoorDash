import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useCart } from "./CartContext";


export default function CartScreen({ navigation }) {
  const { cart, totalPrice, removeFromCart, clearCart } = useCart();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      {cart.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.food_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.name}>{item.food_name}</Text>
                <Text style={styles.price}>${(item.price * item.quantity).toFixed(2)}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.food_id)}>
                  <Text style={styles.remove}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <Text style={styles.total}>Total: ${totalPrice.toFixed(2)}</Text>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate("Checkout")}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", padding: 16 },
  title: { color: "yellow", fontSize: 24, fontWeight: "bold", textAlign: "center" },
  item: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  name: { color: "white" },
  price: { color: "white" },
  remove: { color: "red" },
  total: { color: "yellow", fontSize: 20, textAlign: "right", marginTop: 10 },
  checkoutButton: {
    backgroundColor: "yellow",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  checkoutText: { textAlign: "center", fontWeight: "bold" },
  empty: { color: "gray", textAlign: "center", marginTop: 40 },
});
