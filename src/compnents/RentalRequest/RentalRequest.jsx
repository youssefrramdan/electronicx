import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { rentalApi } from "../../services/rentalApi";
import axios from "axios";
import Style from "./RentalRequest.module.css";

const RentalRequest = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: "",
      phone: "",
      address: "",
      idCardNumber: "",
    },
    requestedStartDate: "",
    requestedEndDate: "",
    idCardFront: null,
    idCardBack: null,
  });

  const [rentalCalculation, setRentalCalculation] = useState({
    days: 0,
    totalPrice: 0,
    dailyRate: 0,
    depositAmount: 0,
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    calculateRental();
  }, [formData.requestedStartDate, formData.requestedEndDate, product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/products/${productId}`
      );
      if (response.data.data) {
        const productData = response.data.data;
        if (!productData.isRentable) {
          toast.error("This product is not available for rental");
          navigate("/");
          return;
        }
        setProduct(productData);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Error loading product data");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const calculateRental = () => {
    if (formData.requestedStartDate && formData.requestedEndDate && product) {
      const startDate = new Date(formData.requestedStartDate);
      const endDate = new Date(formData.requestedEndDate);

      if (endDate > startDate) {
        const timeDiff = endDate.getTime() - startDate.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const dailyRate = product.rentalPricePerDay || 0;
        const totalPrice = dailyRate * days;
        const depositAmount = product.rentalDeposit || 0;

        setRentalCalculation({
          days,
          totalPrice,
          dailyRate,
          depositAmount,
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("personalInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const validateForm = () => {
    const {
      personalInfo,
      requestedStartDate,
      requestedEndDate,
      idCardFront,
      idCardBack,
    } = formData;

    if (
      !personalInfo.fullName ||
      !personalInfo.phone ||
      !personalInfo.address ||
      !personalInfo.idCardNumber
    ) {
      toast.error("Please fill in all personal information");
      return false;
    }

    if (!requestedStartDate || !requestedEndDate) {
      toast.error("Please select rental dates");
      return false;
    }

    const startDate = new Date(requestedStartDate);
    const endDate = new Date(requestedEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error("Start date cannot be in the past");
      return false;
    }

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return false;
    }

    if (!idCardFront || !idCardBack) {
      toast.error("Please upload ID card images (front and back)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append("productId", productId);
      formDataToSend.append(
        "personalInfo[fullName]",
        formData.personalInfo.fullName
      );
      formDataToSend.append("personalInfo[phone]", formData.personalInfo.phone);
      formDataToSend.append(
        "personalInfo[address]",
        formData.personalInfo.address
      );
      formDataToSend.append(
        "personalInfo[idCardNumber]",
        formData.personalInfo.idCardNumber
      );
      formDataToSend.append("requestedStartDate", formData.requestedStartDate);
      formDataToSend.append("requestedEndDate", formData.requestedEndDate);
      formDataToSend.append("idCardFront", formData.idCardFront);
      formDataToSend.append("idCardBack", formData.idCardBack);

      const response = await rentalApi.createRentalRequest(formDataToSend);

      if (response.status === "success") {
        toast.success(
          "Rental request submitted successfully! It will be reviewed soon"
        );
        setTimeout(() => {
          navigate("/my-rentals");
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting rental request:", error);
      const errorMessage =
        error.response?.data?.message || "Error submitting rental request";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={Style.loading}>
        <div className={Style.spinner}></div>
        <p>Loading product data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={Style.error}>
        <h2>Product not found</h2>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className={Style.rentalRequest}>
      <div className={Style.container}>
        <div className={Style.header}>
          <button className={Style.backButton} onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
          <h1>Product Rental Request</h1>
        </div>

        <div className={Style.content}>
          {/* Product Info */}
          <div className={Style.productInfo}>
            <div className={Style.productImage}>
              <img
                src={product.imageCover || product.images?.[0]}
                alt={product.title || product.name}
              />
            </div>
            <div className={Style.productDetails}>
              <h2>{product.title || product.name}</h2>
              <div className={Style.rentalInfo}>
                <div className={Style.priceItem}>
                  <span className={Style.label}>Daily Rate:</span>
                  <span className={Style.value}>
                    {product.rentalPricePerDay} EGP
                  </span>
                </div>
                {product.rentalDeposit > 0 && (
                  <div className={Style.priceItem}>
                    <span className={Style.label}>Deposit:</span>
                    <span className={Style.value}>
                      {product.rentalDeposit} EGP
                    </span>
                  </div>
                )}
                <div className={Style.priceItem}>
                  <span className={Style.label}>Available for Rental:</span>
                  <span className={Style.value}>
                    {product.rentalStock || product.stock} pieces
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Form */}
          <form className={Style.rentalForm} onSubmit={handleSubmit}>
            <div className={Style.section}>
              <h3>Personal Information</h3>
              <div className={Style.formGrid}>
                <div className={Style.formGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="personalInfo.fullName"
                    value={formData.personalInfo.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="personalInfo.phone"
                    value={formData.personalInfo.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>Address *</label>
                  <textarea
                    name="personalInfo.address"
                    value={formData.personalInfo.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    rows="3"
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>ID Card Number *</label>
                  <input
                    type="text"
                    name="personalInfo.idCardNumber"
                    value={formData.personalInfo.idCardNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your ID card number"
                    required
                  />
                </div>
              </div>
            </div>

            <div className={Style.section}>
              <h3>ID Card Images</h3>
              <div className={Style.formGrid}>
                <div className={Style.formGroup}>
                  <label>Front of ID Card *</label>
                  <input
                    type="file"
                    name="idCardFront"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                  />
                  {formData.idCardFront && (
                    <div className={Style.imagePreview}>
                      <img
                        src={URL.createObjectURL(formData.idCardFront)}
                        alt="ID Front"
                      />
                    </div>
                  )}
                </div>
                <div className={Style.formGroup}>
                  <label>Back of ID Card *</label>
                  <input
                    type="file"
                    name="idCardBack"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                  />
                  {formData.idCardBack && (
                    <div className={Style.imagePreview}>
                      <img
                        src={URL.createObjectURL(formData.idCardBack)}
                        alt="ID Back"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={Style.section}>
              <h3>Rental Period</h3>
              <div className={Style.formGrid}>
                <div className={Style.formGroup}>
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="requestedStartDate"
                    value={formData.requestedStartDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className={Style.formGroup}>
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="requestedEndDate"
                    value={formData.requestedEndDate}
                    onChange={handleInputChange}
                    min={
                      formData.requestedStartDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Rental Calculation */}
            {rentalCalculation.days > 0 && (
              <div className={Style.calculation}>
                <h3>Cost Details</h3>
                <div className={Style.calculationGrid}>
                  <div className={Style.calcItem}>
                    <span className={Style.label}>Number of Days:</span>
                    <span className={Style.value}>
                      {rentalCalculation.days} days
                    </span>
                  </div>
                  <div className={Style.calcItem}>
                    <span className={Style.label}>Daily Rate:</span>
                    <span className={Style.value}>
                      {rentalCalculation.dailyRate} EGP
                    </span>
                  </div>
                  <div className={Style.calcItem}>
                    <span className={Style.label}>Total Rental:</span>
                    <span className={Style.value}>
                      {rentalCalculation.totalPrice} EGP
                    </span>
                  </div>
                  <div className={Style.calcItem}>
                    <span className={Style.label}>Deposit:</span>
                    <span className={Style.value}>
                      {rentalCalculation.depositAmount} EGP
                    </span>
                  </div>
                  <div className={`${Style.calcItem} ${Style.total}`}>
                    <span className={Style.label}>Total Required:</span>
                    <span className={Style.value}>
                      {rentalCalculation.totalPrice +
                        rentalCalculation.depositAmount}{" "}
                      EGP
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className={Style.submitSection}>
              <button
                type="submit"
                className={Style.submitButton}
                disabled={submitting || rentalCalculation.days === 0}
              >
                {submitting ? (
                  <>
                    <div className={Style.spinner}></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Submit Rental Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RentalRequest;
