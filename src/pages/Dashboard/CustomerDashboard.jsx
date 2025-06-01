import React from "react";
import Navbar from "../../components/Navbar";
import Silider from "../../components/Slider";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ServiceOverring from "../../pages/home/ServiceOverring";
import CursorEffect from "../../components/CursorEffect";

const CustomerDashboard = () => {
  return (
    <>
      <CursorEffect />
      <Header />
      <Navbar />
      <Silider />
      <ServiceOverring />
      <Footer />
    </>
  );
};

export default CustomerDashboard;
