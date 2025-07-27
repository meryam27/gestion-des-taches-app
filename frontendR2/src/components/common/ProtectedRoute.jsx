import React from "react";
import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ role, children }) => {
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token || !userRole) {
    return <Navigate to="/login" />;
  }
  if (userRole != role) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;
