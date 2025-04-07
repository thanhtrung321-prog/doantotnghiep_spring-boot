import React, { useState } from "react";
import Navbar from "../../components/Navbar";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-stone-50 min-h-screen">
        <Navbar />
    </div>
  );
};

export default Home;
