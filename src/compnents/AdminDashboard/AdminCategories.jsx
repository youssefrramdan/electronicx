import React, { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/adminApi";
import Style from "./AdminCategories.module.css";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageCover: null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      imageCover: null,
    });
    setIsEditing(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(categoryId);
        fetchCategories();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      imageCover: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    if (formData.imageCover) {
      formDataToSend.append("imageCover", formData.imageCover);
    }

    try {
      if (isEditing && selectedCategory) {
        await updateCategory(selectedCategory._id, formDataToSend);
      } else {
        await createCategory(formDataToSend);
      }
      fetchCategories();
      setIsEditing(false);
      setSelectedCategory(null);
      setFormData({
        name: "",
        description: "",
        imageCover: null,
      });
    } catch (err) {
      console.error("Error saving category:", err);
      setError("Failed to save category");
    }
  };

  if (loading) {
    return (
      <div className={Style.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={Style.error}>
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={Style.adminCategories}>
      <div className={Style.header}>
        <h2>Manage Categories</h2>
        <button
          className={Style.addButton}
          onClick={() => {
            setIsEditing(false);
            setSelectedCategory(null);
            setFormData({
              name: "",
              description: "",
              imageCover: null,
            });
          }}
        >
          <i className="fas fa-plus"></i> Add New Category
        </button>
      </div>

      {/* Category Form */}
      <form className={Style.categoryForm} onSubmit={handleSubmit}>
        <div className={Style.formGroup}>
          <label>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className={Style.formGroup}>
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className={Style.formGroup}>
          <label>Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={Style.fileInput}
          />
        </div>

        <button type="submit" className={Style.submitButton}>
          {isEditing ? "Update Category" : "Add Category"}
        </button>
      </form>

      {/* Categories Grid */}
      <div className={Style.categoriesGrid}>
        {categories.map((category) => (
          <div key={category._id} className={Style.categoryCard}>
            <div className={Style.categoryImage}>
              <img src={category.imageCover} alt={category.name} />
            </div>
            <div className={Style.categoryInfo}>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <div className={Style.categoryMeta}>
                <span>{category.productsCount || 0} Products</span>
              </div>
            </div>
            <div className={Style.cardActions}>
              <button
                className={Style.editButton}
                onClick={() => handleEdit(category)}
              >
                <i className="fas fa-edit"></i> Edit
              </button>
              <button
                className={Style.deleteButton}
                onClick={() => handleDelete(category._id)}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
