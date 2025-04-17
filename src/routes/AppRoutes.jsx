import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ServiceList from "../pages/Services/ServiceList";
import Footer from "../components/Footer";
import Collection from "../pages/collection/Collection";
import BookingPage from "../pages/Booking/BookingPage";
import Header from "../components/Header";
import TablePrice from "../pages/tableprice/TablePrice";
import SalonInfo from "../pages/Salon/Saloninfo";
import About from "../pages/about/about";
import Contact from "../pages/contact/Contact";
import Profileuser from "../pages/profile/Profileuser";

// Import các Dashboard
import CustomerDashboard from "../pages/Dashboard/CustomerDashboard";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import StaffDashboard from "../pages/Dashboard/StaffDashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/admin/Dashboard/homeadmin/Profile";

// Component ProtectedRoute để bảo vệ các route dựa trên vai trò
const ProtectedRoute = ({ allowedRoles, children }) => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  // Kiểm tra xem người dùng đã đăng nhập và có vai trò phù hợp không
  if (!token || !user.role || !allowedRoles.includes(user.role.toUpperCase())) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Trang chủ - Dành cho USER */}
      <Route path="/" element={<CustomerDashboard />} />

      {/* Trang Dịch Vụ */}
      <Route
        path="/services"
        element={
          <>
            <Navbar />
            <ServiceList />
            <Footer />
          </>
        }
      />

      {/* Trang Mẫu Tóc */}
      <Route
        path="/collection"
        element={
          <>
            <Navbar />
            <Collection />
            <Footer />
          </>
        }
      />

      {/* Trang Liên Hệ */}
      <Route
        path="/about"
        element={
          <>
            <Header />
            <Navbar />
            <About />
            <SalonInfo />
            <Footer />
          </>
        }
      />

      {/* Trang Bảng Giá */}
      <Route
        path="/tableprice"
        element={
          <>
            <Header />
            <Navbar />
            <TablePrice />
            <Footer />
          </>
        }
      />
      {/*  trang booking  */}
      <Route
        path="/booking"
        element={
          <>
            <Header />
            <Navbar />
            <BookingPage />
            <Footer />
          </>
        }
      />

      {/* Trang Liên Hệ */}
      <Route
        path="/contact"
        element={
          <>
            <Header />
            <Navbar />
            <Contact />
            <Footer />
          </>
        }
      />

      {/* Trang Profile - Bảo vệ cho USER, STAFF, ADMIN */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["USER", "STAFF", "ADMIN"]}>
            <Header />
            <Navbar />
            <Profileuser />
            <Footer />
          </ProtectedRoute>
        }
      />

      {/* Trang Admin - Bảo vệ cho ADMIN */}
      <Route
        path="/admin/*" // Dùng wildcard để bao gồm tất cả sub-route
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Trang Staff - Bảo vệ cho STAFF */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      {/* Trang Đăng Nhập */}
      <Route path="/login" element={<Login />} />

      {/* Trang Đăng Ký */}
      <Route path="/register" element={<Register />} />
      {/* Trang Đặt Lịch */}

      {/* Route mặc định khi không khớp */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
