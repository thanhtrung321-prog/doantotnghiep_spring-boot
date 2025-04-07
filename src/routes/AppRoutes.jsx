import { Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Silider from "../components/Silider";
import ServiceList from "../pages/Services/ServiceList";
import Footer from "../components/Footer";
import Collection from "../pages/collection/Collection";
import BookingPage from "../pages/Booking/BookingPage";
import Contact from "../pages/contact/Contact";
import Header from "../components/Header";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Trang chủ với Header, Navbar, Silider và Footer */}
      <Route
        path="/"
        element={
          <>
            <Header />
            <Navbar />
            <Silider />
            <Footer />
          </>
        }
      />
      {/* Trang Dịch Vụ */}
      <Route
        path="/services"
        element={
          <>
            <Navbar />
            <ServiceList />
            <BookingPage />
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
      {/* Trang Bảng Giá */}
      <Route
        path="/table_price"
        element={
          <>
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
            <Navbar />
            <Contact />
            <Footer />
          </>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
