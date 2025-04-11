import React from "react";
import HeaderStaff from "../../pages/Staff/Dashboard/headerstaff/Headerstaff";
import Footerstaff from "../../pages/Staff/Dashboard/footerstaff/Footerstaff";
import Homestaff from "../../pages/Staff/Dashboard/homestaff/Homestaff";

const StaffDashboard = () => {
  return (
    <>
      <HeaderStaff />
      <Homestaff />
      <Footerstaff />
    </>
  );
};

export default StaffDashboard;