import React, { useContext, useState } from "react";
import Style from "./ProductDetails.module.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";
import Slider from "react-slick";
import { Helmet } from "react-helmet";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import { CartContext } from "../../Context/CartContext";
import { WishContext } from "../../Context/WishContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishContext);
  const [mainSlider, setMainSlider] = useState(null);
  const [thumbnailSlider, setThumbnailSlider] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  async function getProductDetails() {
    return axios.get(
      `https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/products/${id}`
    );
  }

  const { isLoading, error, data } = useQuery(
    ["productDetails", id],
    getProductDetails
  );

  const handleAddToCart = async () => {
    try {
      const response = await addToCart(id);
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

  const handleWishlistToggle = async () => {
    if (id) {
      await toggleWishlist(id);
    }
  };

  const mainSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    beforeChange: (current, next) => setCurrentSlide(next),
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    asNavFor: thumbnailSlider,
    fade: true,
  };

  const thumbnailSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    focusOnSelect: true,
    asNavFor: mainSlider,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  if (isLoading) return <LoadingScreen />;
  if (error)
    return <div className={Style.error}>Error loading product details</div>;
  if (!data?.data.data) return null;

  const product = data.data.data;
  const allImages = [
    product.imageCover,
    ...product.images.filter((img) => img !== product.imageCover),
  ];
  const discountedPrice = product.priceAfterDiscount || product.price;
  const hasDiscount =
    product.priceAfterDiscount && product.priceAfterDiscount < product.price;

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {product.title || product.name || "Product Details"} - ElectronixHub
        </title>
      </Helmet>

      <div className={Style.productDetails}>
        <div className={Style.container}>
          <div className={Style.productGrid}>
            <div className={Style.imageSection}>
              <div className={Style.mainImage}>
                <Slider
                  ref={(slider) => setMainSlider(slider)}
                  {...mainSliderSettings}
                >
                  {allImages.map((image, index) => (
                    <div key={index} className={Style.slideImage}>
                      <img
                        src={image}
                        alt={`${product.title || product.name} - Image ${
                          index + 1
                        }`}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
              <div className={Style.thumbnails}>
                <Slider
                  ref={(slider) => setThumbnailSlider(slider)}
                  {...thumbnailSettings}
                >
                  {allImages.map((image, index) => (
                    <div
                      key={index}
                      className={`${Style.thumbnail} ${
                        currentSlide === index ? Style.active : ""
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title || product.name} - Thumbnail ${
                          index + 1
                        }`}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </div>

            <div className={Style.infoSection}>
              <h1 className={Style.title}>{product.title || product.name}</h1>

              <div className={Style.priceRating}>
                <div className={Style.priceInfo}>
                  {hasDiscount && (
                    <span className={Style.discountPrice}>
                      ${product.price}
                    </span>
                  )}
                  <span className={Style.price}>{discountedPrice}</span>
                </div>
                <div className={Style.rating}>
                  <i className="fas fa-star"></i>
                  <span>{product.ratingsAverage || 0}</span>
                </div>
              </div>

              {product.discount > 0 && (
                <div className={Style.discount}>
                  <span className={Style.discountBadge}>
                    {product.discount}% OFF
                  </span>
                </div>
              )}

              <div className={Style.stock}>
                <span className={Style.label}>Availability:</span>
                <span className={Style.value}>
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </span>
              </div>

              <div className={Style.category}>
                <span className={Style.label}>Category:</span>
                <span className={Style.value}>{product.category.name}</span>
              </div>

              <div className={Style.description}>
                <h2>Description</h2>
                <p>{product.description}</p>
              </div>

              {/* Rental Section */}
              {product.isRentable && (
                <div className={Style.rentalSection}>
                  <h2 className={Style.rentalTitle}>
                    <i className="fas fa-calendar-alt"></i>
                    Available for Rent
                  </h2>
                  <div className={Style.rentalInfo}>
                    <div className={Style.rentalPrice}>
                      <span className={Style.label}>Daily Rate:</span>
                      <span className={Style.value}>
                        ${product.rentalPricePerDay}/day
                      </span>
                    </div>
                    {product.rentalDeposit && (
                      <div className={Style.rentalDeposit}>
                        <span className={Style.label}>Security Deposit:</span>
                        <span className={Style.value}>
                          ${product.rentalDeposit}
                        </span>
                      </div>
                    )}
                    <div className={Style.rentalStock}>
                      <span className={Style.label}>Available Units:</span>
                      <span className={Style.value}>
                        {product.rentalStock || product.stock} units
                      </span>
                    </div>
                  </div>
                  <div className={Style.rentalFeatures}>
                    <div className={Style.feature}>
                      <i className="fas fa-check-circle"></i>
                      <span>Flexible rental periods</span>
                    </div>
                    <div className={Style.feature}>
                      <i className="fas fa-shield-alt"></i>
                      <span>Damage protection included</span>
                    </div>
                    <div className={Style.feature}>
                      <i className="fas fa-truck"></i>
                      <span>Delivery & pickup available</span>
                    </div>
                  </div>
                </div>
              )}

              <div className={Style.actionButtons}>
                <button
                  className={Style.addToCartBtn}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <i className="fas fa-shopping-cart"></i>
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>

                {/* Rent Button - only show if product is rentable */}
                {product.isRentable && (
                  <button
                    className={Style.rentBtn}
                    onClick={() => navigate(`/rent-product/${product._id}`)}
                    disabled={!product.rentalStock && !product.stock}
                  >
                    <i className="fas fa-calendar-check"></i>
                    {product.rentalStock || product.stock > 0
                      ? "Rent Now"
                      : "Not Available"}
                  </button>
                )}

                <button
                  className={`${Style.wishlistBtn} ${
                    id && isInWishlist(id) ? Style.inWishlist : ""
                  }`}
                  onClick={handleWishlistToggle}
                  title={
                    id && isInWishlist(id)
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"
                  }
                >
                  <i className="fas fa-heart"></i>
                  {id && isInWishlist(id) ? "In Wishlist" : "Add to Wishlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${Style.sliderArrow} ${Style.nextArrow}`}
      style={{ ...style }}
      onClick={onClick}
    >
      <i className="fas fa-chevron-right"></i>
    </div>
  );
}

function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${Style.sliderArrow} ${Style.prevArrow}`}
      style={{ ...style }}
      onClick={onClick}
    >
      <i className="fas fa-chevron-left"></i>
    </div>
  );
}
