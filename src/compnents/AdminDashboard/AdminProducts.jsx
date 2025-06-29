import React, { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
} from "../../services/adminApi";
import Style from "./AdminProducts.module.css";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaBox,
  FaTag,
  FaBoxes,
  FaDollarSign,
  FaImage,
  FaExclamationCircle,
  FaUpload,
} from "react-icons/fa";
import { toast } from "react-toastify";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    priceAfterDiscount: "",
    category: "",
    brand: "",
    stock: "",
    discount: "",
    isRentable: false,
    rentalPricePerDay: "",
    rentalDeposit: "",
    rentalStock: "",
    imageCover: null,
    images: [],
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [multipleImagePreviews, setMultipleImagePreviews] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (err) {
      console.error("Error loading brands:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      if (name === "imageCover") {
        const file = files[0];
        if (file) {
          setFormData((prev) => ({ ...prev, imageCover: file }));
          setImagePreview(URL.createObjectURL(file));
        }
      } else if (name === "images") {
        const fileList = Array.from(files);
        setFormData((prev) => ({ ...prev, images: fileList }));
        const previews = fileList.map((file) => URL.createObjectURL(file));
        setMultipleImagePreviews(previews);
      }
    } else {
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [name]: type === "checkbox" ? e.target.checked : value,
        };

        // حساب Price After Discount تلقائياً
        if (name === "price" || name === "discount") {
          const price =
            parseFloat(name === "price" ? value : updatedData.price) || 0;
          const discount =
            parseFloat(name === "discount" ? value : updatedData.discount) || 0;

          if (price > 0 && discount > 0) {
            const priceAfterDiscount = price - (price * discount) / 100;
            updatedData.priceAfterDiscount = priceAfterDiscount.toFixed(2);
          } else if (discount === 0) {
            updatedData.priceAfterDiscount = "";
          }
        }

        // Set default rental stock when isRentable is checked
        if (
          name === "isRentable" &&
          e.target.checked &&
          !updatedData.rentalStock
        ) {
          updatedData.rentalStock = updatedData.stock || "";
        }

        return updatedData;
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    // حساب discount percentage إذا كان موجود priceAfterDiscount و price
    let calculatedDiscount = "";
    if (product.price && product.priceAfterDiscount) {
      const discountAmount = product.price - product.priceAfterDiscount;
      calculatedDiscount = ((discountAmount / product.price) * 100).toFixed(0);
    }

    setFormData({
      title: product.title || product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      priceAfterDiscount: product.priceAfterDiscount?.toString() || "",
      category: product.category?._id || "",
      brand: product.brand?._id || product.brand || "",
      stock: product.stock?.toString() || "",
      discount: product.discount?.toString() || calculatedDiscount,
      isRentable: product.isRentable || false,
      rentalPricePerDay: product.rentalPricePerDay?.toString() || "",
      rentalDeposit: product.rentalDeposit?.toString() || "",
      rentalStock: product.rentalStock?.toString() || "",
      imageCover: null,
      images: [],
    });
    setImagePreview(product.imageCover);
    setMultipleImagePreviews(product.images || []);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من الحقول المطلوبة قبل الإرسال
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.category ||
      !formData.brand ||
      !formData.stock
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const formDataToSend = new FormData();

      // إضافة الحقول مع التحقق من القيم الفارغة
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("discount", formData.discount || 0);

      // إضافة rental fields
      formDataToSend.append("isRentable", formData.isRentable);
      if (formData.isRentable) {
        if (formData.rentalPricePerDay) {
          formDataToSend.append(
            "rentalPricePerDay",
            formData.rentalPricePerDay
          );
        }
        if (formData.rentalDeposit) {
          formDataToSend.append("rentalDeposit", formData.rentalDeposit);
        }
        if (formData.rentalStock) {
          formDataToSend.append("rentalStock", formData.rentalStock);
        }
      }

      // إضافة priceAfterDiscount فقط إذا كان له قيمة
      if (formData.priceAfterDiscount && formData.priceAfterDiscount !== "") {
        formDataToSend.append(
          "priceAfterDiscount",
          formData.priceAfterDiscount
        );
      }

      // Add images only if they exist
      if (formData.imageCover instanceof File) {
        formDataToSend.append("imageCover", formData.imageCover);
      }

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          if (image instanceof File) {
            formDataToSend.append("images", image);
          }
        });
      }

      let response;
      if (editingProduct) {
        // Log the data being sent
        console.log("Updating product with ID:", editingProduct._id);
        console.log("Form data being sent:");
        for (let [key, value] of formDataToSend.entries()) {
          console.log(key + ":", value);
        }

        // Update existing product
        response = await updateProduct(editingProduct._id, formDataToSend);

        if (response.data) {
          toast.success("Product updated successfully");
          // Immediately reload the products to show the update
          await loadProducts();
        }
      } else {
        // Create new product
        response = await createProduct(formDataToSend);
        if (response.data) {
          toast.success("Product added successfully");
          // Immediately reload the products to show the new product
          await loadProducts();
        }
      }

      // Reset form and state
      setFormData({
        title: "",
        description: "",
        price: "",
        priceAfterDiscount: "",
        category: "",
        brand: "",
        stock: "",
        discount: "",
        isRentable: false,
        rentalPricePerDay: "",
        rentalDeposit: "",
        rentalStock: "",
        imageCover: null,
        images: [],
      });
      setImagePreview(null);
      setMultipleImagePreviews([]);
      setEditingProduct(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(err.message || "Error saving product");
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        toast.success("Product deleted successfully");
        loadProducts();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className={Style.loading}>
        <div className={Style.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={Style.error}>
        <FaExclamationCircle />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={Style.productsContainer}>
      <div className={Style.header}>
        <h2>Products Management</h2>
        <button
          className={Style.addButton}
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              title: "",
              description: "",
              price: "",
              priceAfterDiscount: "",
              category: "",
              brand: "",
              stock: "",
              discount: "",
              isRentable: false,
              rentalPricePerDay: "",
              rentalDeposit: "",
              rentalStock: "",
              imageCover: null,
              images: [],
            });
            setImagePreview(null);
            setMultipleImagePreviews([]);
            setShowForm(true);
          }}
        >
          <FaPlus /> Add New Product
        </button>
      </div>

      {showForm && (
        <div className={Style.formOverlay}>
          <div className={Style.formContainer}>
            <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
            <form onSubmit={handleSubmit}>
              <div className={Style.formGroup}>
                <label>
                  <FaBox /> Product Title:
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={Style.formGroup}>
                <label>
                  <FaTag /> Description:
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={Style.formRow}>
                <div className={Style.formGroup}>
                  <label>
                    <FaDollarSign /> Price:
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={Style.formGroup}>
                  <label>
                    <FaDollarSign /> Price After Discount:
                  </label>
                  <input
                    type="number"
                    name="priceAfterDiscount"
                    value={formData.priceAfterDiscount}
                    onChange={handleInputChange}
                    readOnly
                    placeholder="يتم حسابه تلقائياً"
                    style={{
                      backgroundColor: "#f8f9fa",
                      cursor: "not-allowed",
                    }}
                  />
                  <small style={{ color: "#6c757d", fontSize: "12px" }}>
                    * يتم حسابه تلقائياً بناءً على السعر والخصم
                  </small>
                </div>

                <div className={Style.formGroup}>
                  <label>
                    <FaTag /> Discount (%):
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className={Style.formRow}>
                <div className={Style.formGroup}>
                  <label>
                    <FaTag /> Category:
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={Style.formGroup}>
                  <label>
                    <FaBoxes /> Brand:
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={Style.formRow}>
                <div className={Style.formGroup}>
                  <label>
                    <FaBoxes /> Stock:
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Rental Section */}
              <div className={Style.rentalSection}>
                <div className={Style.formGroup}>
                  <label className={Style.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="isRentable"
                      checked={formData.isRentable}
                      onChange={handleInputChange}
                    />
                    <span className={Style.checkmark}></span>
                    Is this product available for rental?
                  </label>
                </div>

                {formData.isRentable && (
                  <div className={Style.rentalFields}>
                    <div className={Style.formRow}>
                      <div className={Style.formGroup}>
                        <label>
                          <FaDollarSign /> Rental Price Per Day:
                        </label>
                        <input
                          type="number"
                          name="rentalPricePerDay"
                          value={formData.rentalPricePerDay}
                          onChange={handleInputChange}
                          required={formData.isRentable}
                          placeholder="Enter daily rental price"
                        />
                      </div>

                      <div className={Style.formGroup}>
                        <label>
                          <FaDollarSign /> Security Deposit:
                        </label>
                        <input
                          type="number"
                          name="rentalDeposit"
                          value={formData.rentalDeposit}
                          onChange={handleInputChange}
                          placeholder="Enter security deposit amount"
                        />
                      </div>

                      <div className={Style.formGroup}>
                        <label>
                          <FaBoxes /> Rental Stock:
                        </label>
                        <input
                          type="number"
                          name="rentalStock"
                          value={formData.rentalStock}
                          onChange={handleInputChange}
                          placeholder="Available quantity for rental"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={Style.formRow}>
                <div className={Style.formGroup}>
                  <label>
                    <FaImage /> Cover Image:
                  </label>
                  <div className={Style.imageUploadContainer}>
                    <input
                      type="file"
                      name="imageCover"
                      onChange={handleInputChange}
                      accept="image/*"
                      className={Style.fileInput}
                      id="imageCover"
                    />
                    <label htmlFor="imageCover" className={Style.uploadLabel}>
                      <FaUpload /> Choose Cover Image
                    </label>
                    {imagePreview && (
                      <div className={Style.imagePreview}>
                        <img src={imagePreview} alt="Cover preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={Style.formGroup}>
                <label>
                  <FaImage /> Product Images:
                </label>
                <div className={Style.imageUploadContainer}>
                  <input
                    type="file"
                    name="images"
                    onChange={handleInputChange}
                    accept="image/*"
                    multiple
                    className={Style.fileInput}
                    id="productImages"
                  />
                  <label htmlFor="productImages" className={Style.uploadLabel}>
                    <FaUpload /> Choose Product Images
                  </label>
                  <div className={Style.multipleImagePreviews}>
                    {multipleImagePreviews.map((preview, index) => (
                      <div key={index} className={Style.previewImage}>
                        <img src={preview} alt={`Preview ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={Style.formActions}>
                <button type="submit" className={Style.submitButton}>
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  className={Style.cancelButton}
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setImagePreview(null);
                    setMultipleImagePreviews([]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={Style.productsGrid}>
        {products.map((product) => (
          <div key={product._id} className={Style.productCard}>
            {/* Category and Brand Labels */}
            <div className={Style.productLabels}>
              <span className={Style.categoryLabel}>
                <FaTag /> {product.category?.name || "No Category"}
              </span>
              <span className={Style.brandLabel}>
                <FaBoxes /> {product.brand?.name || product.brand || "No Brand"}
              </span>
            </div>

            {/* Stock Status Badge */}
            <div
              className={`${Style.statusBadge} ${
                product.stock === 0
                  ? Style.outOfStock
                  : product.stock < 10
                  ? Style.lowStock
                  : ""
              }`}
            >
              {product.stock === 0
                ? "Out of Stock"
                : product.stock < 10
                ? "Low Stock"
                : "In Stock"}
            </div>

            {/* Rental Badge */}
            {product.isRentable && (
              <div className={Style.rentalBadge}>🏠 Rentable</div>
            )}

            <div className={Style.productImage}>
              {product.imageCover ? (
                <img
                  src={product.imageCover}
                  alt={product.title || product.name}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/200x200?text=No+Image";
                  }}
                />
              ) : (
                <div className={Style.noImage}>
                  <FaBox />
                  <span>No Image</span>
                </div>
              )}
            </div>

            <div className={Style.productInfo}>
              <h3>{product.title || product.name}</h3>
              <p className={Style.description}>{product.description}</p>

              <div className={Style.details}>
                <div className={Style.priceSection}>
                  {product.priceAfterDiscount ? (
                    <>
                      <span className={Style.price}>
                        <FaDollarSign /> ${product.priceAfterDiscount}
                      </span>
                      <span className={Style.discountPrice}>
                        <FaDollarSign /> ${product.price}
                      </span>
                    </>
                  ) : (
                    <span className={Style.price}>
                      <FaDollarSign /> ${product.price}
                    </span>
                  )}
                </div>
                <span className={Style.stock}>
                  <FaBoxes /> {product.stock}
                </span>
              </div>

              {/* Rental Information */}
              {product.isRentable && (
                <div className={Style.rentalInfo}>
                  <div className={Style.rentalPrice}>
                    <span className={Style.label}>Daily Rate:</span>
                    <span className={Style.value}>
                      <FaDollarSign /> {product.rentalPricePerDay || 0}/day
                    </span>
                  </div>
                  {product.rentalDeposit > 0 && (
                    <div className={Style.rentalDeposit}>
                      <span className={Style.label}>Deposit:</span>
                      <span className={Style.value}>
                        <FaDollarSign /> {product.rentalDeposit}
                      </span>
                    </div>
                  )}
                  <div className={Style.rentalStock}>
                    <span className={Style.label}>Rental Stock:</span>
                    <span className={Style.value}>
                      <FaBoxes /> {product.rentalStock || 0}
                    </span>
                  </div>
                </div>
              )}

              <div className={Style.actions}>
                <button
                  className={Style.editButton}
                  onClick={() => handleEdit(product)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className={Style.deleteButton}
                  onClick={() => handleDelete(product._id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
