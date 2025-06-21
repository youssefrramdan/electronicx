import React, { useContext, useEffect, useState } from "react";
import Style from "./Allorders.module.css";
import { OrderContext } from "../../Context/OrderContext";
import { UserContext } from "../../Context/UserContext";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import { Link, useSearchParams } from "react-router-dom";

export default function Allorders() {
  const { userToken } = useContext(UserContext);
  const {
    orders,
    loading,
    getUserOrders,
    verifyPaymentSuccess,
    getOrderStatusText,
    getOrderStatusColor,
    calculateOrderTotal,
  } = useContext(OrderContext);

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (userToken) {
      getUserOrders();
    }
  }, [userToken]);

  // Check for successful payment on page load
  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");

    if (success === "true" && sessionId && !paymentVerified) {
      setPaymentVerified(true);
      verifyPaymentSuccess(sessionId);

      // Clean up URL after a short delay
      setTimeout(() => {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }, 3000);
    }
  }, [searchParams, verifyPaymentSuccess, paymentVerified]);

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.OrderItems.some(
          (item) =>
            item.product?.name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            item.product?.title
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "delivered" && order.isDelivered) ||
        (filterStatus === "processing" && order.isPaid && !order.isDelivered) ||
        (filterStatus === "pending" && !order.isPaid);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price-high":
          return b.totalOrderPrice - a.totalOrderPrice;
        case "price-low":
          return a.totalOrderPrice - b.totalOrderPrice;
        default:
          return 0;
      }
    });

  if (loading && orders.length === 0) {
    return <LoadingScreen />;
  }

  if (!userToken) {
    return (
      <div className={Style.loginPrompt}>
        <div className={Style.loginPromptContent}>
          <i className="fas fa-user-lock"></i>
          <h3>Please Login to View Orders</h3>
          <p>You need to be logged in to access your order history.</p>
          <Link to="/login" className={Style.loginBtn}>
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.ordersContainer}>
      <div className="container">
        <div className={Style.ordersHeader}>
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        {/* Filters and Search */}
        <div className={Style.filtersSection}>
          <div className={Style.searchBox}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={Style.filters}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={Style.filterSelect}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending Payment</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={Style.sortSelect}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className={Style.emptyState}>
            <div className={Style.emptyStateContent}>
              <i className="fas fa-shopping-bag"></i>
              <h3>No Orders Found</h3>
              <p>
                {orders.length === 0
                  ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                  : "No orders match your current filters. Try adjusting your search or filters."}
              </p>
              {orders.length === 0 && (
                <Link to="/products" className={Style.shopBtn}>
                  Start Shopping
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className={Style.ordersList}>
            {filteredOrders.map((order) => (
              <div key={order._id} className={Style.orderCard}>
                <div className={Style.orderHeader}>
                  <div className={Style.orderInfo}>
                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p className={Style.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className={Style.orderStatus}>
                    <span
                      className={`${Style.statusBadge} ${
                        Style[getOrderStatusColor(order)]
                      }`}
                    >
                      {getOrderStatusText(order)}
                    </span>
                  </div>
                </div>

                <div className={Style.orderItems}>
                  {order.OrderItems.slice(0, 3).map((item, index) => (
                    <div key={index} className={Style.orderItem}>
                      <div className={Style.itemImage}>
                        <img
                          src={
                            item.product?.imageCover || "/placeholder-image.jpg"
                          }
                          alt={
                            item.product?.name ||
                            item.product?.title ||
                            "Product"
                          }
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                      </div>
                      <div className={Style.itemDetails}>
                        <h4>
                          {item.product?.name ||
                            item.product?.title ||
                            "Product"}
                        </h4>
                        <p>Qty: {item.quantity}</p>
                        <p className={Style.itemPrice}>
                          $
                          {(
                            item.product?.priceAfterDiscount ||
                            item.product?.price ||
                            item.price
                          )?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {order.OrderItems.length > 3 && (
                    <div className={Style.moreItems}>
                      +{order.OrderItems.length - 3} more items
                    </div>
                  )}
                </div>

                <div className={Style.orderFooter}>
                  <div className={Style.orderTotal}>
                    <span className={Style.totalLabel}>Total: </span>
                    <span className={Style.totalAmount}>
                      ${order.totalOrderPrice?.toFixed(2)}
                    </span>
                  </div>

                  <div className={Style.orderActions}>
                    <button
                      className={Style.viewDetailsBtn}
                      onClick={() => {
                        // Navigate to order details - you can implement this
                        console.log("View order details:", order._id);
                      }}
                    >
                      View Details
                    </button>

                    {!order.isPaid && (
                      <button className={Style.payNowBtn}>Pay Now</button>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className={Style.shippingInfo}>
                    <h5>Shipping Address:</h5>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.street}
                      <br />
                      Phone: {order.shippingAddress.phone}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading overlay */}
        {loading && orders.length > 0 && (
          <div className={Style.loadingOverlay}>
            <div className={Style.spinner}></div>
          </div>
        )}
      </div>
    </div>
  );
}
