import React, { useEffect, useState } from "react";
import Style from "./Categories.module.css";
import axios from "axios";
import { Link } from "react-router-dom";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <LoadingScreen />;
  if (error) return <div className={Style.error}>{error}</div>;

  return (
    <div className="container py-5">
      <div className={Style.categoriesHeader}>
        <h2>Browse by Category</h2>
        <p>Find what you're looking for in our extensive collection</p>
      </div>

      <div className={Style.categoriesGrid}>
        {categories.map((category) => (
          <Link
            to={`/products?category=${category._id}`}
            key={category._id}
            className={Style.categoryCard}
          >
            <div className={Style.imageWrapper}>
              <img src={category.imageCover} alt={category.name} />
            </div>
            <div className={Style.categoryInfo}>
              <h3>{category.name}</h3>
              <span>{category.productsCount || 0} Products</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
