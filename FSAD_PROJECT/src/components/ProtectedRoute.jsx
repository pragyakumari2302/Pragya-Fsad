import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Force required password change
  if (user?.passwordChangeRequired && location.pathname !== "/profile") {
    return <Navigate to="/profile" state={{ showPasswordChange: true }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Role not allowed
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
