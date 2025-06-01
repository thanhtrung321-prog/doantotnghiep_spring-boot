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
      {/* vẩn còn bị kẹt header ở profile do 2 cái trùng lặp ở nav và header  */}
      <Header />
      <Navbar />
      <Silider />
      <ServiceOverring />
      <Footer />
    </>
  );
};

export default CustomerDashboard;
