import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import toast from "react-hot-toast";

export let CartContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

export default function CartContextProvider(props) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const { userToken } = useContext(UserContext);

  // Set up auth headers
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${userToken}`,
  });

  // Add product to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!userToken) {
      toast.error("Please login to add items to cart");
      return { success: false, error: "Not authenticated" };
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/cart`,
        { productId, quantity },
        { headers: getAuthHeaders() }
      );

      if (data.status === "success") {
        await getCart(); // Update full cart data
        toast.success("Product added to cart");
        return { success: true, data };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to add product to cart";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get user cart
  const getCart = async () => {
    if (!userToken) return { success: false, data: [] };

    try {
      const { data } = await axios.get(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders(),
      });

      if (data.status === "success") {
        setCartItems(data.data.cartItems || []);
        setCartCount(data.data.cartItems?.length || 0);
        setCartId(data.data._id);
        setCartTotal(data.data.totalCartPrice || 0);
        return { success: true, data: data.data };
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No cart found - this is normal for new users
        setCartItems([]);
        setCartCount(0);
        setCartId(null);
        setCartTotal(0);
        return { success: true, data: { cartItems: [] } };
      }
      console.error("Error fetching cart:", error);
      setCartItems([]);
      setCartCount(0);
      setCartId(null);
      setCartTotal(0);
      return { success: false, error: error.response?.data?.message };
    }
  };

  // Get cart count only
  const getCartCount = async () => {
    if (!userToken) {
      setCartCount(0);
      return 0;
    }

    try {
      const { data } = await axios.get(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders(),
      });

      if (data.status === "success") {
        const count = data.data.cartItems?.length || 0;
        setCartCount(count);
        return count;
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching cart count:", error);
      }
      setCartCount(0);
      return 0;
    }
  };

  // Update product quantity
  const updateCartItemQuantity = async (itemId, quantity) => {
    if (!userToken) {
      toast.error("Please login to update cart");
      return { success: false };
    }

    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return { success: false };
    }

    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/cart/${itemId}`,
        { quantity },
        { headers: getAuthHeaders() }
      );

      if (data.status === "success") {
        setCartItems(data.data.cartItems || []);
        setCartCount(data.data.cartItems?.length || 0);
        setCartTotal(data.data.totalCartPrice || 0);
        toast.success("Cart updated");
        return { success: true, data: data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update cart";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    if (!userToken) {
      toast.error("Please login to remove items from cart");
      return { success: false };
    }

    try {
      const { data } = await axios.delete(`${API_BASE_URL}/cart/${itemId}`, {
        headers: getAuthHeaders(),
      });

      if (data.status === "success") {
        setCartItems(data.data.cartItems || []);
        setCartCount(data.data.cartItems?.length || 0);
        setCartTotal(data.data.totalCartPrice || 0);
        toast.success("Item removed from cart");
        return { success: true, data: data.data };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to remove item from cart";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!userToken) {
      toast.error("Please login to clear cart");
      return { success: false };
    }

    try {
      await axios.delete(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders(),
      });

      setCartItems([]);
      setCartCount(0);
      setCartId(null);
      setCartTotal(0);
      toast.success("Cart cleared");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to clear cart";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some((item) => item.product._id === productId);
  };

  // Get cart item quantity for a specific product
  const getCartItemQuantity = (productId) => {
    const item = cartItems.find((item) => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Proceed to checkout - redirect to payment page
  const proceedToCheckout = () => {
    if (!cartId) {
      toast.error("No items in cart");
      return null;
    }
    return cartId;
  };

  // Calculate cart totals
  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price =
        item.product?.priceAfterDiscount || item.product?.price || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  // Load cart when user logs in
  useEffect(() => {
    if (userToken) {
      getCart();
    } else {
      setCartCount(0);
      setCartItems([]);
      setCartId(null);
      setCartTotal(0);
    }
  }, [userToken]);

  return (
    <CartContext.Provider
      value={{
        // State
        cartCount,
        cartItems,
        cartId,
        cartTotal,

        // Actions
        addToCart,
        getCart,
        getCartCount,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        proceedToCheckout,

        // Helpers
        isInCart,
        getCartItemQuantity,
        calculateCartTotal,

        // Legacy functions for backwards compatibility
        getLogedusercart: getCart,
        removeCartItem: removeFromCart,
        UpdateProductCount: updateCartItemQuantity,

        // Keep existing wishlist and payment functions for now
        addToWishList: async (productId) => {
          if (!userToken) {
            toast.error("Please login to add items to wishlist");
            return;
          }
          return axios.post(
            `https://ecommerce.routemisr.com/api/v1/wishlist`,
            { productId },
            { headers: { token: userToken } }
          );
        },

        removeWishListItem: async (productId) => {
          if (!userToken) return;
          return axios.delete(
            `https://ecommerce.routemisr.com/api/v1/wishlist/${productId}`,
            { headers: { token: userToken } }
          );
        },

        getWishlistIitem: async () => {
          if (!userToken) return;
          return axios.get(`https://ecommerce.routemisr.com/api/v1/wishlist`, {
            headers: { token: userToken },
          });
        },

        onlinePayment: async (cartId, values) => {
          if (!userToken) return;
          return axios.post(
            `https://ecommerce.routemisr.com/api/v1/orders/checkout-session/${cartId}?url=http://localhost:3000`,
            { shippingAddress: values },
            { headers: { token: userToken } }
          );
        },

        getOrders: async (userId) => {
          return axios.get(
            `https://ecommerce.routemisr.com/api/v1/orders/user/${userId}`
          );
        },
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
}
