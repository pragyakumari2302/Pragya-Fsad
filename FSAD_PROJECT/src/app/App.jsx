import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import AdminDashboard from "../pages/AdminDashboard";
import { routes } from "./routes";
import { AuthProvider, useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontSize: "16px", color: "red", backgroundColor: "white", zIndex: 9999, position: "relative" }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()} style={{ padding: "10px", marginTop: "10px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// A wrapper to handle the catch-all redirect based on auth status
const CatchAllRoute = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/" : "/login"} replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {routes.map((r, i) => (
                <Route key={i} path={r.path} element={r.element} />
              ))}
            </Route>

            <Route path="*" element={<CatchAllRoute />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}