// api/dasherAPI.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../config";

export async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("access_token");
  if (!token) {
    throw new Error("Missing auth token");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// GET available dasher orders
export async function getAvailableDasherOrders() {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${API_BASE}/api/dashers/orders/available`, { headers });
  return res.data.orders || res.data;
}

// Accept an order
export async function acceptDasherOrder(orderId) {
  const headers = await getAuthHeaders();
  const res = await axios.post(
    `${API_BASE}/api/dashers/orders/accept/${orderId}`,
    {},
    { headers }
  );
  return res.data;
}

// GET active dasher orders
export async function getActiveDasherOrders() {
  const headers = await getAuthHeaders();
  const res = await axios.get(`${API_BASE}/api/dashers/orders/active`, { headers });
  return res.data.orders || res.data;
}

// Mark order as complete
export async function completeDasherOrder(orderId) {
  const headers = await getAuthHeaders();
  const res = await axios.post(
    `${API_BASE}/api/dashers/orders/${orderId}/complete`,
    {},
    { headers }
  );
  return res.data;
}
