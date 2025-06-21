import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "./UserContext";

export const WishContext = createContext();

export default function WishContextProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { userToken } = useContext(UserContext);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1";

  // Get user wishlist
  const getWishlist = async () => {
    if (!userToken) return;

    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/wishlist`);

      if (data.status === "success") {
        setWishlist(data.data.wishlist);
        setWishlistCount(data.results);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  // Add product to wishlist
  const addToWishlist = async (productId) => {
    if (!userToken) {
      toast.error("Please login first");
      return false;
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/wishlist`, {
        productId,
      });

      if (data.status === "success") {
        await getWishlist(); // Refresh wishlist
        toast.success("Added to wishlist", {
          duration: 2000,
          position: "top-center",
        });
        return true;
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
      return false;
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!userToken) return false;

    try {
      const { data } = await axios.delete(
        `${API_BASE_URL}/wishlist/${productId}`
      );

      if (data.status === "success") {
        await getWishlist(); // Refresh wishlist
        toast.success("Removed from wishlist", {
          duration: 2000,
          position: "top-center",
        });
        return true;
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
      return false;
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!userToken) return false;

    try {
      const { data } = await axios.delete(`${API_BASE_URL}/wishlist`);

      if (data.status === "success") {
        setWishlist([]);
        setWishlistCount(0);
        toast.success("Wishlist cleared");
        return true;
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
      return false;
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.product._id === productId);
  };

  // Toggle product in wishlist
  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  // Load wishlist when user token changes
  useEffect(() => {
    if (userToken) {
      getWishlist();
    } else {
      setWishlist([]);
      setWishlistCount(0);
    }
  }, [userToken]);

  const value = {
    wishlist,
    wishlistCount,
    loading,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    toggleWishlist,
  };

  return <WishContext.Provider value={value}>{children}</WishContext.Provider>;
}
