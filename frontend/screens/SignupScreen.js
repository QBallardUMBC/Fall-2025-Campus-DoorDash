// frontend/screens/SignupScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import axios from "axios";
import { API_BASE } from "../config";
import { COLORS } from "../colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";

const ACCENT = COLORS.gold;
const BACKGROUND = COLORS.black;

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDasher, setIsDasher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const formScale = useRef(new Animated.Value(0.96)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const emailScale = useRef(new Animated.Value(1)).current;
  const passwordScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(formScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, formScale]);

  const animateInput = (animRef, to) => {
    Animated.spring(animRef, {
      toValue: to,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError("");

      const trimmedEmail = email.trim();

      await axios.post(`${API_BASE}/auth/register`, {
        email: trimmedEmail,
        password,
        is_dasher: isDasher,
      });

      // Persist role + email for future sessions
      await AsyncStorage.multiSet([
        ["is_dasher", JSON.stringify(isDasher)],
        ["user_email", trimmedEmail],
      ]);

      // Immediately log in so AuthContext + navigation update
      await login(trimmedEmail, password, isDasher);
    } catch (err) {
      console.log(
        "SIGNUP ERROR:",
        err?.response?.data || err?.message || err
      );

      if (!err?.response) {
        setError("Unable to reach server. Check your connection.");
        return;
      }

      const data = err.response.data || {};
      const message =
        typeof data === "string"
          ? data
          : data.error || data.message || "";

      setError(message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ scale: formScale }],
              },
            ]}
          >
            <Text style={styles.brand}>Campus DoorDash</Text>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Choose whether you&apos;re signing up as a customer or dasher.
            </Text>

            <View style={styles.togglePill}>
              <TouchableOpacity
                style={[
                  styles.togglePillItem,
                  !isDasher && styles.togglePillItemActive,
                ]}
                onPress={() => setIsDasher(false)}
              >
                <Text
                  style={[
                    styles.togglePillText,
                    !isDasher && styles.togglePillTextActive,
                  ]}
                >
                  Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.togglePillItem,
                  isDasher && styles.togglePillItemActive,
                ]}
                onPress={() => setIsDasher(true)}
              >
                <Text
                  style={[
                    styles.togglePillText,
                    isDasher && styles.togglePillTextActive,
                  ]}
                >
                  Dasher
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  transform: [{ scale: emailScale }],
                },
              ]}
            >
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#A0A0A0"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                onFocus={() => animateInput(emailScale, 1.02)}
                onBlur={() => animateInput(emailScale, 1)}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.inputWrapper,
                {
                  transform: [{ scale: passwordScale }],
                },
              ]}
            >
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                onChangeText={setPassword}
                onFocus={() => animateInput(passwordScale, 1.02)}
                onBlur={() => animateInput(passwordScale, 1)}
              />
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSignup}
                disabled={loading}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text style={styles.footerHighlight}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 10,
  },
  brand: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gray,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: ACCENT,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 6,
    marginBottom: 20,
  },
  togglePill: {
    flexDirection: "row",
    backgroundColor: COLORS.black,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginBottom: 20,
  },
  togglePillItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  togglePillItemActive: {
    backgroundColor: ACCENT,
  },
  togglePillText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray,
  },
  togglePillTextActive: {
    color: COLORS.black,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.input,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "700",
  },
  footerLink: {
    marginTop: 18,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  footerHighlight: {
    color: ACCENT,
    fontWeight: "600",
  },
  error: {
    color: "#DC2626",
    textAlign: "left",
    marginBottom: 10,
    fontSize: 13,
  },
});
