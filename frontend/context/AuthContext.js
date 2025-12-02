import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../config";

const AuthContext = createContext({
  token: null,
  isDasher: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isDasher, setIsDasher] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("access_token");
        const savedIsDasher = await AsyncStorage.getItem("is_dasher");
        if (savedToken) {
          setToken(savedToken);
          setIsDasher(savedIsDasher === "true");
        } else {
          setToken(null);
          setIsDasher(false);
        }
      } catch {
        setToken(null);
        setIsDasher(false);
      } finally {
        setLoading(false);
      }
    };
    restoreAuth();
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
        "is_dasher",
        "user_email",
        "user_id",
      ]);
    } catch {
      // ignore
    }
    setToken(null);
    setIsDasher(false);
  }, []);

  const login = useCallback(async (email, password, isDasherParam) => {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
      is_dasher: isDasherParam,
    });

    const accessToken = res.data["access token"] || res.data.access_token;
    const refreshToken = res.data.refresh_token || "";
    const userID =
      res.data?.user?.User?.ID ||
      res.data?.user?.user?.id ||
      res.data?.user?.id ||
      null;

    const pairs = [
      ["access_token", accessToken],
      ["refresh_token", refreshToken],
      ["is_dasher", JSON.stringify(isDasherParam)],
      ["user_email", email],
    ];
    if (userID) {
      pairs.push(["user_id", userID]);
    }

    await AsyncStorage.multiSet(pairs);

    setToken(accessToken);
    setIsDasher(isDasherParam);
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          await logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isDasher,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

