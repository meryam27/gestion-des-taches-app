import React from "react";
import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ role, children }) => {
  const userData = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (!token || !userData) {
    return <Navigate to="/api/auth/login" />;
  }
  const user = JSON.parse(userData);
  if (user.role != role) {
    return <Navigate to="/api/auth/login" />;
  }
  return children;
};

export default ProtectedRoute;
