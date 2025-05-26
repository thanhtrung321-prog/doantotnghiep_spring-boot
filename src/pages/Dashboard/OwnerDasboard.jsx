import React from "react";
import { Routes, Route } from "react-router-dom";
import HeaderOwner from "../../pages/Owner/Dashboard/headerowner/Headerowner";
import Footerowner from "../../pages/Owner/Dashboard/footerowner/Footerowner";
import Homeowner from "../../pages/Owner/Dashboard/homeowner/Homeowner";
import Bookings from "../../pages/Owner/Dashboard/homeowner/Bookings";
import Category from "../../pages/Owner/Dashboard/homeowner/Category";
import Payment from "../../pages/Owner/Dashboard/homeowner/Payment";
import Salon from "../../pages/Owner/Dashboard/homeowner/Salon";
import Services from "../../pages/Owner/Dashboard/homeowner/Services";
import Users from "../Owner/Dashboard/homeowner/Users";

const OwnerDashboard = () => {
  return (
    <div>
      <HeaderOwner />
      <Routes>
        <Route path="/" element={<Homeowner />} />
        <Route path="/ownerbookings" element={<Bookings />} />
        <Route path="/ownercategory" element={<Category />} />
        <Route path="/ownerpayment" element={<Payment />} />
        <Route path="/ownersalon" element={<Salon />} />
        <Route path="/ownerservices" element={<Services />} />
        <Route path="/ownerusers" element={<Users />} />
      </Routes>
      <Footerowner />
    </div>
  );
};

export default OwnerDashboard;
