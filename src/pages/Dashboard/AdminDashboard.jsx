import React from "react";
import { Routes, Route } from "react-router-dom";
import HeaderAdmin from "../../pages/admin/Dashboard/headeradmin/headeradmin";
import Footeradmin from "../../pages/admin/Dashboard/footeradmin/footeradmin";
import Bookings from "../../pages/admin/Dashboard/homeadmin/Bookings";
import Categories from "../../pages/admin/Dashboard/homeadmin/Categories";
import Payments from "../../pages/admin/Dashboard/homeadmin/Payments";
import Salons from "../../pages/admin/Dashboard/homeadmin/Salons";
import Services from "../../pages/admin/Dashboard/homeadmin/Services";
import Users from "../../pages/admin/Dashboard/homeadmin/Users";
import Dashboard from "../../pages/admin/Dashboard/homeadmin/Dashboard";
import Profile from "../admin/Dashboard/homeadmin/Profile";

const AdminDashboard = () => {
  return (
    <>
      <HeaderAdmin />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/booking" element={<Bookings />} />
        <Route path="/category" element={<Categories />} />
        <Route path="/payment" element={<Payments />} />
        <Route path="/salon" element={<Salons />} />
        <Route path="/service-offering" element={<Services />} />
        <Route path="/user" element={<Users />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footeradmin />
    </>
  );
};

export default AdminDashboard;
