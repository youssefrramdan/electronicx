import React, { useContext, useEffect, useState } from "react";
import Style from "./Product.module.css";
import { RotatingLines } from "react-loader-spinner";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";
import { CartContext } from "../../Context/CartContext";
import { WishContext } from "../../Context/WishContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Product() {
  let { addToCart } = useContext(CartContext);
  let { toggleWishlist, isInWishlist } = useContext(WishContext);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [minRating, setMinRating] = useState(0);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          "https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/categories"
        );
        setCategories(data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  function notify(msg) {
    toast.success(`${msg}`, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  }

  function error() {
    toast.error(`Error occurred`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  }

  async function addProduct(productId) {
    let response = await addToCart(productId);
    if (response?.success) {
      notify("Successfully Added to cart");
    } else {
      error();
    }
  }

  async function handleWishlistToggle(productId) {
    await toggleWishlist(productId);
  }

  // Build query parameters for API call
  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.append("keyword", searchQuery);
    if (selectedCategory) params.append("category", selectedCategory);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (minRating > 0) params.append("minRating", minRating.toString());

    // Build sort parameter
    const sortParam = sortOrder === "desc" ? `-${sortBy}` : sortBy;
    params.append("sort", sortParam);

    return params.toString();
  };

  function getFeaturedProducts() {
    const queryString = buildQueryParams();
    const url = `https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/products${
      queryString ? `?${queryString}` : ""
    }`;
    return axios.get(url);
  }

  let { data, isLoading, isError, isFetching, refetch } = useQuery(
    [
      "featuredProducts",
      searchQuery,
      selectedCategory,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      minRating,
    ],
    getFeaturedProducts,
    {
      cacheTime: 3000,
      keepPreviousData: true, // Keep previous data while fetching new data
    }
  );

  // Get products from API response
  const products = data?.data?.data || [];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("name");
    setSortOrder("asc");
    setMinRating(0);
  };

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const delayedRefetch = setTimeout(() => {
      refetch();
    }, 500);

    return () => clearTimeout(delayedRefetch);
  }, [searchQuery, refetch]);

  return (
    <>
      {isLoading && !data && (
        <div className={Style.overlay}>
          <div className={Style.loadingSpinner}>
            <RotatingLines
              strokeColor="#667eea"
              strokeWidth="5"
              animationDuration="0.75"
              width="96"
              visible={true}
            />
            <div className={Style.loadingText}>Loading Products...</div>
          </div>
        </div>
      )}

      <div className={Style.productsContainer}>
        {/* Page Header */}
        <div className={Style.pageHeader}>
          <h1 className={Style.pageTitle}>Our Products</h1>
          <p className={Style.pageSubtitle}>
            Discover amazing products with advanced filters and search
          </p>
        </div>

        <div className={Style.mainContent}>
          {/* Filters Popup Overlay */}
          {showFilters && (
            <div
              className={Style.filtersOverlay}
              onClick={() => setShowFilters(false)}
            >
              <div
                className={Style.filtersPopup}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={Style.filtersHeader}>
                  <h2 className={Style.filtersTitle}>
                    <i className="fas fa-filter"></i>
                    Filters
                  </h2>
                  <button
                    className={Style.closeBtn}
                    onClick={() => setShowFilters(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className={Style.filtersContent}>
                  {/* Search Filter */}
                  <div className={Style.filterGroup}>
                    <label className={Style.filterLabel}>Search Products</label>
                    <input
                      className={Style.searchInput}
                      type="text"
                      placeholder="Search by product name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Category Filter */}
                  <div className={Style.filterGroup}>
                    <label className={Style.filterLabel}>Category</label>
                    <select
                      className={Style.sortSelect}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div className={Style.filterGroup}>
                    <label className={Style.filterLabel}>
                      Price Range (EGP)
                    </label>
                    <div className={Style.priceRange}>
                      <input
                        className={Style.priceInput}
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                      <span>-</span>
                      <input
                        className={Style.priceInput}
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className={Style.filterGroup}>
                    <label className={Style.filterLabel}>Minimum Rating</label>
                    <div className={Style.ratingFilter}>
                      {[4, 3, 2, 1, 0].map((rating) => (
                        <label key={rating} className={Style.ratingOption}>
                          <input
                            type="radio"
                            name="rating"
                            value={rating}
                            checked={minRating === rating}
                            onChange={(e) =>
                              setMinRating(parseInt(e.target.value))
                            }
                          />
                          <span className={Style.stars}>
                            {rating > 0 ? (
                              <>
                                {Array.from({ length: rating }, (_, i) => (
                                  <i key={i} className="fas fa-star"></i>
                                ))}
                                {" & Up"}
                              </>
                            ) : (
                              "All Ratings"
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className={Style.filterGroup}>
                    <label className={Style.filterLabel}>Sort By</label>
                    <select
                      className={Style.sortSelect}
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split("-");
                        setSortBy(sort);
                        setSortOrder(order);
                      }}
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="price-asc">Price (Low to High)</option>
                      <option value="price-desc">Price (High to Low)</option>
                      <option value="ratingsAverage-desc">
                        Rating (High to Low)
                      </option>
                      <option value="ratingsAverage-asc">
                        Rating (Low to High)
                      </option>
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  <button
                    className={Style.clearFiltersBtn}
                    onClick={clearFilters}
                  >
                    <i className="fas fa-undo"></i> Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          <div className={Style.productsSection}>
            {/* Products Header */}
            <div className={Style.productsHeader}>
              <div className={Style.resultsCount}>
                {isFetching && data ? (
                  <span>
                    <i className="fas fa-spinner fa-spin"></i> Updating
                    results...
                  </span>
                ) : (
                  `Showing ${products.length} products`
                )}
              </div>

              {/* Filter Toggle Button */}
              <button
                className={Style.filterToggleBtn}
                onClick={() => setShowFilters(true)}
              >
                <i className="fas fa-filter"></i> Filters
              </button>
            </div>

            {/* Products Grid */}
            {products.length === 0 && !isLoading ? (
              <div className={Style.noResults}>
                <div className={Style.noResultsIcon}>
                  <i className="fas fa-search"></i>
                </div>
                <h3 className={Style.noResultsText}>No products found</h3>
                <p className={Style.noResultsSubtext}>
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className={Style.productsGrid}>
                {products.map((product) => (
                  <div className={Style.productCard} key={product._id}>
                    <div className={Style.productImageContainer}>
                      <Link to={`/productdetails/${product._id}`}>
                        <img
                          src={product.imageCover}
                          className={Style.productImage}
                          alt={product.name}
                        />
                      </Link>

                      <button
                        className={`${Style.wishlistBtn} ${
                          isInWishlist(product._id) ? Style.inWishlist : ""
                        }`}
                        onClick={() => handleWishlistToggle(product._id)}
                        title={
                          isInWishlist(product._id)
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                        }
                      >
                        <i className="fas fa-heart"></i>
                      </button>

                      {product.priceAfterDiscount && (
                        <div className={Style.discountBadge}>
                          {Math.round(
                            ((product.price - product.priceAfterDiscount) /
                              product.price) *
                              100
                          )}
                          % OFF
                        </div>
                      )}
                    </div>

                    <div className={Style.productInfo}>
                      <div className={Style.productCategory}>
                        {product.category?.name || "Uncategorized"}
                      </div>

                      <Link
                        to={`/productdetails/${product._id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <h3 className={Style.productName}>{product.name}</h3>
                      </Link>

                      <div className={Style.productDetails}>
                        <div className={Style.productPrice}>
                          {product.priceAfterDiscount ? (
                            <>
                              <div className="originalPrice">
                                {product.price} EGP
                              </div>
                              <div className="currentPrice">
                                {product.priceAfterDiscount} EGP
                              </div>
                            </>
                          ) : (
                            <div className="currentPrice">
                              {product.price} EGP
                            </div>
                          )}
                        </div>

                        <div className={Style.productRating}>
                          <i className="fas fa-star"></i>
                          <span>{product.ratingsAverage || 0}</span>
                        </div>
                      </div>

                      <button
                        className={Style.addToCartBtn}
                        onClick={() => addProduct(product._id)}
                        disabled={product.stock === 0}
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
          </div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </>
  );
}
