import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/adminApi";
import styles from "./DashboardOverview.module.css";
import {
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
  FaTag,
  FaBoxes,
  FaPercent,
} from "react-icons/fa";

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    orders: {
      totalOrders: 0,
      totalRevenue: 0,
      ordersByStatus: [],
      recentOrders: [],
    },
    products: {
      totalProducts: 0,
      productsByCategory: [],
      topProducts: [],
      lowStock: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className={styles.error}>
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );

  return (
    <div className={styles.dashboard}>
      <h2>Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaShoppingCart />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Orders</h3>
            <p>{stats.orders.totalOrders}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBox />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Products</h3>
            <p>{stats.products.totalProducts}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaDollarSign />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Revenue</h3>
            <p>${stats.orders.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBoxes />
          </div>
          <div className={styles.statInfo}>
            <h3>Low Stock</h3>
            <p>{stats.products.lowStock} products</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.section}>
        <h3>Recent Orders</h3>
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.orders.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.user?.name || "N/A"}</td>
                  <td>${order.totalOrderPrice.toFixed(2)}</td>
                  <td>
                    <span
                      className={
                        styles[
                          order.status ? order.status.toLowerCase() : "pending"
                        ]
                      }
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className={styles.section}>
        <h3>Top Products</h3>
        <div className={styles.productsGrid}>
          {stats.products.topProducts.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.productImage}>
                {product.imageCover ? (
                  <img
                    src={product.imageCover}
                    alt={product.title || product.name}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/200x200?text=No+Image";
                    }}
                  />
                ) : (
                  <div className={styles.noImage}>
                    <FaBox />
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h4>{product.title || product.name || "Untitled Product"}</h4>
                {product.description && (
                  <p className={styles.description}>{product.description}</p>
                )}
                <div className={styles.productStats}>
                  <div className={styles.statRow}>
                    <FaTag className={styles.icon} />
                    <span>Price: ${product.price?.toFixed(2) || "0.00"}</span>
                  </div>
                  {product.priceAfterDiscount && (
                    <div className={styles.statRow}>
                      <FaPercent className={styles.icon} />
                      <span>
                        Discount: ${product.priceAfterDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className={styles.statRow}>
                    <FaBoxes className={styles.icon} />
                    <span>Sold: {product.sold || 0}</span>
                  </div>
                  <div className={styles.statRow}>
                    <FaBox className={styles.icon} />
                    <span>In Stock: {product.quantity || 0}</span>
                  </div>
                  {product.category?.name && (
                    <div className={styles.statRow}>
                      <FaTag className={styles.icon} />
                      <span>Category: {product.category.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products by Category */}
      <div className={styles.section}>
        <h3>Products by Category</h3>
        <div className={styles.categoryGrid}>
          {stats.products.productsByCategory.map((category) => (
            <div key={category._id} className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                <FaBox />
              </div>
              <h4>{category.name}</h4>
              <p>{category.count} products</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
