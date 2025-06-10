import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FaArrowLeft,
  FaArrowRight,
  FaEdit,
  FaTimes,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import {
  fetchUser,
  fetchSalon,
  updateUser,
} from "../../Dashboard/api/staffhome";

const HeaderStaff = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);
  const [imageMode, setImageMode] = useState("row");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [salon, setSalon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    oldPassword: "",
    newPassword: "",
  });
  const navigate = useNavigate();
  const profileModalRef = useRef(null);
  const salonModalRef = useRef(null);
  const editModalRef = useRef(null);
  const successModalRef = useRef(null);

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
        setEditForm({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          username: userData.username || "",
          oldPassword: "",
          newPassword: "",
        });

        if (userData.salonId) {
          const salonData = await fetchSalon(userData.salonId);
          setSalon(salonData);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        if (error.message.includes("401") || error.message.includes("403")) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("salonId");
          navigate("/login");
        }
        toast.error(error.message || "Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndSalon();
  }, [navigate]);

  // GSAP animations for modals
  useEffect(() => {
    const animateModal = (modalRef, isOpen, backdropClass) => {
      if (isOpen && modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" }
        );
        gsap.fromTo(
          `.${backdropClass}`,
          { opacity: 0 },
          { opacity: 0.5, duration: 0.4, ease: "power3.out" }
        );
      } else if (modalRef.current) {
        gsap.to(modalRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 0.3,
          ease: "power3.in",
        });
        gsap.to(`.${backdropClass}`, {
          opacity: 0,
          duration: 0.3,
          ease: "power3.in",
        });
      }
    };

    animateModal(profileModalRef, isProfileModalOpen, "profile-modal-backdrop");
    animateModal(salonModalRef, isSalonModalOpen, "salon-modal-backdrop");
    animateModal(editModalRef, isEditModalOpen, "edit-modal-backdrop");
    animateModal(successModalRef, isSuccessModalOpen, "success-modal-backdrop");
  }, [
    isProfileModalOpen,
    isSalonModalOpen,
    isEditModalOpen,
    isSuccessModalOpen,
  ]);

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleEditProfileClick = () => {
    setIsProfileModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleSalonDetailsClick = () => {
    setIsProfileOpen(false);
    setIsSalonModalOpen(true);
    setImageMode("row");
    setCurrentImageIndex(0);
  };

  const handleImageModeToggle = (mode) => {
    setImageMode(mode);
    setCurrentImageIndex(0);
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
    localStorage.removeItem("salonId");
    toast.success("Đăng xuất thành công!");
    setIsProfileOpen(false);
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setErrorMessage("Vui lòng đăng nhập để chỉnh sửa hồ sơ.");
      return;
    }

    try {
      const updatedFields = {};
      const editableFields = ["fullName", "email", "phone", "username"];
      editableFields.forEach((key) => {
        if (editForm[key] && editForm[key] !== (user[key] || "")) {
          updatedFields[key] = editForm[key].trim();
        }
      });

      if (editForm.oldPassword || editForm.newPassword) {
        if (!editForm.oldPassword || !editForm.newPassword) {
          setErrorMessage("Vui lòng nhập cả mật khẩu cũ và mới.");
          return;
        }
        updatedFields.newPassword = editForm.newPassword;
      }

      if (Object.keys(updatedFields).length === 0) {
        setErrorMessage("Không có thay đổi để lưu.");
        return;
      }

      const payload = {
        fullName: updatedFields.fullName || user.fullName || "",
        username: updatedFields.username || user.username,
        email: updatedFields.email || user.email,
        phone: updatedFields.phone || user.phone || "",
        role: user.role,
        newPassword: updatedFields.newPassword || undefined,
        salonId: user.salonId,
      };

      const updatedUser = await updateUser(userId, payload, token);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditForm((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
      }));
      setErrorMessage("");
      setIsEditModalOpen(false);
      setIsSuccessModalOpen(true);

      setTimeout(() => {
        setIsSuccessModalOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error.message);
      if (error.message.includes("401") || error.message.includes("403")) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("salonId");
        navigate("/login");
      }
      setErrorMessage(error.message || "Cập nhật hồ sơ thất bại.");
    }
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-16">
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
                        onClick={handleEditProfileClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        role="menuitem"
                      >
                        <FaEdit className="mr-3 h-4 w-4 text-gray-500" />
                        Chỉnh sửa hồ sơ
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
            <button
              onClick={handleProfileClick}
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-gray-200 hover:bg-blue-500 hover:text-white border-transparent"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Hồ sơ của bạn
              </div>
            </button>
            <button
              onClick={handleEditProfileClick}
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-gray-200 hover:bg-blue-500 hover:text-white border-transparent"
            >
              <div className="flex items-center">
                <FaEdit className="mr-3 h-5 w-5" />
                Chỉnh sửa hồ sơ
              </div>
            </button>
            <button
              onClick={handleSalonDetailsClick}
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-gray-200 hover:bg-blue-500 hover:text-white border-transparent"
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4"
                  />
                </svg>
                Chi tiết Salon
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-red-600 hover:bg-gray-100 hover:text-red-700 border-transparent"
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-3 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 64"
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
              </div>
            </button>
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
                    <p className="text-sm text-blue-300">Họ và tên</p>
                    <p className="font-medium">
                      {user.fullName || "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="300">
                    <p className="text-sm text-blue-300">Email</p>
                    <p className="font-medium">
                      {user.email || "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="400">
                    <p className="text-sm text-blue-300">Số điện thoại</p>
                    <p className="font-medium">
                      {user.phone || "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="500">
                    <p className="text-sm text-blue-300">Tên đăng nhập</p>
                    <p className="font-medium">
                      {user.username || "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="600">
                    <p className="text-sm text-blue-300">Vai trò</p>
                    <p className="font-medium">
                      {user.role || "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="700">
                    <p className="text-sm text-blue-300">Ngày tạo</p>
                    <p className="font-medium">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                        : "Không xác định"}
                    </p>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="800">
                    <p className="text-sm text-blue-300">Cập nhật lần cuối</p>
                    <p className="font-medium">
                      {user.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString("vi-VN")
                        : "Không xác định"}
                    </p>
                  </div>
                  <div
                    className="mt-6 flex space-x-3"
                    data-aos="fade-up"
                    data-aos-delay="900"
                  >
                    <button
                      onClick={handleEditProfileClick}
                      className="flex-1 bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => setIsProfileModalOpen(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors"
                    >
                      Đóng
                    </button>
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
            </div>
          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <>
          <div className="edit-modal-backdrop fixed inset-0 bg-black opacity-50 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              ref={editModalRef}
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Chỉnh sửa hồ sơ
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-600 hover:text-red-500"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl">
                  {errorMessage}
                </div>
              )}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {["fullName", "email", "phone", "username"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {field === "fullName"
                        ? "Họ và tên"
                        : field === "phone"
                        ? "Số điện thoại"
                        : field === "username"
                        ? "Tên đăng nhập"
                        : field}
                    </label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      name={field}
                      value={editForm[field]}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 bg-white/50"
                      required={field === "email" || field === "username"}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mật khẩu cũ
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="oldPassword"
                      value={editForm.oldPassword}
                      onChange={handleInputChange}
                      className="mt-1 w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 bg-white/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="newPassword"
                      value={editForm.newPassword}
                      onChange={handleInputChange}
                      className="mt-1 w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 bg-white/50"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <>
          <div className="success-modal-backdrop fixed inset-0 bg-black opacity-50 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              ref={successModalRef}
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-green-200"
            >
              <div className="text-center">
                <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  Cập nhật thành công!
                </h2>
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg"
                >
                  Đóng
                </button>
              </div>
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
                onClick={() => setIsSalonModalOpen(false)}
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
