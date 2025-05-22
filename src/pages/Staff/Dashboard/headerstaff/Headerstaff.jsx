import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { fetchUser, fetchSalon } from "../../Dashboard/api/staffhome";

const HeaderStaff = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);
  const [imageMode, setImageMode] = useState("row"); // row or slider
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [salon, setSalon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const profileModalRef = useRef(null);
  const salonModalRef = useRef(null);

  // Navigation items for staff
  const staffMenu = [
    {
      id: "booking",
      name: "Lịch làm việc",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
  ];

  const [activeItem, setActiveItem] = useState("booking");

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out",
      once: true,
    });
  }, []);

  // Fetch user and salon data
  useEffect(() => {
    const fetchUserAndSalon = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          throw new Error("Không tìm thấy thông tin đăng nhập");
        }

        const userData = await fetchUser(userId, token);
        setUser(userData);

        if (userData.salonId) {
          const salonData = await fetchSalon(userData.salonId);
          setSalon(salonData);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng hoặc salon:", error);
        toast.error(
          error.message || "Không thể tải thông tin người dùng hoặc salon"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndSalon();
  }, []);

  // GSAP animation for profile modal
  useEffect(() => {
    if (isProfileModalOpen) {
      gsap.fromTo(
        profileModalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
      gsap.fromTo(
        ".profile-modal-backdrop",
        { opacity: 0 },
        { opacity: 0.5, duration: 0.4, ease: "power3.out" }
      );
    } else {
      gsap.to(profileModalRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      });
      gsap.to(".profile-modal-backdrop", {
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      });
    }
  }, [isProfileModalOpen]);

  // GSAP animation for salon modal
  useEffect(() => {
    if (isSalonModalOpen) {
      gsap.fromTo(
        salonModalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
      gsap.fromTo(
        ".salon-modal-backdrop",
        { opacity: 0 },
        { opacity: 0.5, duration: 0.5, ease: "power3.out" }
      );
    } else {
      gsap.to(salonModalRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      });
      gsap.to(".salon-modal-backdrop", {
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      });
    }
  }, [isSalonModalOpen]);

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleSalonDetailsClick = () => {
    setIsProfileOpen(false);
    setIsSalonModalOpen(true);
    setImageMode("row"); // Default to row mode
    setCurrentImageIndex(0); // Reset slider index
  };

  const handleCloseSalonModal = () => {
    setIsSalonModalOpen(false);
  };

  const handleImageModeToggle = (mode) => {
    setImageMode(mode);
    setCurrentImageIndex(0); // Reset slider index when switching modes
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (salon?.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (salon?.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Đăng xuất thành công!");
    setIsProfileOpen(false);
    navigate("/login");
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Menu Toggle */}
            <div className="flex items-center">
              <button
                className="p-2 rounded-md text-white lg:hidden hover:bg-indigo-600 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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

              <div className="ml-2 lg:ml-0 flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                    />
                  </svg>
                  <div className="ml-2">
                    <span className="text-blue-300 font-bold text-xl">
                      Staff
                    </span>
                    <span className="text-white font-semibold text-xl">
                      Portal
                    </span>
                  </div>
                </div>
              </div>

              <nav className="hidden lg:ml-8 lg:flex lg:space-x-1">
                {staffMenu.map((item) => (
                  <Link
                    key={item.id}
                    to={`/staff/${item.id}`}
                    onClick={() => setActiveItem(item.id)}
                    className={`${
                      activeItem === item.id
                        ? "border-blue-300 text-white"
                        : "border-transparent text-gray-200 hover:border-gray-300 hover:text-white"
                    } group flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1.5 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white p-2 rounded-full">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-3 px-4 border-b border-gray-100 bg-gray-50 rounded-t-md">
                      <p className="text-sm font-medium text-gray-800">
                        {isLoading
                          ? "Đang tải..."
                          : user?.fullName || "Không xác định"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isLoading
                          ? "Đang tải..."
                          : user?.email || "Không xác định"}
                      </p>
                    </div>
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <button
                        onClick={handleProfileClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        role="menuitem"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-3 h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Hồ sơ của bạn
                      </button>
                      <button
                        onClick={handleSalonDetailsClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        role="menuitem"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-3 h-4 w-4 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4"
                          />
                        </svg>
                        Chi tiết Salon
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 flex items-center"
                        role="menuitem"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-3 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`lg:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
          <div className="pt-2 pb-3 space-y-1 bg-indigo-700 border-t border-indigo-600">
            {staffMenu.map((item) => (
              <Link
                key={item.id}
                to={`/staff/${item.id}`}
                onClick={() => setActiveItem(item.id)}
                className={`${
                  activeItem === item.id
                    ? "bg-blue-600 text-white border-blue-300"
                    : "text-gray-200 hover:bg-blue-500 hover:text-white border-transparent"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <>
          <div className="profile-modal-backdrop fixed inset-0 bg-black opacity-50 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              ref={profileModalRef}
              className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              <h2
                className="text-2xl font-bold mb-4 text-center"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                Hồ sơ của bạn
              </h2>
              {isLoading ? (
                <p
                  className="text-center"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  Đang tải...
                </p>
              ) : user ? (
                <div className="space-y-3">
                  <div data-aos="fade-up" data-aos-delay="200">
                    <p className="text-sm text-blue-200">Họ và tên</p>
                    <p className="font-medium">
                      {user.fullName || "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="300">
                    <p className="text-sm text-blue-200">Email</p>
                    <p className="font-medium">
                      {user.email || "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="400">
                    <p className="text-sm text-blue-200">Số điện thoại</p>
                    <p className="font-medium">
                      {user.phone || "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="500">
                    <p className="text-sm text-blue-200">Vai trò</p>
                    <p className="font-medium">
                      {user.role || "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="600">
                    <p className="text-sm text-blue-200">Ngày tạo</p>
                    <p className="font-medium">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                        : "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="700">
                    <p className="text-sm text-blue-200">Cập nhật lần cuối</p>
                    <p className="font-medium">
                      {user.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString("vi-VN")
                        : "Không xác định"}
                    </p>
                  </div>
                </div>
              ) : (
                <p
                  className="text-center text-red-300"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  Không tìm thấy thông tin người dùng
                </p>
              )}
              <button
                onClick={handleCloseProfileModal}
                className="mt-6 w-full bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors"
                data-aos="fade-up"
                data-aos-delay="800"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}

      {/* Salon Details Modal */}
      {isSalonModalOpen && (
        <>
          <div className="salon-modal-backdrop fixed inset-0 bg-black opacity-50 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              ref={salonModalRef}
              className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-2xl w-full max-w-3xl p-8"
            >
              <h2
                className="text-3xl font-bold mb-6 text-center"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                Chi tiết Salon
              </h2>
              {isLoading ? (
                <p
                  className="text-center"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  Đang tải...
                </p>
              ) : salon ? (
                <div className="space-y-6">
                  {/* Salon Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div data-aos="fade-up" data-aos-delay="200">
                      <p className="text-sm text-blue-300">Tên Salon</p>
                      <p className="font-medium">
                        {salon.name || "Không xác định"}
                      </p>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="300">
                      <p className="text-sm text-blue-300">Địa chỉ</p>
                      <p className="font-medium">
                        {salon.address || "Không xác định"}
                      </p>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="400">
                      <p className="text-sm text-blue-300">Liên hệ</p>
                      <p className="font-medium">
                        {salon.contact || "Không xác định"}
                      </p>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="500">
                      <p className="text-sm text-blue-300">Email</p>
                      <p className="font-medium">
                        {salon.email || "Không xác định"}
                      </p>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="600">
                      <p className="text-sm text-blue-300">Thành phố</p>
                      <p className="font-medium">
                        {salon.city || "Không xác định"}
                      </p>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="700">
                      <p className="text-sm text-blue-300">Giờ mở cửa</p>
                      <p className="font-medium">
                        {salon.openingTime || "Không xác định"}
                      </p>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="800">
                      <p className="text-sm text-blue-300">Giờ đóng cửa</p>
                      <p className="font-medium">
                        {salon.closingTime || "Không xác định"}
                      </p>
                    </div>
                  </div>

                  {/* Image Mode Toggle */}
                  <div
                    className="flex justify-center space-x-4"
                    data-aos="fade-up"
                    data-aos-delay="900"
                  >
                    <button
                      onClick={() => handleImageModeToggle("row")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        imageMode === "row"
                          ? "bg-blue-400 text-white"
                          : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      }`}
                    >
                      Chế độ Lưới
                    </button>
                    <button
                      onClick={() => handleImageModeToggle("slider")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        imageMode === "slider"
                          ? "bg-blue-400 text-white"
                          : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      }`}
                    >
                      Chế độ Trình chiếu
                    </button>
                  </div>

                  {/* Images */}
                  <div data-aos="fade-in" data-aos-delay="1000">
                    {salon.images && salon.images.length > 0 ? (
                      imageMode === "row" ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {salon.images.map((image, index) => (
                            <img
                              key={index}
                              src={`http://localhost:8084/salon-images/${image}`}
                              alt={`Salon ${salon.name} ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={`http://localhost:8084/salon-images/${salon.images[currentImageIndex]}`}
                            alt={`Salon ${salon.name} ${currentImageIndex + 1}`}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          {salon.images.length > 1 && (
                            <>
                              <button
                                onClick={handlePrevImage}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-full"
                              >
                                <FaArrowLeft />
                              </button>
                              <button
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-full"
                              >
                                <FaArrowRight />
                              </button>
                            </>
                          )}
                        </div>
                      )
                    ) : (
                      <p className="text-center text-red-300">
                        Không có hình ảnh nào để hiển thị
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p
                  className="text-center text-red-300"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  Không tìm thấy thông tin salon
                </p>
              )}
              <button
                onClick={handleCloseSalonModal}
                className="mt-6 w-full bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors"
                data-aos="fade-up"
                data-aos-delay="1100"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default HeaderStaff;
