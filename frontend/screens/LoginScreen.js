// frontend/screens/LoginScreen.js
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../colors";
import { useAuth } from "../context/AuthContext";

const ACCENT = COLORS.gold;
const BACKGROUND = COLORS.black;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDasher, setIsDasher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const formScale = useRef(new Animated.Value(0.96)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const emailScale = useRef(new Animated.Value(1)).current;
  const passwordScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Restore last-used role for toggle, if available
    const restoreRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem("is_dasher");
        if (savedRole !== null) {
          setIsDasher(savedRole === "true");
        }
      } catch {
        // ignore
      }
    };
    restoreRole();

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
  }, []);

  const animateInput = (ref, value) => {
    Animated.spring(ref, {
      toValue: value,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(email.trim(), password, isDasher);
      // On success, AuthContext will update and App.* will route
    } catch (err) {
      console.log("LOGIN ERROR:", err?.response?.data || err?.message || err);

      if (!err?.response) {
        setError("Unable to reach server. Check your connection.");
        return;
      }

      const data = err.response.data || {};
      const message =
        typeof data === "string"
          ? data
          : data.error || data.message || "";
      const lower = (message || "").toLowerCase();

      if (lower.includes("no matching account")) {
        setError("This email is not registered for the selected role.");
      } else if (
        err.response.status === 401 ||
        lower.includes("invalid credentials")
      ) {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue as a customer or dasher.
            </Text>

            {/* Role Toggle */}
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

            {/* Email */}
            <Animated.View
              style={[styles.inputWrapper, { transform: [{ scale: emailScale }] }]}
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

            {/* Password */}
            <Animated.View
              style={[
                styles.inputWrapper,
                { transform: [{ scale: passwordScale }] },
              ]}
            >
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                onChangeText={setPassword}
                onFocus={() => animateInput(passwordScale, 1.02)}
                onBlur={() => animateInput(passwordScale, 1)}
              />
            </Animated.View>

            {/* Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              onPress={() => navigation.navigate("Signup")}
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>
                {"Don't have an account? "}
                <Text style={styles.footerHighlight}>Sign up</Text>
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
    color: "#D32F2F",
    textAlign: "left",
    marginBottom: 10,
    fontSize: 13,
  },
});
