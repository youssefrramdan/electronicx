import React, { useState, useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import Style from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { userLogin, setUserLogin, setUserToken } = useContext(UserContext);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("userToken");
      setUserToken(null);
      setUserLogin(null);
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  return (
    <div
      className={`${Style.adminDashboard} ${
        isSidebarCollapsed ? Style.collapsed : ""
      }`}
    >
      {/* Sidebar */}
      <aside className={Style.sidebar}>
        <div className={Style.sidebarHeader}>
          <div className={Style.logo}>
            <i className="fas fa-crown"></i>
            <h2>Admin Panel</h2>
          </div>
          <button onClick={toggleSidebar} className={Style.toggleBtn}>
            <i
              className={`fas fa-${
                isSidebarCollapsed ? "chevron-right" : "chevron-left"
              }`}
            ></i>
          </button>
        </div>

        <nav className={Style.sidebarNav}>
          <Link to="/admin" className={Style.navItem}>
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/products" className={Style.navItem}>
            <i className="fas fa-box"></i>
            <span>Products</span>
          </Link>
          <Link to="/admin/categories" className={Style.navItem}>
            <i className="fas fa-tags"></i>
            <span>Categories</span>
          </Link>
          <Link to="/admin/orders" className={Style.navItem}>
            <i className="fas fa-shopping-cart"></i>
            <span>Orders</span>
          </Link>
          <Link to="/admin/users" className={Style.navItem}>
            <i className="fas fa-users"></i>
            <span>Users</span>
          </Link>
          <Link to="/admin/rentals" className={Style.navItem}>
            <i className="fas fa-calendar-alt"></i>
            <span>Rentals</span>
          </Link>
          <Link to="/admin/brands" className={Style.navItem}>
            <i className="fas fa-copyright"></i>
            <span>Brands</span>
          </Link>
        </nav>

        {/* Logout Button */}
        <div className={Style.sidebarFooter}>
          <button onClick={handleLogout} className={Style.logoutBtn}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={Style.mainContent}>
        <header className={Style.contentHeader}>
          <div className={Style.headerLeft}>
            <h1>Admin Dashboard</h1>
            <p>Manage your e-commerce platform</p>
          </div>
          <div className={Style.headerRight}>
            <div className={Style.headerActions}>
              <button className={Style.notificationBtn}>
                <i className="fas fa-bell"></i>
              </button>
              <div className={Style.adminProfile}>
                <i className="fas fa-user-circle"></i>
                <span>{userLogin?.name || "Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        <div className={Style.contentBody}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
