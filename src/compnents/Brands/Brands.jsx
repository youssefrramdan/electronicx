import React, { useState } from "react";
import Style from "./Brands.module.css";
import axios from "axios";
import { useQuery } from "react-query";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import toast from "react-hot-toast";

export default function Brands() {
  const [searchTerm, setSearchTerm] = useState("");

  async function getAllBrands() {
    try {
      let response = await axios.get(
        "https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/brands"
      );
      return response.data;
    } catch (error) {
      toast.error("Failed to load brands", {
        duration: 3000,
        position: "top-center",
      });
      throw error;
    }
  }

  let { isLoading, isError, data } = useQuery("getBrands", getAllBrands, {
    cacheTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Filter brands based on search term
  const filteredBrands =
    data?.data?.filter((brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <div className={Style.errorContainer}>
        <div className={Style.errorContent}>
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Failed to load brands</h3>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.brandsContainer}>
      <div className="container">
        {/* Header Section */}
        <div className={Style.header}>
          <div className={Style.headerContent}>
            <h1>Our Brands</h1>
            <p>Discover the best electronics brands in one place</p>
          </div>

          {/* Search Bar */}
          <div className={Style.searchContainer}>
            <div className={Style.searchBox}>
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Brands Stats */}
        <div className={Style.statsContainer}>
          <div className={Style.statCard}>
            <i className="fas fa-tags"></i>
            <div>
              <h3>{data?.data?.length || 0}</h3>
              <p>Total Brands</p>
            </div>
          </div>
          <div className={Style.statCard}>
            <i className="fas fa-search"></i>
            <div>
              <h3>{filteredBrands.length}</h3>
              <p>Search Results</p>
            </div>
          </div>
        </div>

        {/* Brands Grid */}
        {filteredBrands.length > 0 ? (
          <div className={Style.brandsGrid}>
            {filteredBrands.map((brand) => (
              <div key={brand._id} className={Style.brandCard}>
                <div className={Style.brandImageContainer}>
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className={Style.brandImage}
                    />
                  ) : (
                    <div className={Style.noImagePlaceholder}>
                      <i className="fas fa-image"></i>
                      <span>{brand.name}</span>
                    </div>
                  )}
                  <div className={Style.brandOverlay}>
                    <i className="fas fa-eye"></i>
                  </div>
                </div>
                <div className={Style.brandInfo}>
                  <h3>{brand.name}</h3>
                  <p className={Style.brandSlug}>{brand.slug}</p>
                  <div className={Style.brandMeta}>
                    <span className={Style.createdDate}>
                      <i className="fas fa-calendar"></i>
                      {new Date(brand.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={Style.noResults}>
            <div className={Style.noResultsContent}>
              <i className="fas fa-search"></i>
              <h3>No brands found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
