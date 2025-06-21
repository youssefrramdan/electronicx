import React from "react";
import Style from "./MainSlider.module.css";
import img1 from "../../Assets/images/grocery-banner.png";
import img2 from "../../Assets/images/slider-image-2.jpeg";
import img3 from "../../Assets/images/slider-image-3.jpeg";
import img4 from "../../Assets/images/grocery-banner-2.jpeg";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { RotatingLines } from "react-loader-spinner";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "react-query";
import { CartContext } from "../../Context/CartContext";

export default function MainSlider() {
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 1000,
  };
  function getFeaturedProducts() {
    return axios.get(
      "https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/products"
    );
  }

  let { data, isLoading, isError, isFetching, refetch } = useQuery(
    "featuredProducts",
    getFeaturedProducts
  );

  return (
    <>
      {isLoading ? (
        <div className={Style.overlay}>
          <div className=" m-center d-flex justify-content-center  align-items-center">
            <div>
              {" "}
              <RotatingLines
                strokeColor="green"
                strokeWidth="5"
                animationDuration="0.75"
                width="96"
                visible={true}
                color={"text-main"}
              />{" "}
            </div>
          </div>
        </div>
      ) : (
        <div className="container mt-5 mb-5">
          <div className="row gx-0">
            <div className="col-md-8">
              <Slider {...settings}>
                <img src={img3} alt="" className="w-100" />
                <img src={img2} alt="" className="w-100" />
              </Slider>
            </div>
            <div className="col-md-4">
              <img src={img1} alt="" className="w-100" height={278} />
              <img src={img4} alt="" className="w-100" height={278} />
            </div>
            <div className=""></div>
          </div>
        </div>
      )}
    </>
  );
}
