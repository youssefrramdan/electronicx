import axios from "axios";
import { BASE_URL } from "../config";

// Request throttling and caching to prevent rate limiting
const requestCache = new Map();
const requestQueue = [];
const MAX_CONCURRENT_REQUESTS = 5;
let activeRequests = 0;

const throttleRequest = async (
  requestFn,
  cacheKey = null,
  cacheTime = 30000
) => {
  // Check cache first
  if (cacheKey && requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey);
    if (Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    requestCache.delete(cacheKey);
  }

  return new Promise((resolve, reject) => {
    const processRequest = async () => {
      if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
        // Add to queue and wait
        requestQueue.push({ processRequest, resolve, reject });
        return;
      }

      activeRequests++;
      try {
        const result = await requestFn();

        // Cache the result if cacheKey provided
        if (cacheKey) {
          requestCache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }

        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        activeRequests--;
        // Process next request in queue
        if (requestQueue.length > 0) {
          const next = requestQueue.shift();
          setTimeout(next.processRequest, 100); // Small delay between requests
        }
      }
    };

    processRequest();
  });
};

const adminApi = axios.create({
  baseURL: `${BASE_URL}/api/v1/admin`,
  withCredentials: true,
  timeout: 15000, // 15 second timeout
});

// Create a separate instance for product operations using regular routes
const productApi = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
  timeout: 15000, // 15 second timeout
});

// Request interceptor to add auth token for both instances
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor for rate limiting
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 429) {
        console.warn("Rate limit exceeded, retrying after delay...");
        // Wait 2 seconds and retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return apiInstance.request(error.config);
      }
      return Promise.reject(error);
    }
  );
};

addAuthInterceptor(adminApi);
addAuthInterceptor(productApi);

// Dashboard Overview
export const getDashboardStats = async () => {
  try {
    const [orderStats, productStats] = await Promise.all([
      adminApi.get("/stats/orders"),
      adminApi.get("/stats/products"),
    ]);

    return {
      orders: orderStats.data.data || {
        totalOrders: 0,
        totalRevenue: 0,
        ordersByStatus: [],
        recentOrders: [],
      },
      products: productStats.data.data || {
        totalProducts: 0,
        productsByCategory: [],
        topProducts: [],
        lowStock: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Users Management
export const getUsers = async () => {
  try {
    // Use regular productApi for user routes as there's no separate admin/users route
    const response = await productApi.get("/users");
    return response.data?.users || response.data?.data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  const response = await productApi.delete(`/users/${userId}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await productApi.post("/users", userData);
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await productApi.patch(`/users/${userId}/role`, { role });
  return response.data;
};

// Orders Management
export const getOrders = async () => {
  try {
    // Try admin route first, fallback to regular orders route
    let response;
    try {
      response = await adminApi.get("/orders");
    } catch (adminError) {
      console.log("Admin orders route failed, trying regular orders route");
      response = await productApi.get("/orders");
    }

    // Handle different response formats
    const orders =
      response.data?.orders || response.data?.data || response.data || [];
    console.log("Orders response:", response.data);
    console.log("Extracted orders:", orders);

    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch orders");
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    // Try admin route first, fallback to regular orders route
    let response;
    try {
      response = await adminApi.patch(`/orders/${orderId}/status`, { status });
    } catch (adminError) {
      console.log(
        "Admin order update route failed, trying regular orders route"
      );
      response = await productApi.patch(`/orders/${orderId}`, { status });
    }

    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error(
      error.response?.data?.message || "Failed to update order status"
    );
  }
};

// Products Management - using regular product routes with throttling
export const getProducts = async () => {
  return throttleRequest(
    async () => {
      const response = await productApi.get("/products");
      return response.data.data;
    },
    "products",
    10000 // Cache for 10 seconds
  );
};

export const createProduct = async (productData) => {
  try {
    console.log("FormData entries for create:");
    for (let [key, value] of productData.entries()) {
      console.log(key, value);
    }

    const response = await productApi.post("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data) {
      throw new Error("No response data received");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating product:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create product"
    );
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    console.log("Making API call to update product:", productId);
    console.log("FormData entries:");
    for (let [key, value] of productData.entries()) {
      console.log(key, typeof value, value);
    }

    const response = await productApi.patch(
      `/products/${productId}`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.data) {
      throw new Error("No response data received");
    }

    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Re-throw with more descriptive message
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update product"
    );
  }
};

export const deleteProduct = async (productId) => {
  const response = await productApi.delete(`/products/${productId}`);
  return response.data;
};

// Categories Management with throttling
export const getCategories = async () => {
  return throttleRequest(
    async () => {
      const response = await adminApi.get("/categories");
      return response.data.data;
    },
    "categories",
    30000 // Cache for 30 seconds
  );
};

export const createCategory = async (categoryData) => {
  // Clear cache after creating
  requestCache.delete("categories");
  const response = await adminApi.post("/categories", categoryData);
  return response.data;
};

export const updateCategory = async (categoryId, categoryData) => {
  // Clear cache after updating
  requestCache.delete("categories");
  const response = await adminApi.patch(
    `/categories/${categoryId}`,
    categoryData
  );
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  // Clear cache after deleting
  requestCache.delete("categories");
  const response = await adminApi.delete(`/categories/${categoryId}`);
  return response.data;
};

// Brands Management with throttling
export const getBrands = async () => {
  return throttleRequest(
    async () => {
      const response = await productApi.get("/brands");
      return response.data.data;
    },
    "brands",
    30000 // Cache for 30 seconds
  );
};

export default adminApi;
