import React, { useState } from "react";
import Style from "./Register.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
  let navigate = useNavigate();
  const [err, setError] = useState(null);
  const [isloading, setIsloading] = useState(false);

  async function registerSubmit(values) {
    setIsloading(true);
    setError(null);

    try {
      let { data } = await axios.post(
        "https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/auth/signup",
        values
      );

      if (data.message === "success") {
        setIsloading(false);
        setError(null);
        toast.success(
          "Account created successfully! Please login to continue",
          {
            duration: 4000,
            position: "top-center",
            style: {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
            },
          }
        );
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
        style: {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
        },
      });
      setIsloading(false);
    }
  }

  let validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    passwordConfirm: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  let formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
    validationSchema: validationSchema,
    onSubmit: registerSubmit,
  });

  return (
    <div className={Style.registerContainer}>
      <div className={Style.registerBox}>
        <div className={Style.registerHeader}>
          <h2>Create ElectronixHub Account</h2>
          <p>Join our electronics community</p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className={Style.formGroup}>
            <label htmlFor="name">
              <i className="fas fa-user"></i> Full Name
            </label>
            <input
              value={formik.values.name}
              type="text"
              id="name"
              className={Style.formControl}
              name="name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your full name"
              autoComplete="name"
            />
            {formik.errors.name && formik.touched.name ? (
              <div className={Style.errorMessage}>{formik.errors.name}</div>
            ) : null}
          </div>

          <div className={Style.formGroup}>
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Email
            </label>
            <input
              value={formik.values.email}
              type="email"
              id="email"
              className={Style.formControl}
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {formik.errors.email && formik.touched.email ? (
              <div className={Style.errorMessage}>{formik.errors.email}</div>
            ) : null}
          </div>

          <div className={Style.formGroup}>
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Password
            </label>
            <input
              value={formik.values.password}
              type="password"
              id="password"
              className={Style.formControl}
              name="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Create a password"
              autoComplete="new-password"
            />
            {formik.errors.password && formik.touched.password ? (
              <div className={Style.errorMessage}>{formik.errors.password}</div>
            ) : null}
          </div>

          <div className={Style.formGroup}>
            <label htmlFor="passwordConfirm">
              <i className="fas fa-lock"></i> Confirm Password
            </label>
            <input
              value={formik.values.passwordConfirm}
              type="password"
              id="passwordConfirm"
              className={Style.formControl}
              name="passwordConfirm"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            {formik.errors.passwordConfirm && formik.touched.passwordConfirm ? (
              <div className={Style.errorMessage}>
                {formik.errors.passwordConfirm}
              </div>
            ) : null}
          </div>

          <div className={Style.formActions}>
            {isloading ? (
              <button className={Style.registerButton} disabled>
                <i className="fa-solid fa-spinner fa-spin"></i> Creating
                Account...
              </button>
            ) : (
              <button
                disabled={!(formik.dirty && formik.isValid)}
                className={Style.registerButton}
                type="submit"
              >
                Create Account
              </button>
            )}
          </div>

          <div className={Style.loginLink}>
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
