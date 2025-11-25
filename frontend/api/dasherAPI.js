// frontend/api/dasherAPI.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../config";

async function authHeaders() {
  const token = await AsyncStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getAvailableDasherOrders() {
  const headers = await authHeaders();
  const res = await axios.get(
    `${API_BASE}/api/dashers/orders/available`,
    { headers }
  );
  return res.data;
}

export async function acceptDasherOrder(orderId) {
  const headers = await authHeaders();
  const res = await axios.post(
    `${API_BASE}/api/dashers/orders/accept/${orderId}`,
    {},
    { headers }
  );
  return res.data;
}

export async function getActiveDasherOrders() {
  const headers = await authHeaders();
  const res = await axios.get(
    `${API_BASE}/api/dashers/orders/active`,
    { headers }
  );
  return res.data;
}

// optional: update status (delivered, picked_up, etc)
// adjust body keys to match backend's UpdateOrderStatusHandler
export async function updateOrderStatus(orderId, status) {
  const headers = await authHeaders();
  const res = await axios.post(
    `${API_BASE}/api/orders/${orderId}/status`,
    { status },
    { headers }
  );
  return res.data;
}
