import axios from "axios";
import { BASE_URL } from "../config";

const API_BASE_URL = `${BASE_URL}/api/v1`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rental API functions
export const rentalApi = {
  // Create new rental request
  createRentalRequest: async (formData) => {
    const response = await api.post("/rental-requests", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get user's rental requests
  getUserRentalRequests: async (page = 1, limit = 10) => {
    const response = await api.get(
      `/rental-requests/my-requests?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get single rental request
  getRentalRequest: async (id) => {
    const response = await api.get(`/rental-requests/${id}`);
    return response.data;
  },

  // Get all rental requests (Admin only)
  getAllRentals: async (params = {}) => {
    const { page = 1, limit = 10, status, search } = params;
    let url = `/rental-requests?page=${page}&limit=${limit}`;
    if (status && status !== "all") {
      url += `&status=${status}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Update rental request status (Admin only)
  updateRentalStatus: async (id, data) => {
    const response = await api.patch(`/rental-requests/${id}/status`, data);
    return response.data;
  },

  // Update return condition (Admin only)
  updateReturnCondition: async (
    id,
    returnCondition,
    depositReturnedAmount,
    adminNotes = ""
  ) => {
    const response = await api.patch(`/rental-requests/${id}/return`, {
      returnCondition,
      depositReturnedAmount,
      adminNotes,
    });
    return response.data;
  },

  // Get rental statistics (Admin only)
  getRentalStats: async () => {
    const response = await api.get("/rental-requests/stats");
    return response.data;
  },
};

export default rentalApi;
