// API Configuration
const API_CONFIG = {
  BASE_URL:
    "https://tech-shop-api-e0bd81e562d4.herokuapp.com" ||
    "http://localhost:8000/api/v1",
  TIMEOUT: 10000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_CONFIG.BASE_URL}/auth/login`,
    REGISTER: `${API_CONFIG.BASE_URL}/auth/register`,
    FORGOT_PASSWORD: `${API_CONFIG.BASE_URL}/auth/forgotPassword`,
    RESET_PASSWORD: `${API_CONFIG.BASE_URL}/auth/resetPassword`,
  },

  // Products
  PRODUCTS: `${API_CONFIG.BASE_URL}/products`,

  // Categories
  CATEGORIES: `${API_CONFIG.BASE_URL}/categories`,

  // Brands
  BRANDS: `${API_CONFIG.BASE_URL}/brand`,

  // Cart
  CART: `${API_CONFIG.BASE_URL}/cart`,

  // Orders
  ORDERS: `${API_CONFIG.BASE_URL}/orders`,

  // Wishlist
  WISHLIST: `${API_CONFIG.BASE_URL}/wishlist`,

  // Users
  USERS: `${API_CONFIG.BASE_URL}/users`,
};

export default API_CONFIG;
