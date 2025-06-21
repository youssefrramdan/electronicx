import { render } from "react-dom";
import "./App.css";
import { Offline, Online } from "react-detect-offline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Wishlist from "./compnents/Wishlist/Wishlist";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./compnents/Layout/Layout";
import Register from "./compnents/Register/Register";
import Login from "./compnents/Login/Login";
import Home from "./compnents/Home/Home";
import Cart from "./compnents/Cart/Cart";
import Brands from "./compnents/Brands/Brands";
import Product from "./compnents/Product/Product";
import Categories from "./compnents/Categories/Categories";
import Notfound from "./compnents/Notfound/Notfound";
import CounterContextProvider from "./Context/CounterContext";
import CartContextProvider from "./Context/CartContext";
import ProductDetails from "./compnents/ProductDetails/ProductDetails";
import { UserContext } from "./Context/UserContext";
import ProtectedRoute from "./compnents/ProtectedRoute/ProtectedRoute";
import { useContext, useEffect } from "react";
import FeaturedProducts from "./compnents/FeaturedProducts/FeaturedProducts";
import { Toaster } from "react-hot-toast";
import PaymentInfo from "./compnents/PaymentInfo/PaymentInfo";
import Allorders from "./compnents/Allorders/Allorders";
import SearchResults from "./compnents/SearchResults/SearchResults";
import PaymentSuccess from "./compnents/PaymentSuccess/PaymentSuccess";
import axios from "axios";

// Set up axios interceptor to automatically add authorization header
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        path: "cart",
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: "brands",
        element: (
          <ProtectedRoute>
            <Brands />
          </ProtectedRoute>
        ),
      },
      {
        path: "products",
        element: (
          <ProtectedRoute>
            <Product />
          </ProtectedRoute>
        ),
      },
      {
        path: "search",
        element: (
          <ProtectedRoute>
            <SearchResults />
          </ProtectedRoute>
        ),
      },
      {
        path: "Productdetails/:id",
        element: (
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "PaymentInfo/:id",
        element: (
          <ProtectedRoute>
            <PaymentInfo />
          </ProtectedRoute>
        ),
      },
      {
        path: "allorders",
        element: (
          <ProtectedRoute>
            <Allorders />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment-success",
        element: (
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        ),
      },
      { path: "wishlist", element: <Wishlist /> },
      {
        path: "categories",
        element: (
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <Notfound /> },
    ],
  },
]);

function App() {
  let { setUserToken } = useContext(UserContext);
  useEffect(() => {
    if (localStorage.getItem("userToken") !== null) {
      setUserToken(localStorage.getItem("userToken"));
    }
  }, []);

  function notifiy() {
    toast.warn("You are offline", {
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      icon: <i className="fa fa-wifi text-white"></i>,
    });
  }
  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
