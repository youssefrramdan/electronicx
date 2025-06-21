import React, { useContext, useEffect, useState } from "react";
import Style from "./Cart.module.css";
import { UserContext } from "../../Context/UserContext";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    total: 0,
    itemCount: 0,
  });
  const [cartData, setCartData] = useState(null);
  const { userToken } = useContext(UserContext);
  const navigate = useNavigate();

  const API_BASE_URL =
    "https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1";

  // Get auth headers
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${userToken}`,
  });

  // Get user cart
  const getCart = async () => {
    if (!userToken) return;

    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders(),
      });

      if (data.status === "success") {
        setCartItems(data.data.cartItems || []);
        setCartData(data.data);
        calculateCartSummary(data.data.cartItems || [], data.data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 404) {
        // No cart found - empty cart
        setCartItems([]);
        setCartData(null);
        setCartSummary({ subtotal: 0, total: 0, itemCount: 0 });
      } else {
        setError("Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart summary
  const calculateCartSummary = (items, cart) => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart?.totalCartPrice || 0;
    const total = cart?.totalPriceAfterDiscount || subtotal;

    setCartSummary({
      itemCount,
      subtotal,
      total,
    });
  };

  // Update product quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/cart/${itemId}`,
        {
          quantity: newQuantity,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      if (data.status === "success") {
        setCartItems(data.data.cartItems);
        setCartData(data.data);
        calculateCartSummary(data.data.cartItems, data.data);
        toast.success("Quantity updated");
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/cart/${itemId}`, {
        headers: getAuthHeaders(),
      });

      if (data.status === "success") {
        setCartItems(data.data.cartItems);
        setCartData(data.data);
        calculateCartSummary(data.data.cartItems, data.data);
        toast.success("Item removed from cart");
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await axios.delete(`${API_BASE_URL}/cart`, {
          headers: getAuthHeaders(),
        });

        setCartItems([]);
        setCartData(null);
        setCartSummary({ subtotal: 0, total: 0, itemCount: 0 });
        toast.success("Cart cleared");
      } catch (error) {
        toast.error("Failed to clear cart");
      }
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!cartData?._id) {
      toast.error("No items in cart");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Navigate to payment page with cart ID
    navigate(`/PaymentInfo/${cartData._id}`);
  };

  useEffect(() => {
    if (userToken) {
      getCart();
    }
  }, [userToken]);

  if (!userToken) {
    return (
      <div className={Style.loginPrompt}>
        <div className={Style.loginContent}>
          <i className="fas fa-shopping-cart"></i>
          <h3>Please Login to View Your Cart</h3>
          <p>You need to be logged in to see your shopping cart</p>
          <Link to="/login" className={Style.loginBtn}>
            <i className="fas fa-user"></i>
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className={Style.errorState}>
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={getCart} className={Style.retryBtn}>
          <i className="fas fa-refresh"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={Style.cartContainer}>
      <div className="container">
        {/* Header */}
        <div className={Style.cartHeader}>
          <div className={Style.headerContent}>
            <h1>Shopping Cart</h1>
            <p>
              {cartSummary.itemCount}{" "}
              {cartSummary.itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          {cartItems.length > 0 && (
            <button onClick={clearCart} className={Style.clearBtn}>
              <i className="fas fa-trash"></i>
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <div className={Style.emptyCart}>
            <div className={Style.emptyContent}>
              <i className="fas fa-shopping-cart"></i>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything to your cart yet</p>
              <Link to="/products" className={Style.shopBtn}>
                <i className="fas fa-shopping-bag"></i>
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          // Cart with items
          <div className={Style.cartContent}>
            <div className={Style.cartItems}>
              {cartItems.map((item) => {
                const product = item.product;
                const currentPrice = item.price;

                return (
                  <div key={item._id} className={Style.cartItem}>
                    <div className={Style.itemImage}>
                      <img
                        src={
                          product.imageCover ||
                          "https://via.placeholder.com/150x150?text=No+Image"
                        }
                        alt={product.name || product.title}
                      />
                    </div>

                    <div className={Style.itemDetails}>
                      <h3 className={Style.itemName}>
                        <Link to={`/productdetails/${product._id}`}>
                          {product.name || product.title || "Product"}
                        </Link>
                      </h3>

                      <div className={Style.itemMeta}>
                        {product.category?.name && (
                          <span className={Style.category}>
                            {product.category.name}
                          </span>
                        )}
                        {product.brand?.name && (
                          <span className={Style.brand}>
                            {product.brand.name}
                          </span>
                        )}
                      </div>

                      <div className={Style.itemPrice}>
                        <span className={Style.currentPrice}>
                          EGP {currentPrice}
                        </span>
                      </div>
                    </div>

                    <div className={Style.itemActions}>
                      <div className={Style.quantityControls}>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className={Style.quantityBtn}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <span className={Style.quantity}>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className={Style.quantityBtn}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>

                      <div className={Style.itemTotal}>
                        <span className={Style.totalLabel}>Subtotal:</span>
                        <span className={Style.totalPrice}>
                          EGP {(currentPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item._id)}
                        className={Style.removeBtn}
                      >
                        <i className="fas fa-trash"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className={Style.cartSummary}>
              <div className={Style.summaryCard}>
                <h3>Order Summary</h3>

                <div className={Style.summaryRow}>
                  <span>Items ({cartSummary.itemCount})</span>
                  <span>EGP {cartSummary.subtotal.toFixed(2)}</span>
                </div>

                <div className={Style.summaryRow}>
                  <span>Shipping</span>
                  <span className={Style.freeShipping}>Free</span>
                </div>

                {cartData?.totalPriceAfterDiscount && (
                  <div className={Style.summaryRow}>
                    <span>Discount</span>
                    <span className={Style.discount}>
                      -EGP{" "}
                      {(cartSummary.subtotal - cartSummary.total).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className={`${Style.summaryRow} ${Style.total}`}>
                  <span>Total</span>
                  <span>EGP {cartSummary.total.toFixed(2)}</span>
                </div>

                <div className={Style.checkoutActions}>
                  <button
                    onClick={handleCheckout}
                    className={Style.checkoutBtn}
                    disabled={cartItems.length === 0}
                  >
                    <i className="fas fa-credit-card"></i>
                    Proceed to Checkout
                  </button>

                  <Link to="/products" className={Style.continueBtn}>
                    <i className="fas fa-arrow-left"></i>
                    Continue Shopping
                  </Link>
                </div>

                <div className={Style.securityInfo}>
                  <i className="fas fa-lock"></i>
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
