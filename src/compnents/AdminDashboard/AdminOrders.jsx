import React, { useState, useEffect } from "react";
import { getOrders, updateOrderStatus } from "../../services/adminApi";
import Style from "./AdminOrders.module.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrders();
      console.log("Orders data:", data); // Debug log
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to fetch orders");
      setOrders([]);
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return Style.statusPending;
      case "processing":
        return Style.statusProcessing;
      case "shipped":
        return Style.statusShipped;
      case "delivered":
        return Style.statusDelivered;
      case "cancelled":
        return Style.statusCancelled;
      default:
        return Style.statusPending;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <i className="fas fa-clock"></i>;
      case "processing":
        return <i className="fas fa-cog fa-spin"></i>;
      case "shipped":
        return <i className="fas fa-shipping-fast"></i>;
      case "delivered":
        return <i className="fas fa-check-circle"></i>;
      case "cancelled":
        return <i className="fas fa-times-circle"></i>;
      default:
        return <i className="fas fa-clock"></i>;
    }
  };

  const filteredOrders = (orders || [])
    .filter((order) => {
      const matchesSearch =
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || order.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest":
          return (b.totalOrderPrice || 0) - (a.totalOrderPrice || 0);
        case "lowest":
          return (a.totalOrderPrice || 0) - (b.totalOrderPrice || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className={Style.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={Style.error}>
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={Style.adminOrders}>
      <div className={Style.header}>
        <h2>Manage Orders</h2>
        <div className={Style.filters}>
          <div className={Style.searchBox}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={Style.statusFilter}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={Style.sortFilter}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </div>

      <div className={Style.ordersTable}>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id?.slice(-6) || "N/A"}</td>
                  <td>
                    <div className={Style.customer}>
                      <span className={Style.customerName}>
                        {order.user?.name || "Unknown"}
                      </span>
                      <span className={Style.customerEmail}>
                        {order.user?.email || "No email"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>${order.totalOrderPrice?.toFixed(2) || "0.00"}</td>
                  <td>
                    <span
                      className={`${Style.status} ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status || "pending"}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status || "pending"}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className={Style.statusSelect}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={Style.noOrders}>
                  <div className={Style.noOrdersContent}>
                    <i className="fas fa-box-open"></i>
                    <p>No orders found</p>
                    <span>
                      Orders will appear here once customers start placing them
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
