import { Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Silider from "../components/Silider";
import ServiceList from "../pages/Services/ServiceList";
import Footer from "../components/Footer";
import Collection from "../pages/collection/Collection";
import BookingPage from "../pages/Booking/BookingPage";
import Header from "../components/Header";
import ServiceOverring from "../pages/home/ServiceOverring";
import TablePrice from "../pages/tableprice/TablePrice";
import SalonInfo from "../pages/Salon/Saloninfo";
import About from "../pages/about/about";
import Contact from "../pages/contact/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profileuser from "../pages/profile/Profileuser";
import Footeradmin from "../pages/admin/Dashboard/footeradmin/footeradmin";
import HeaderAdmin from "../pages/admin/Dashboard/headeradmin/headeradmin";
import Dashboard from "../pages/admin/Dashboard/homeadmin/Dashboard";
import Bookings from "../pages/admin/Dashboard/homeadmin/Bookings";
import Categories from "../pages/admin/Dashboard/homeadmin/Categories";
import Payments from "../pages/admin/Dashboard/homeadmin/Payments";
import Salons from "../pages/admin/Dashboard/homeadmin/Salons";
import Services from "../pages/admin/Dashboard/homeadmin/Services";
import Users from "../pages/admin/Dashboard/homeadmin/Users";

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
            <ServiceOverring />
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

      <Route
        path="/login"
        element={
          <>
            <Header />
            <Navbar />
            <Login />
            <Footer />
          </>
        }
      />
      <Route
        path="/register"
        element={
          <>
            <Header />
            <Navbar />
            <Register />
            <Footer />
          </>
        }
      />

      <Route
        path="/profile"
        element={
          <>
            <Header />
            <Navbar />
            <Profileuser />
            <Footer />
          </>
        }
      />
      <Route
        path="/admin"
        element={
          <>
            <HeaderAdmin />
            <Dashboard />
            <Footeradmin />
          </>
        }
      />
      <Route
        path="/admin/booking"
        element={
          <>
            <HeaderAdmin />
            <Bookings />
            <Footeradmin />
          </>
        }
      />
      <Route
        path="/admin/category"
        element={
          <>
            <HeaderAdmin />
            <Categories />
            <Footeradmin />
          </>
        }
      />
      <Route
        path="/admin/payment"
        element={
          <>
            <HeaderAdmin />
            <Payments />
            <Footeradmin />
          </>
        }
      />
      <Route
        path="/admin/salon"
        element={
          <>
            <HeaderAdmin />
            <Salons />
            <Footeradmin />
          </>
        }
      />
      <Route
        path="/admin/service-offering"
        element={
          <>
            <HeaderAdmin />
            <Services />
            <Footeradmin />
          </>
        }
      />
      <Route
        path="/admin/user"
        element={
          <>
            <HeaderAdmin />
            <Users />
            <Footeradmin />
          </>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
