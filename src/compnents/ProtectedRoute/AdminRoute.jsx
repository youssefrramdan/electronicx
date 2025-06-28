import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";

export default function AdminRoute({ children }) {
  const { userData } = useContext(UserContext);

  // Check if user is logged in and is an admin
  if (localStorage.getItem("userToken") && userData?.role === "admin") {
    return children;
  } else {
    // Redirect to login if not logged in, or home if logged in but not admin
    return <Navigate to={localStorage.getItem("userToken") ? "/" : "/login"} />;
  }
}
