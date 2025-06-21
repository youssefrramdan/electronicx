import React, { useState, useEffect } from "react";
import Style from "./Home.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import SearchResults from "../SearchResults/SearchResults";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const features = [
    {
      icon: "fas fa-truck",
      title: "Free Shipping",
      description: "Free shipping on all orders over $100",
    },
    {
      icon: "fas fa-shield-alt",
      title: "Secure Payments",
      description: "Protected by advanced encryption",
    },
    {
      icon: "fas fa-undo",
      title: "Easy Returns",
      description: "30-day money back guarantee",
    },
    {
      icon: "fas fa-headset",
      title: "24/7 Support",
      description: "Round-the-clock customer service",
    },
  ];

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const { data } = await axios.get(
        "https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/categories"
      );
      setCategories(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Error loading categories. Please try again later.");
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The search will automatically trigger due to the searchQuery state change
  };

  const getCategoryIcon = (name) => {
    const icons = {
      headphones: "fas fa-headphones",
      pcs: "fas fa-desktop",
      pc: "fas fa-laptop",
      Electronics: "fas fa-mobile-alt",
      games: "fas fa-gamepad",
      // Add more mappings as needed
    };
    return icons[name] || "fas fa-box"; // Default icon if no mapping found
  };

  return (
    <div className={Style.homePage}>
      {/* Hero Section */}
      <section className={Style.hero}>
        <div className={Style.heroContent}>
          <h1 className={Style.heroTitle}>
            Discover the Latest in <span>Electronics</span>
          </h1>
          <p className={Style.heroSubtitle}>
            Your one-stop destination for all things tech
          </p>
          <form onSubmit={handleSearch} className={Style.searchForm}>
            <input
              type="text"
              placeholder="Search for products, brands, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={Style.searchInput}
            />
            <button type="submit" className={Style.searchButton}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Search Results */}
      <SearchResults searchQuery={searchQuery} />

      {/* Features Section */}
      <section className={Style.features}>
        <div className={Style.container}>
          <div className={Style.featureGrid}>
            <div className={Style.featureCard}>
              <div className={Style.featureIcon}>
                <i className="fas fa-truck"></i>
              </div>
              <h3>Fast Shipping</h3>
              <p>Free delivery for orders over $100</p>
            </div>
            <div className={Style.featureCard}>
              <div className={Style.featureIcon}>
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Secure Payment</h3>
              <p>100% secure payment methods</p>
            </div>
            <div className={Style.featureCard}>
              <div className={Style.featureIcon}>
                <i className="fas fa-undo"></i>
              </div>
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
            <div className={Style.featureCard}>
              <div className={Style.featureIcon}>
                <i className="fas fa-headset"></i>
              </div>
              <h3>24/7 Support</h3>
              <p>Dedicated customer support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={Style.categories}>
        <div className={Style.container}>
          <div className={Style.sectionHeader}>
            <h2>Browse by Category</h2>
            <p>Find what you're looking for in our extensive collection</p>
          </div>
          {loading ? (
            <LoadingScreen />
          ) : error ? (
            <div className={Style.error}>{error}</div>
          ) : (
            <div className={Style.categoriesGrid}>
              {categories.map((category) => (
                <Link
                  to={`/category/${category._id}`}
                  key={category._id}
                  className={Style.categoryCard}
                >
                  <div className={Style.categoryIcon}>
                    <i className={getCategoryIcon(category.name)}></i>
                  </div>
                  <h3>{category.name}</h3>
                  <span>{category.productsCount || 0} Products</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className={Style.about}>
        <div className={Style.container}>
          <div className={Style.aboutContent}>
            <div className={Style.aboutText}>
              <h2>About ElectronixHub</h2>
              <p>
                We are your one-stop destination for all things electronic. With
                a vast selection of products, competitive prices, and
                exceptional customer service, we strive to make your shopping
                experience seamless and enjoyable.
              </p>
              <ul className={Style.aboutList}>
                <li>
                  <i className="fas fa-check"></i>
                  Premium Quality Products
                </li>
                <li>
                  <i className="fas fa-check"></i>
                  Expert Technical Support
                </li>
                <li>
                  <i className="fas fa-check"></i>
                  Competitive Prices
                </li>
                <li>
                  <i className="fas fa-check"></i>
                  Extended Warranty Options
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={Style.newsletter}>
        <div className={Style.container}>
          <div className={Style.newsletterContent}>
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for the latest deals and updates</p>
            <form className={Style.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email"
                className={Style.newsletterInput}
              />
              <button type="submit" className={Style.newsletterButton}>
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
