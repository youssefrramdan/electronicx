import React, { useContext, useState } from "react";
import Style from "./PaymentInfo.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../../Context/CartContext";
import { OrderContext } from "../../Context/OrderContext";
import { UserContext } from "../../Context/UserContext";
import toast from "react-hot-toast";

export default function PaymentInfo() {
  const { id: cartId } = useParams();
  const navigate = useNavigate();
  const { userToken } = useContext(UserContext);
  const { onlinePayment } = useContext(CartContext);
  const { createCashOrder, createOnlinePayment, loading } =
    useContext(OrderContext);

  const [paymentMethod, setPaymentMethod] = useState("online");

  async function handleSubmit(values) {
    const shippingAddress = {
      city: values.city,
      street: values.details,
      phone: values.phone,
    };

    try {
      if (paymentMethod === "cash") {
        // Create cash order
        const result = await createCashOrder(cartId, shippingAddress);
        if (result.success) {
          toast.success(
            "Order created successfully! We will deliver it soon.",
            {
              duration: 4000,
              position: "top-center",
            }
          );
          navigate("/allorders");
        }
      } else {
        // Create online payment session
        const result = await createOnlinePayment(cartId, shippingAddress);
        if (result.success) {
          // Redirect to Stripe checkout
          window.location.href = result.data.session.url;
        }
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("Failed to process payment. Please try again.", {
        duration: 4000,
        position: "top-center",
      });
    }
  }

  let phoneRegex = /^01[0125][0-9]{8}$/;
  let validationSchema = Yup.object({
    details: Yup.string().required("Address details are required"),
    phone: Yup.string()
      .matches(phoneRegex, "Please enter a valid Egyptian phone number")
      .required("Phone number is required"),
    city: Yup.string().required("City is required"),
  });

  let formik = useFormik({
    initialValues: {
      details: "",
      phone: "",
      city: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  if (!userToken) {
    return (
      <div className={Style.authRequired}>
        <h3>Please login to continue with payment</h3>
        <button
          onClick={() => navigate("/login")}
          className={Style.loginButton}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={Style.paymentContainer}>
      <div className="container">
        <div className={Style.paymentCard}>
          <div className={Style.header}>
            <h2>Payment & Shipping Information</h2>
            <p>
              Please provide your shipping details and choose payment method
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className={Style.paymentForm}>
            {/* Payment Method Selection */}
            <div className={Style.paymentMethods}>
              <h4>Choose Payment Method</h4>
              <div className={Style.methodOptions}>
                <label className={Style.methodOption}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className={Style.methodCard}>
                    <i className="fas fa-credit-card"></i>
                    <span>Online Payment</span>
                    <small>Pay securely with your card</small>
                  </div>
                </label>

                <label className={Style.methodOption}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className={Style.methodCard}>
                    <i className="fas fa-money-bill-wave"></i>
                    <span>Cash on Delivery</span>
                    <small>Pay when you receive</small>
                  </div>
                </label>
              </div>
            </div>

            {/* Shipping Address Form */}
            <div className={Style.shippingSection}>
              <h4>Shipping Address</h4>

              <div className={Style.formGroup}>
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${Style.formInput} ${
                    formik.errors.city && formik.touched.city ? Style.error : ""
                  }`}
                  placeholder="Enter your city"
                />
                {formik.errors.city && formik.touched.city && (
                  <div className={Style.errorMessage}>{formik.errors.city}</div>
                )}
              </div>

              <div className={Style.formGroup}>
                <label htmlFor="details">Street Address *</label>
                <textarea
                  id="details"
                  name="details"
                  value={formik.values.details}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${Style.formInput} ${Style.textarea} ${
                    formik.errors.details && formik.touched.details
                      ? Style.error
                      : ""
                  }`}
                  placeholder="Enter your detailed address (street, building, apartment)"
                  rows="3"
                />
                {formik.errors.details && formik.touched.details && (
                  <div className={Style.errorMessage}>
                    {formik.errors.details}
                  </div>
                )}
              </div>

              <div className={Style.formGroup}>
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${Style.formInput} ${
                    formik.errors.phone && formik.touched.phone
                      ? Style.error
                      : ""
                  }`}
                  placeholder="01XXXXXXXXX"
                />
                {formik.errors.phone && formik.touched.phone && (
                  <div className={Style.errorMessage}>
                    {formik.errors.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className={Style.submitSection}>
              <button
                type="submit"
                disabled={loading || !formik.isValid}
                className={`${Style.submitBtn} ${
                  paymentMethod === "online" ? Style.onlineBtn : Style.cashBtn
                }`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === "online" ? (
                      <>
                        <i className="fas fa-credit-card"></i>
                        Pay Now
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Place Order
                      </>
                    )}
                  </>
                )}
              </button>

              <p className={Style.securityNote}>
                <i className="fas fa-shield-alt"></i>
                Your payment information is secure and encrypted
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
