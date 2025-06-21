import React, { useContext, useState } from "react";
import Style from "./Login.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  let { setUserLogin } = useContext(UserContext);
  let navigate = useNavigate();
  const [err, setError] = useState(null);
  const [isloading, setIsloading] = useState(false);

  async function loginSubmit(values) {
    setIsloading(true);
    setError(null);

    try {
      let { data } = await axios.post(
        "https://tech-shop-api-e0bd81e562d4.herokuapp.com/api/v1/auth/login",
        values
      );

      if (data.message === "success") {
        setIsloading(false);
        setUserLogin(data.token, data.user);
        setError(null);
        toast.success("Login successful! Welcome to ElectronixHub", {
          duration: 3000,
          position: "top-center",
          style: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
          },
        });
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
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

  let passwordRegex = /^.{6,}$/; // Simplified password regex - at least 6 characters

  let validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  let formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: loginSubmit,
  });

  return (
    <div className={Style.loginContainer}>
      <div className={Style.loginBox}>
        <div className={Style.loginHeader}>
          <h2>Welcome to ElectronixHub</h2>
          <p>Sign in to continue</p>
        </div>
        <form onSubmit={formik.handleSubmit}>
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
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {formik.errors.password && formik.touched.password ? (
              <div className={Style.errorMessage}>{formik.errors.password}</div>
            ) : null}
          </div>

          <div className={Style.formActions}>
            {isloading ? (
              <button className={Style.loginButton} disabled>
                <i className="fa-solid fa-spinner fa-spin"></i> Loading...
              </button>
            ) : (
              <button
                disabled={!(formik.dirty && formik.isValid)}
                className={Style.loginButton}
                type="submit"
              >
                Sign In
              </button>
            )}
          </div>

          <div className={Style.registerLink}>
            Don't have an account? <Link to="/register">Create Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
