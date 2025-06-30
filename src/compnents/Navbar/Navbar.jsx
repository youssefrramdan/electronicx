import React, { useContext, useState } from "react";
import Style from "./Navbar.module.css";
import { Link } from "react-router-dom";
import { CounterContext } from "../../Context/CounterContext";
import { UserContext } from "../../Context/UserContext";
import { WishContext } from "../../Context/WishContext";
import { CartContext } from "../../Context/CartContext";
import { useNavigate } from "react-router-dom";
import logo from "../../Assets/images/freshcart-logo.svg";

export default function Navbar() {
  let { userToken, userData, logout } = useContext(UserContext);
  let { wishlistCount } = useContext(WishContext);
  let { cartCount } = useContext(CartContext);
  let x = useContext(CounterContext);
  let navigate = useNavigate();

  function handleLogOut() {
    logout();
    navigate("/login");
  }

  return (
    <nav className={Style.navbar}>
      <div className="container">
        <div className={Style.navContent}>
          {/* Logo */}
          <Link to="/" className={Style.logo}>
            <span>electronix</span>
            <span className={Style.highlight}>hub</span>
          </Link>

          {/* Navigation Links */}
          <div className={Style.navLinks}>
            <Link to="/" className={Style.navLink}>
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>

            <Link to="/products" className={Style.navLink}>
              <i className="fas fa-box"></i>
              <span>Products</span>
            </Link>

            <Link to="/categories" className={Style.navLink}>
              <i className="fas fa-th-large"></i>
              <span>Categories</span>
            </Link>

            <Link to="/brands" className={Style.navLink}>
              <i className="fas fa-tags"></i>
              <span>Brands</span>
            </Link>

            <Link to="/cart" className={Style.navLink}>
              <i className="fas fa-shopping-cart"></i>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className={Style.badge}>{cartCount}</span>
              )}
            </Link>

            <Link to="/wishlist" className={Style.navLink}>
              <i className="fas fa-heart"></i>
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className={Style.badge}>{wishlistCount}</span>
              )}
            </Link>

            {userToken && (
              <Link to="/allorders" className={Style.navLink}>
                <i className="fas fa-receipt"></i>
                <span>Orders</span>
              </Link>
            )}

            {userToken && (
              <Link to="/my-rentals" className={Style.navLink}>
                <i className="fas fa-calendar-alt"></i>
                <span>My Rentals</span>
              </Link>
            )}

            {userToken ? (
              <div className={Style.userSection}>
                {userData?.name && (
                  <span className={Style.userName}>
                    <i className="fas fa-user"></i>
                    <span>Hi, {userData.name}</span>
                  </span>
                )}
                <button onClick={handleLogOut} className={Style.logoutBtn}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className={Style.loginBtn}>
                <i className="fas fa-user"></i>
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className={Style.mobileMenuBtn}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
