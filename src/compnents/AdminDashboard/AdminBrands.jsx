import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Style from "./AdminBrands.module.css";

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: null,
  });

  const API_BASE_URL =
    "https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1";

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/brands`);
      if (response.data.status === "success") {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Error loading brands");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);

      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      }

      let response;
      if (editingBrand) {
        // Update brand
        response = await axios.put(
          `${API_BASE_URL}/brands/${editingBrand._id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Create brand
        response = await axios.post(`${API_BASE_URL}/brands`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.status === "success") {
        toast.success(
          editingBrand
            ? "Brand updated successfully"
            : "Brand created successfully"
        );
        fetchBrands();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error(error.response?.data?.message || "Error saving brand");
    }
  };

  const handleDelete = async (brandId) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) {
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.delete(`${API_BASE_URL}/brands/${brandId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        toast.success("Brand deleted successfully");
        fetchBrands();
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error(error.response?.data?.message || "Error deleting brand");
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: null,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormData({
      name: "",
      logo: null,
    });
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={Style.adminBrands}>
      {/* Header */}
      <div className={Style.pageHeader}>
        <div className={Style.headerLeft}>
          <h1>
            <i className="fas fa-tags"></i>
            Brand Management
          </h1>
          <p>Manage all brands in your store</p>
        </div>
        <div className={Style.headerRight}>
          <button onClick={() => setShowModal(true)} className={Style.addBtn}>
            <i className="fas fa-plus"></i>
            Add New Brand
          </button>
          <button onClick={fetchBrands} className={Style.refreshBtn}>
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={Style.statsGrid}>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <i className="fas fa-tags"></i>
          </div>
          <div className={Style.statInfo}>
            <h3>{brands.length}</h3>
            <p>Total Brands</p>
          </div>
        </div>
        <div className={Style.statCard}>
          <div className={Style.statIcon}>
            <i className="fas fa-search"></i>
          </div>
          <div className={Style.statInfo}>
            <h3>{filteredBrands.length}</h3>
            <p>Search Results</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={Style.searchSection}>
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

      {/* Brands Grid */}
      <div className={Style.brandsContainer}>
        {loading ? (
          <div className={Style.loading}>
            <div className={Style.spinner}></div>
            <p>Loading brands...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className={Style.emptyState}>
            <i className="fas fa-tags"></i>
            <h3>No brands found</h3>
            <p>
              {searchTerm
                ? "No brands match your search criteria"
                : "Start by adding your first brand"}
            </p>
          </div>
        ) : (
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
                </div>
                <div className={Style.brandInfo}>
                  <h3>{brand.name}</h3>
                  <p className={Style.brandSlug}>{brand.slug}</p>
                  <div className={Style.brandMeta}>
                    <span className={Style.createdDate}>
                      <i className="fas fa-calendar"></i>
                      {formatDate(brand.createdAt)}
                    </span>
                  </div>
                </div>
                <div className={Style.brandActions}>
                  <button
                    onClick={() => handleEdit(brand)}
                    className={Style.editBtn}
                    title="Edit Brand"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(brand._id)}
                    className={Style.deleteBtn}
                    title="Delete Brand"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className={Style.modalOverlay} onClick={handleCloseModal}>
          <div className={Style.modal} onClick={(e) => e.stopPropagation()}>
            <div className={Style.modalHeader}>
              <h3>{editingBrand ? "Edit Brand" : "Add New Brand"}</h3>
              <button onClick={handleCloseModal} className={Style.closeBtn}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className={Style.modalForm}>
              <div className={Style.formGroup}>
                <label>Brand Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter brand name"
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Brand Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.files[0] })
                  }
                />
                <small>Upload a logo for the brand (optional)</small>
              </div>
              <div className={Style.modalActions}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={Style.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={Style.submitBtn}>
                  {editingBrand ? "Update Brand" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
