import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import { FaUser } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // State để lưu thông tin user

  // Lấy user từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login"; // Chuyển hướng về trang login
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Header />

        {/* Menu desktop */}
        <div className="hidden md:flex space-x-6 items-center">
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
          <Link
            to="/tableprice"
            className="text-amber-900 hover:text-amber-600 font-medium"
          >
            Bảng Giá
          </Link>
          <Link
            to="/about"
            className="text-amber-900 hover:text-amber-600 font-medium"
          >
            Về Chúng Tôi
          </Link>
          <Link
            to="/contact"
            className="text-amber-900 hover:text-amber-600 font-medium"
          >
            Liên Hệ
          </Link>

          {/* User icon + full_name + menu */}
          <div className="relative flex items-center space-x-2">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="text-amber-900 hover:text-amber-600 focus:outline-none flex items-center space-x-2"
            >
              <FaUser className="h-6 w-6" />
              {user && (
                <span className="text-amber-900 font-medium">
                  {user.fullName} {/* Chỉ hiển thị full_name */}
                </span>
              )}
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Đăng Nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Đăng Ký
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Trang Cá Nhân
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-600"
                      onClick={handleLogout}
                    >
                      Đăng Xuất
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center space-x-4">
          <div className="relative flex items-center space-x-2">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="text-amber-900 hover:text-amber-600 focus:outline-none flex items-center space-x-2"
            >
              <FaUser className="h-6 w-6" />
              {user && (
                <span className="text-amber-900 font-medium">
                  {user.full_name} {/* Chỉ hiển thị full_name */}
                </span>
              )}
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Đăng Nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Đăng Ký
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-600"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Trang Cá Nhân
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-amber-900 hover:bg-amber-100 hover:text-amber-600"
                      onClick={handleLogout}
                    >
                      Đăng Xuất
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white px-4 py-2">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang Chủ
            </Link>
            <Link
              to="/services"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Dịch Vụ
            </Link>
            <Link
              to="/collection"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Mẫu Tóc
            </Link>
            <Link
              to="/tableprice"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Bảng Giá
            </Link>
            <Link
              to="/about"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Về Chúng Tôi
            </Link>
            <Link
              to="/contact"
              className="text-amber-900 hover:text-amber-600 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Liên Hệ
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
