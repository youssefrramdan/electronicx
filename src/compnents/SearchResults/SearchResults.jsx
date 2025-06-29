import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./SearchResults.module.css";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import { CartContext } from "../../Context/CartContext";
import { WishContext } from "../../Context/WishContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SearchResults({ searchQuery }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishContext);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchQuery) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await axios.get(
          `https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/products?keyword=${searchQuery}`
        );
        setProducts(data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  const handleAddToCart = async (productId) => {
    try {
      const response = await addToCart(productId);
      if (response?.success) {
        toast.success("Successfully added to cart", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      toast.error("Failed to add to cart", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!searchQuery) return null;

  return (
    <div className={styles.searchResults}>
      <h2 className={styles.title}>Search Results for "{searchQuery}"</h2>
      {products.length === 0 ? (
        <div className={styles.noResults}>
          No products found for "{searchQuery}"
        </div>
      ) : (
        <div className={styles.grid}>
          {products
            .filter((product) => product && product._id)
            .map((product) => (
              <div key={product._id} className={styles.productCard}>
                <div className={styles.productImageContainer}>
                  <Link to={`/productdetails/${product._id}`}>
                    <img
                      src={product.imageCover}
                      className={styles.productImage}
                      alt={product.name || product.title}
                    />
                  </Link>

                  <button
                    className={`${styles.wishlistBtn} ${
                      product._id && isInWishlist(product._id)
                        ? styles.inWishlist
                        : ""
                    }`}
                    onClick={() => product._id && toggleWishlist(product._id)}
                    title={
                      product._id && isInWishlist(product._id)
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"
                    }
                  >
                    <i className="fas fa-heart"></i>
                  </button>

                  {product.priceAfterDiscount && (
                    <div className={styles.discountBadge}>
                      {Math.round(
                        ((product.price - product.priceAfterDiscount) /
                          product.price) *
                          100
                      )}
                      % OFF
                    </div>
                  )}

                  {product.isRentable && (
                    <div className={styles.rentalBadge}>
                      <i className="fas fa-calendar-check"></i>
                      RENT
                    </div>
                  )}
                </div>

                <div className={styles.productInfo}>
                  <div className={styles.productCategory}>
                    {product.category?.name || "Uncategorized"}
                  </div>

                  <Link
                    to={`/productdetails/${product._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <h3 className={styles.productName}>
                      {product.name || product.title}
                    </h3>
                  </Link>

                  <div className={styles.productDetails}>
                    <div className={styles.productPrice}>
                      {product.priceAfterDiscount ? (
                        <>
                          <div className="currentPrice">
                            {product.priceAfterDiscount} EGP
                          </div>
                          <div className="originalPrice">
                            {product.price} EGP
                          </div>
                        </>
                      ) : (
                        <div className="currentPrice">{product.price} EGP</div>
                      )}
                    </div>

                    <div className={styles.productRating}>
                      <i className="fas fa-star"></i>
                      <span>{product.ratingsAverage || 0}</span>
                    </div>
                  </div>

                  <button
                    className={styles.addToCartBtn}
                    onClick={() => product._id && handleAddToCart(product._id)}
                    disabled={product.stock === 0 || !product._id}
                  >
                    {product.stock === 0 ? (
                      <>
                        <i className="fas fa-times-circle"></i> Out of Stock
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shopping-cart"></i> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
