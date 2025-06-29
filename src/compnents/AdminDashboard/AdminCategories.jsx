import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";
import Style from "./AdminCategories.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTag,
  FaImage,
  FaFileAlt,
  FaBoxes,
  FaSave,
  FaTimes,
  FaEye,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";

// Create axios instance for categories
const categoryApi = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
});

// Add auth interceptor
categoryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
      setLoading(true);
      const response = await categoryApi.get("/categories");
      setCategories(response.data.data || []);

      if (categories.length === 0) {
        toast.info("No categories found. Create your first category!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error(err.response?.data?.message || "Failed to fetch categories", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
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
    setImagePreview(category.imageCover);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await categoryApi.delete(`/categories/${categoryId}`);
        toast.success("Category deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        fetchCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        toast.error(
          err.response?.data?.message || "Failed to delete category",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      imageCover: file,
    });

    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Category name is required!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (formData.description && formData.description.length < 30) {
      toast.error("Description must be at least 30 characters long!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Create FormData
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name.trim());
    if (formData.description) {
      formDataToSend.append("description", formData.description.trim());
    }
    if (formData.imageCover) {
      formDataToSend.append("imageCover", formData.imageCover);
    }

    try {
      setSubmitting(true);

      if (isEditing && selectedCategory) {
        // Update category
        await categoryApi.put(
          `/categories/${selectedCategory._id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Category updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Create new category
        await categoryApi.post("/categories", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Category created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      await fetchCategories();
      resetForm();
    } catch (err) {
      console.error("Error saving category:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to save category";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedCategory(null);
    setShowForm(false);
    setImagePreview(null);
    setSubmitting(false);
    setFormData({
      name: "",
      description: "",
      imageCover: null,
    });
  };

  if (loading) {
    return (
      <div className={Style.loading}>
        <FaSpinner className={Style.loadingSpinner} />
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className={Style.adminCategories}>
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Header Section */}
      <div className={Style.header}>
        <div className={Style.headerContent}>
          <h2>
            <FaTag className={Style.headerIcon} />
            Manage Categories
          </h2>
          <p className={Style.headerSubtitle}>
            Organize your products with categories
          </p>
        </div>
        <button
          className={Style.addButton}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <FaPlus /> Add New Category
        </button>
      </div>

      {/* Statistics Cards */}
      <div className={Style.statsGrid}>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <FaTag />
          </div>
          <div className={Style.statInfo}>
            <h3>{categories.length}</h3>
            <p>Total Categories</p>
          </div>
        </div>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <FaBoxes />
          </div>
          <div className={Style.statInfo}>
            <h3>
              {categories.reduce(
                (acc, cat) => acc + (cat.productsCount || 0),
                0
              )}
            </h3>
            <p>Total Products</p>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <div className={Style.modalHeader}>
              <h3>{isEditing ? "Edit Category" : "Add New Category"}</h3>
              <button
                className={Style.closeButton}
                onClick={resetForm}
                disabled={submitting}
              >
                <FaTimes />
              </button>
            </div>

            <form className={Style.categoryForm} onSubmit={handleSubmit}>
              <div className={Style.formRow}>
                <div className={Style.formGroup}>
                  <label>
                    <FaTag /> Category Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter category name"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className={Style.formGroup}>
                <label>
                  <FaFileAlt /> Description:
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter category description (minimum 30 characters)"
                  rows="4"
                  disabled={submitting}
                />
                {formData.description && (
                  <small className={Style.charCount}>
                    {formData.description.length}/30 characters
                    {formData.description.length < 30 && " (minimum required)"}
                  </small>
                )}
              </div>

              <div className={Style.formGroup}>
                <label>
                  <FaImage /> Cover Image:
                </label>
                <div className={Style.imageUploadContainer}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={Style.fileInput}
                    id="categoryImage"
                    disabled={submitting}
                  />
                  <label htmlFor="categoryImage" className={Style.uploadLabel}>
                    <FaImage /> Choose Category Image
                  </label>
                  {imagePreview && (
                    <div className={Style.imagePreview}>
                      <img src={imagePreview} alt="Category preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className={Style.formActions}>
                <button
                  type="submit"
                  className={Style.submitButton}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className={Style.spinner} />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <FaSave />{" "}
                      {isEditing ? "Update Category" : "Create Category"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className={Style.cancelButton}
                  onClick={resetForm}
                  disabled={submitting}
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className={Style.categoriesGrid}>
        {categories.map((category) => (
          <div key={category._id} className={Style.categoryCard}>
            <div className={Style.categoryImageContainer}>
              <img
                src={
                  category.imageCover ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={category.name}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
              <div className={Style.imageOverlay}>
                <button
                  className={Style.previewButton}
                  onClick={() => window.open(category.imageCover, "_blank")}
                >
                  <FaEye />
                </button>
              </div>
            </div>

            <div className={Style.categoryInfo}>
              <h3>{category.name}</h3>
              <p className={Style.description}>
                {category.description || "No description available"}
              </p>

              <div className={Style.categoryMeta}>
                <div className={Style.metaItem}>
                  <FaBoxes className={Style.metaIcon} />
                  <span>{category.productsCount || 0} Products</span>
                </div>
              </div>
            </div>

            <div className={Style.cardActions}>
              <button
                className={Style.editButton}
                onClick={() => handleEdit(category)}
              >
                <FaEdit /> Edit
              </button>
              <button
                className={Style.deleteButton}
                onClick={() => handleDelete(category._id)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className={Style.emptyState}>
          <FaTag className={Style.emptyIcon} />
          <h3>No Categories Found</h3>
          <p>Start by creating your first category to organize your products</p>
          <button
            className={Style.addButton}
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <FaPlus /> Create First Category
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
