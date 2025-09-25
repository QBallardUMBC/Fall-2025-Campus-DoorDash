// frontend/SignupScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleSignup = () => {
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role:", role);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <Image
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/UMBC_Retrievers_logo.svg/1200px-UMBC_Retrievers_logo.svg.png",
        }}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Campus DoorDash - UMBC</Text>

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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
          onPress={() => setRole("student")}
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
          onPress={() => setRole("admin")}
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

      {/* Signup button */}
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Back to login link */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text style={styles.loginHighlight}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  signupButton: {
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
  signupButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    color: "white",
    fontSize: 14,
  },
  loginHighlight: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});
