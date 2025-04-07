import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Khai báo state

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Navbar sẽ gọi component Header */}
        <Header />

        <div className="hidden md:flex space-x-6">
          <Link
            to="/"
            className="text-amber-900 hover:text-amber-600 font-medium"
          >
            Trang Chủ
          </Link>
          <Link
            to="/services"
            className="text-amber-900 hover:text-amber-600 font-medium"
          >
            Dịch Vụ
          </Link>
          <Link
            to="/collection"
            className="text-amber-900 hover:text-amber-600 font-medium"
          >
            Mẫu Tóc
          </Link>
          <a
            href="#"
            className="text-amber-900 hover:text-amber-600 font-medium"
          >
            Bảng Giá
          </a>
          <Link
            to="/contact"
            className="text-amber-900 hover:text-amber-600 font-medium"
          >
            Về Chúng Tôi
          </Link>
          <a
            href="#"
            className="text-amber-900 hover:text-amber-600 font-medium"
          >
            Liên Hệ
          </a>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)} // Điều khiển mở/đóng menu
            className="text-amber-900 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white px-4 py-2">
          <div className="flex flex-col space-y-2">
            <a
              href="#"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
            >
              Trang Chủ
            </a>
            <a
              href="#"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
            >
              Dịch Vụ
            </a>
            <a
              href="#"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
            >
              Mẫu Tóc
            </a>
            <a
              href="#"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
            >
              Bảng Giá
            </a>
            <a
              href="#"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
            >
              Về Chúng Tôi
            </a>
            <a
              href="#"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
            >
              Liên Hệ
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
