import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ConfirmationScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Confirmed!</Text>
      <Text style={styles.subtitle}>Your food is on its way</Text>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.replace("Home")}
      >
        <Text style={styles.homeText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" },
  title: { color: "yellow", fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  subtitle: { color: "white", fontSize: 16, marginBottom: 30 },
  homeButton: { backgroundColor: "yellow", padding: 12, borderRadius: 8 },
  homeText: { color: "black", fontWeight: "bold" },
});
