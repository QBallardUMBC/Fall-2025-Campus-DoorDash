// frontend/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showAdminOptions, setShowAdminOptions] = useState(false);

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role:", role);
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/UMBC_Retrievers_logo.svg/1200px-UMBC_Retrievers_logo.svg.png",
        }}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>Campus DoorDash</Text>
      <Text style={styles.subtitle}>UMBC Edition</Text>

      {/* Input fields */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="gray"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="gray"
        secureTextEntry
      />

      {/* Role selection */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "student" && styles.selectedRole,
          ]}
          onPress={() => {
            setRole("student");
            setShowAdminOptions(false);
          }}
        >
          <Text
            style={[
              styles.roleText,
              role === "student" && styles.selectedRoleText,
            ]}
          >
            Student
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "admin" && styles.selectedRole]}
          onPress={() => {
            setRole("admin");
            setShowAdminOptions(true);
          }}
        >
          <Text
            style={[
              styles.roleText,
              role === "admin" && styles.selectedRoleText,
            ]}
          >
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      {/* Admin options placeholder */}
      {showAdminOptions && (
        <Text style={styles.adminText}>Restaurant selection coming soon...</Text>
      )}

      {/* Login button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      {/* Signup link */}
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.signupText}>
          Don’t have an account?{" "}
          <Text style={styles.signupHighlight}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    color: "#FFD700",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 30,
  },
  input: {
    width: "90%",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
    alignItems: "center",
  },
  roleText: {
    color: "white",
    fontWeight: "600",
  },
  selectedRole: {
    backgroundColor: "#FFD700",
  },
  selectedRoleText: {
    color: "black",
  },
  adminText: {
    color: "white",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    width: "90%",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#FFD700",
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  loginButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupText: {
    color: "white",
    fontSize: 14,
  },
  signupHighlight: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});
