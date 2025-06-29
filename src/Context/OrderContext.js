import { createContext, useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "./UserContext";

export const OrderContext = createContext();

const API_BASE_URL = "https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1";
const BASE_URL = `${API_BASE_URL}/orders`;

export default function OrderContextProvider({ children }) {
  const { userToken } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Headers for API requests
  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
  });

  // Create Cash Order
  const createCashOrder = async (cartId, shippingAddress) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/cash/${cartId}`,
        { shippingAddress },
        getHeaders()
      );

      if (response.data.message === "Order created successfully") {
        toast.success("Order created successfully! We'll deliver it soon.", {
          duration: 4000,
          position: "top-center",
        });

        // Refresh orders list
        await getUserOrders();

        return { success: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create order. Please try again.";

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Create Online Payment Session
  const createOnlinePayment = async (cartId, shippingAddress) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/online/${cartId}`,
        { shippingAddress },
        getHeaders()
      );

      if (response.data.message === "Payment session created successfully") {
        return { success: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create payment session. Please try again.";

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get User Orders
  const getUserOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/user`, getHeaders());

      if (response.data.message === "success") {
        setOrders(response.data.orders);
        return { success: true, data: response.data.orders };
      } else {
        // No orders found
        setOrders([]);
        return { success: true, data: [] };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch orders. Please try again.";

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });

      setOrders([]);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get Single Order
  const getOrderById = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/${orderId}`, getHeaders());

      if (response.data.message === "success") {
        setCurrentOrder(response.data.order);
        return { success: true, data: response.data.order };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch order details. Please try again.";

      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate order total
  const calculateOrderTotal = (orderItems) => {
    return orderItems.reduce((total, item) => {
      const price =
        item.product?.priceAfterDiscount || item.product?.price || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  // Helper function to format order status
  const getOrderStatusText = (order) => {
    if (order.isDelivered) {
      return "Delivered";
    } else if (order.isPaid) {
      return "Processing";
    } else {
      return "Pending Payment";
    }
  };

  // Helper function to get order status color
  const getOrderStatusColor = (order) => {
    if (order.isDelivered) {
      return "success";
    } else if (order.isPaid) {
      return "warning";
    } else {
      return "danger";
    }
  };

  // Verify Payment Success (fallback method)
  const verifyPaymentSuccess = async (sessionId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/verify-payment/${sessionId}`,
        getHeaders()
      );

      if (response.data.success) {
        // Refresh orders list silently
        await getUserOrders();
        return { success: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to verify payment. Please contact support.";

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // State
    orders,
    loading,
    currentOrder,

    // Actions
    createCashOrder,
    createOnlinePayment,
    verifyPaymentSuccess,
    getUserOrders,
    getOrderById,

    // Helpers
    calculateOrderTotal,
    getOrderStatusText,
    getOrderStatusColor,

    // Setters
    setOrders,
    setCurrentOrder,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}
