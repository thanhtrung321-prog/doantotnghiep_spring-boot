import React from "react";
import Navbar from "../../components/Navbar";
import Silider from "../../components/Silider";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ServiceOverring from "../../pages/home/ServiceOverring";

const CustomerDashboard = () => {
  return (
    <>
      <Header />
      <Navbar />
      <Silider />
      <ServiceOverring />
      <Footer />
    </>
  );
};

export default CustomerDashboard;
