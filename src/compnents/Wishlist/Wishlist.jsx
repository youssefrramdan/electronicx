import React, { useContext } from "react";
import Style from "./Wishlist.module.css";
import { WishContext } from "../../Context/WishContext";
import { CartContext } from "../../Context/CartContext";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Wishlist() {
  const {
    wishlist,
    wishlistCount,
    loading,
    removeFromWishlist,
    clearWishlist,
  } = useContext(WishContext);

  const { addToCart } = useContext(CartContext);

  const handleAddToCart = async (productId) => {
    try {
      if (addToCart) {
        const response = await addToCart(productId);
        if (response?.data?.status === "success") {
          toast.success("Product added to cart", {
            duration: 2000,
            position: "top-center",
          });
        }
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlist(productId);
  };

  const handleClearWishlist = async () => {
    if (
      window.confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      await clearWishlist();
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={Style.wishlistContainer}>
      <div className="container">
        {/* Header */}
        <div className={Style.header}>
          <div className={Style.headerContent}>
            <h1>My Wishlist</h1>
            <p>Your favorite products in one place</p>
          </div>

          {wishlistCount > 0 && (
            <div className={Style.headerActions}>
              <span className={Style.itemCount}>{wishlistCount} items</span>
              <button className={Style.clearBtn} onClick={handleClearWishlist}>
                <i className="fas fa-trash"></i>
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlistCount === 0 ? (
          <div className={Style.emptyWishlist}>
            <div className={Style.emptyContent}>
              <i className="fas fa-heart"></i>
              <h3>Your wishlist is empty</h3>
              <p>Start adding products you love to see them here</p>
              <Link to="/products" className={Style.shopBtn}>
                <i className="fas fa-shopping-bag"></i>
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className={Style.wishlistGrid}>
            {wishlist.map((item) => {
              const product = item.product;
              const hasDiscount =
                product.priceAfterDiscount &&
                product.priceAfterDiscount < product.price;
              const discountPercentage = hasDiscount
                ? Math.round(
                    ((product.price - product.priceAfterDiscount) /
                      product.price) *
                      100
                  )
                : 0;

              return (
                <div key={item._id} className={Style.wishlistCard}>
                  {hasDiscount && (
                    <div className={Style.discountBadge}>
                      -{discountPercentage}%
                    </div>
                  )}

                  <button
                    className={Style.removeBtn}
                    onClick={() => handleRemoveFromWishlist(product._id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>

                  <div className={Style.productImage}>
                    <img
                      src={
                        product.imageCover ||
                        "https://via.placeholder.com/300x200?text=No+Image"
                      }
                      alt={product.title}
                    />
                  </div>

                  <div className={Style.productInfo}>
                    <div className={Style.productCategory}>
                      {product.category?.name} • {product.brand?.name}
                    </div>

                    <h3 className={Style.productTitle}>
                      <Link to={`/Productdetails/${product._id}`}>
                        {product.title}
                      </Link>
                    </h3>

                    <div className={Style.productRating}>
                      <div className={Style.stars}>
                        {[...Array(5)].map((_, index) => (
                          <i
                            key={index}
                            className={`fas fa-star ${
                              index < Math.floor(product.ratingsAverage || 0)
                                ? Style.starFilled
                                : Style.starEmpty
                            }`}
                          ></i>
                        ))}
                      </div>
                      <span className={Style.ratingNumber}>
                        ({product.ratingsAverage || 0})
                      </span>
                    </div>

                    <div className={Style.productPrice}>
                      {hasDiscount ? (
                        <>
                          <span className={Style.currentPrice}>
                            EGP {product.priceAfterDiscount}
                          </span>
                          <span className={Style.originalPrice}>
                            EGP {product.price}
                          </span>
                        </>
                      ) : (
                        <span className={Style.currentPrice}>
                          EGP {product.price}
                        </span>
                      )}
                    </div>

                    <div className={Style.productStock}>
                      {product.stock > 0 ? (
                        <span className={Style.inStock}>In Stock</span>
                      ) : (
                        <span className={Style.outOfStock}>Out of Stock</span>
                      )}
                    </div>

                    <div className={Style.cardActions}>
                      <button
                        className={Style.addToCartBtn}
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.stock === 0}
                      >
                        <i className="fas fa-shopping-cart"></i>
                        Add to Cart
                      </button>

                      <Link
                        to={`/Productdetails/${product._id}`}
                        className={Style.viewDetailsBtn}
                      >
                        <i className="fas fa-eye"></i>
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
