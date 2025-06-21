import React from "react";
import Style from "./Footer.module.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className={Style.footer}>
      <div className="container">
        <div className={Style.footerContent}>
          {/* Main Footer */}
          <div className={Style.mainFooter}>
            {/* Brand Section */}
            <div className={Style.brandSection}>
              <h3 className={Style.brandName}>ElectronixHub</h3>
              <p>
                Your trusted destination for premium electronics and tech
                accessories.
              </p>
              <div className={Style.socialLinks}>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={Style.linksSection}>
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <Link to="/about">About Us</Link>
                </li>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link to="/faq">FAQ</Link>
                </li>
                <li>
                  <Link to="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms">Terms & Conditions</Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div className={Style.linksSection}>
              <h4>Categories</h4>
              <ul>
                <li>
                  <Link to="/products?category=smartphones">Smartphones</Link>
                </li>
                <li>
                  <Link to="/products?category=laptops">Laptops</Link>
                </li>
                <li>
                  <Link to="/products?category=audio">Audio Devices</Link>
                </li>
                <li>
                  <Link to="/products?category=tvs">TVs & Displays</Link>
                </li>
                <li>
                  <Link to="/products?category=gaming">Gaming</Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className={Style.contactSection}>
              <h4>Contact Us</h4>
              <ul>
                <li>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>123 Tech Street, Digital City, 12345</span>
                </li>
                <li>
                  <i className="fas fa-phone-alt"></i>
                  <span>+1 (234) 567-8900</span>
                </li>
                <li>
                  <i className="fas fa-envelope"></i>
                  <span>support@electronixhub.com</span>
                </li>
                <li>
                  <i className="fas fa-clock"></i>
                  <span>Mon - Fri: 9:00 AM - 10:00 PM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className={Style.newsletterBar}>
            <div className={Style.newsletterContent}>
              <div className={Style.newsletterText}>
                <i className="fas fa-paper-plane"></i>
                <div>
                  <h4>Subscribe to Our Newsletter</h4>
                  <p>Get the latest updates and special offers</p>
                </div>
              </div>
              <div className={Style.newsletterForm}>
                <input type="email" placeholder="Enter your email" />
                <button type="button">Subscribe</button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={Style.bottomBar}>
            <div className={Style.copyright}>
              <p>
                &copy; {new Date().getFullYear()} ElectronixHub. All rights
                reserved.
              </p>
            </div>
            <div className={Style.paymentMethods}>
              <i className="fab fa-cc-visa"></i>
              <i className="fab fa-cc-mastercard"></i>
              <i className="fab fa-cc-amex"></i>
              <i className="fab fa-cc-paypal"></i>
              <i className="fab fa-cc-apple-pay"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
