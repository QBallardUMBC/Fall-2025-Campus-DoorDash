import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../config";

// Helper to get authorization headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}` };
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE}/api/orders`, orderData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error.response?.data || error.message);
    throw error;
  }
};

// Get all orders for a specific customer
export const getCustomerOrders = async (customerId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE}/api/orders/customer/${customerId}`, { headers });
    return response.data.orders;
  } catch (error) {
    console.error("Error fetching customer orders:", error.response?.data || error.message);
    throw error;
  }
};

// Get a single order by ID
export const getOrderById = async (orderId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE}/api/orders/${orderId}`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching order by ID:", error.response?.data || error.message);
    throw error;
  }
};

// Get all orders for a restaurant
export const getRestaurantOrders = async (restaurantId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE}/api/orders/restaurant/${restaurantId}`, { headers });
    return response.data.orders;
  } catch (error) {
    console.error("Error fetching restaurant orders:", error.response?.data || error.message);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${API_BASE}/api/orders/${orderId}/status`,
      { status },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error.response?.data || error.message);
    throw error;
  }
};

// Assign a dasher to an order
export const assignDasher = async (orderId, dasherId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${API_BASE}/api/orders/${orderId}/assign`,
      { dasher_id: dasherId },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning dasher:", error.response?.data || error.message);
    throw error;
  }
};
