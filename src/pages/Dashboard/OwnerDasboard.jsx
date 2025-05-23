import React from "react";
import HeaderOwner from "../../pages/Owner/Dashboard/headerowner/Headerowner";
import Footerowner from "../../pages/Owner/Dashboard/footerowner/Footerowner";
import Homeowner from "../../pages/Owner/Dashboard/homeowner/Homeowner";

const OwnerDasboard = () => {
  return (
    <>
      <HeaderOwner />
      <Homeowner />
      <Footerowner />
    </>
  );
};

export default OwnerDasboard;
