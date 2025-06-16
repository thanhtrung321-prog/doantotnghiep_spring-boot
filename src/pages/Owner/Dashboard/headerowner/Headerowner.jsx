import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Home,
  Calendar,
  Grid3x3,
  CreditCard,
  Scissors,
  Users,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  User,
  Info,
  Edit2,
  Phone,
  Mail,
  Clock,
  Trash2,
} from "lucide-react";
import { FaTimes, FaLock, FaCheckCircle } from "react-icons/fa";
import useSound from "use-sound";
import { fetchNotifications } from "../api/nofication";
import notificationSound from "../asset/musicnofication/nofication.mp3";

const Headerowner = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [salonData, setSalonData] = useState(null);
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDeleteSuccessModalOpen, setIsDeleteSuccessModalOpen] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    oldPassword: "",
    newPassword: "",
  });
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const editModalRef = useRef(null);
  const successModalRef = useRef(null);
  const deleteSuccessModalRef = useRef(null);
  const allNotificationsModalRef = useRef(null);
  const deleteConfirmModalRef = useRef(null);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [playSound] = useSound(notificationSound, { volume: 0.5 });
  const prevNotificationIds = useRef(new Set());

  useEffect(() => {
    // Initialize Lucide icons
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons();
    }

    // Initialize AOS
    AOS.init({ duration: 1000, once: true });

    // GSAP animations for header
    if (typeof window !== "undefined" && window.gsap) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      gsap.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)", delay: 0.2 }
      );

      gsap.fromTo(
        ".nav-item",
        { opacity: 0, y: -10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.4,
        }
      );
    }

    // Fetch user, salon data, and notifications
    const fetchData = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        navigate("/login");
        return;
      }

      try {
        // Fetch user data
        const userResponse = await axios.get(
          `http://localhost:8082/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token.trim()}`,
            },
          }
        );
        if (!userResponse.data || Object.keys(userResponse.data).length === 0) {
          throw new Error("Không tìm thấy thông tin người dùng");
        }
        const user = userResponse.data;
        setUserData(user);
        setEditForm({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          username: user.username || "",
          oldPassword: "",
          newPassword: "",
        });

        // Fetch salon data if OWNER
        if (user.role === "OWNER" && user.salonId) {
          const salonResponse = await axios.get(
            `http://localhost:8084/salon/${user.salonId}`,
            {
              headers: {
                Authorization: `Bearer ${token.trim()}`,
              },
            }
          );
          if (
            !salonResponse.data ||
            Object.keys(salonResponse.data).length === 0
          ) {
            throw new Error("Không tìm thấy thông tin salon");
          }
          setSalonData(salonResponse.data);
        }

        // Fetch notifications
        const notificationData = await fetchNotifications();
        const currentIds = new Set(notificationData.map((n) => n.id));
        const hasNewNotifications = [...currentIds].some(
          (id) => !prevNotificationIds.current.has(id)
        );

        if (hasNewNotifications) {
          playSound(); // Play sound only for new notifications
        }

        setNotifications(notificationData);
        prevNotificationIds.current = currentIds;
      } catch (error) {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          localStorage.removeItem("user");
          localStorage.removeItem("userId");
          localStorage.removeItem("token");
          navigate("/login");
        }
        setErrorMessage(error.message || "Không thể tải dữ liệu.");
      }
    };

    fetchData();

    // Set up interval to fetch data every 10 seconds
    const intervalId = setInterval(fetchData, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate, playSound]);

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

    animateModal(editModalRef, isEditModalOpen, "edit-modal-backdrop");
    animateModal(successModalRef, isSuccessModalOpen, "success-modal-backdrop");
    animateModal(
      deleteSuccessModalRef,
      isDeleteSuccessModalOpen,
      "delete-success-modal-backdrop"
    );
    animateModal(
      allNotificationsModalRef,
      showAllNotifications,
      "all-notifications-backdrop"
    );
    animateModal(
      deleteConfirmModalRef,
      showDeleteConfirmModal,
      "delete-confirm-backdrop"
    );
  }, [
    isEditModalOpen,
    isSuccessModalOpen,
    isDeleteSuccessModalOpen,
    showAllNotifications,
    showDeleteConfirmModal,
  ]);

  const handleDeleteNotificationClick = (notification) => {
    setNotificationToDelete(notification);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteNotification = async () => {
    if (!notificationToDelete) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:8084/api/contact/message/${notificationToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationToDelete.id)
      );
      prevNotificationIds.current.delete(notificationToDelete.id);
      setShowDeleteConfirmModal(false);
      setNotificationToDelete(null);
      setIsDeleteSuccessModalOpen(true);

      setTimeout(() => {
        setIsDeleteSuccessModalOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Error deleting notification:", error);
      setErrorMessage(error.message || "Không thể xóa thông báo.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEditProfileClick = () => {
    setIsProfileOpen(false);
    setIsEditModalOpen(true);
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
        if (editForm[key] && editForm[key] !== (userData[key] || "")) {
          updatedFields[key] = editForm[key].trim();
        }
      });

      if (editForm.oldPassword || editForm.newPassword) {
        if (!editForm.oldPassword || !editForm.newPassword) {
          setErrorMessage("Vui lòng nhập cả mật khẩu cũ và mới.");
          return;
        }
        updatedFields.password = editForm.newPassword;
      }

      if (Object.keys(updatedFields).length === 0) {
        setErrorMessage("Không có thay đổi để lưu.");
        return;
      }

      const payload = {
        fullName: updatedFields.fullName || userData.fullName || "",
        username: updatedFields.username || userData.username,
        email: updatedFields.email || userData.email,
        phone: updatedFields.phone || userData.phone || "",
        role: userData.role,
        password: updatedFields.password || undefined,
        salonId: userData.salonId,
      };

      const response = await axios.put(
        `http://localhost:8082/user/${userId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );

      if (!response.data || Object.keys(response.data).length === 0) {
        throw new Error("Cập nhật không thành công");
      }

      const updatedUser = response.data;
      setUserData(updatedUser);
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
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        navigate("/login");
      }
      setErrorMessage(error.message || "Cập nhật hồ sơ thất bại.");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  // Split text for karaoke effect
  const splitText = (text) => {
    return text.split("").map((char, index) => (
      <span
        key={index}
        className="inline-block"
        data-aos="fade-up"
        data-aos-delay={`${index * 50}`}
      >
        {char}
      </span>
    ));
  };

  const navigationItems = [
    { to: "/owner", label: "Dashboard", icon: Home },
    { to: "/owner/ownerbookings", label: "Bookmarks", icon: Calendar },
    { to: "/owner/ownercategory", label: "Category", icon: Grid3x3 },
    { to: "/owner/ownerpayment", label: "Payment", icon: CreditCard },
    { to: "/owner/ownerservices", label: "Services", icon: Scissors },
    { to: "/owner/ownerusers", label: "Users", icon: Users },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className="bg-gray-900 border-b border-gray-700 shadow-xl relative z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div ref={logoRef} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div className="max-w-[200px] overflow-hidden">
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent truncate leading-tight">
                  {salonData ? salonData.name : "Salon Owner"}
                </h1>
                <p className="text-xs text-gray-400 truncate">
                  Hệ thống quản trị
                </p>
              </div>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-item flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "text-white bg-purple-600 shadow-lg shadow-purple-500/30"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setShowNotifications(true)}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Recent Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 bg-opacity-50 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
                      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Thông báo
                          </h3>
                          <p className="text-xs text-gray-400">
                            {notifications.length} thông báo gần nhất
                          </p>
                        </div>
                        <button
                          className="text-gray-400 hover:text-white transition-colors"
                          onClick={() => setShowNotifications(false)}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="divide-y divide-gray-700 max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 3).map((notification) => (
                            <div
                              key={notification.id}
                              className="p-4 hover:bg-gray-700 transition-colors duration-200 relative"
                            >
                              <button
                                onClick={() =>
                                  handleDeleteNotificationClick(notification)
                                }
                                className="absolute top-2 right-2 text-red-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white">
                                    {notification.fullName}
                                  </p>
                                  <p className="text-sm text-gray-300 mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                    <span>📞 {notification.phoneNumber}</span>
                                    <span>✉️ {notification.email}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(notification.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-gray-400 text-center">
                            Không có thông báo
                          </div>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-700">
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              setShowAllNotifications(true);
                            }}
                            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            <span>Xem tất cả</span>
                            <span className="text-sm">
                              ({notifications.length})
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* All Notifications Modal */}
                {showAllNotifications && (
                  <>
                    <div
                      className="all-notifications-backdrop fixed inset-0 bg-black bg-opacity-50 z-50"
                      onClick={() => setShowAllNotifications(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                      <div
                        ref={allNotificationsModalRef}
                        className="relative bg-gray-800 w-full max-w-3xl max-h-[80vh] rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="sticky top-0 bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center z-10">
                          <h3 className="text-xl font-bold text-white">
                            Tất cả thông báo
                          </h3>
                          <button
                            onClick={() => setShowAllNotifications(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 max-h-[calc(80vh-80px)]">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200 relative"
                              >
                                <button
                                  onClick={() =>
                                    handleDeleteNotificationClick(notification)
                                  }
                                  className="absolute top-2 right-2 text-red-500 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                                <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-lg font-semibold text-white">
                                      {notification.fullName}
                                    </p>
                                    <p className="text-gray-300 mt-1">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center gap-6 mt-3 text-sm text-gray-400">
                                      <span className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {notification.phoneNumber}
                                      </span>
                                      <span className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {notification.email}
                                      </span>
                                      <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {formatDate(notification.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400 text-center p-4">
                              Không có thông báo
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirmModal && (
                  <>
                    <div
                      className="delete-confirm-backdrop fixed inset-0 bg-black bg-opacity-50 z-60"
                      onClick={() => setShowDeleteConfirmModal(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-60">
                      <div
                        ref={deleteConfirmModalRef}
                        className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-sm w-full mx-4"
                      >
                        <div className="text-center">
                          <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                          <h2 className="text-xl font-bold text-white mb-4">
                            {splitText("Xác nhận xóa thông báo?")}
                          </h2>
                          <p className="text-gray-300 mb-6">
                            Hành động này không thể hoàn tác.
                          </p>
                          <div className="flex justify-center space-x-4">
                            <button
                              onClick={() => setShowDeleteConfirmModal(false)}
                              className="px-6 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={handleDeleteNotification}
                              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Delete Success Modal */}
                {isDeleteSuccessModalOpen && (
                  <>
                    <div className="delete-success-modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-50" />
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                      <div
                        ref={deleteSuccessModalRef}
                        className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-sm w-full mx-4"
                      >
                        <div className="text-center">
                          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4 animate-bounce" />
                          <h2 className="text-xl font-bold text-white mb-4">
                            Xóa thông báo thành công!
                          </h2>
                          <button
                            onClick={() => setIsDeleteSuccessModalOpen(false)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium truncate max-w-[100px]">
                    {userData ? userData.fullName : "Owner"}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
                    <div className="py-2">
                      {userData && (
                        <div className="px-4 py-2 border-b border-gray-700">
                          <p className="text-sm text-gray-300 truncate">
                            ID: {userData.id}
                          </p>
                          <p className="text-sm text-gray-300 truncate">
                            Tên: {userData.fullName}
                          </p>
                          <p className="text-sm text-gray-300 truncate">
                            Email: {userData.email}
                          </p>
                          <p className="text-sm text-gray-300 truncate">
                            Vai trò: {userData.role}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={handleEditProfileClick}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Chỉnh sửa hồ sơ</span>
                      </button>
                      {userData && userData.role === "OWNER" && salonData && (
                        <button
                          onClick={() => setShowSalonModal(true)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                          <span>Chi tiết salon</span>
                        </button>
                      )}
                      <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Cài đặt</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-500 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 bg-gray-800">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "text-white bg-purple-600 shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              <button
                onClick={handleEditProfileClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300 w-full"
              >
                <Edit2 className="w-5 h-5" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
              {userData && userData.role === "OWNER" && salonData && (
                <button
                  onClick={() => {
                    setShowSalonModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300 w-full"
                >
                  <Info className="w-5 h-5" />
                  <span>Chi tiết salon</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:text-white hover:bg-gray-700 transition-all duration-300 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Overlay for profile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileOpen(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <>
          <div className="edit-modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              ref={editModalRef}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-lg w-full mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Chỉnh sửa hồ sơ
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-600 text-white rounded-lg">
                  {errorMessage}
                </div>
              )}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {["fullName", "email", "phone", "username"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-300 capitalize">
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
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      required={field === "email" || field === "username"}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm text-gray-300">
                    Mật khẩu cũ
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="oldPassword"
                      value={editForm.oldPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="newPassword"
                      value={editForm.newPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
          <div className="success-modal-backdrop fixed inset-0 bg-black bg-opacity-50 z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              ref={successModalRef}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-sm w-full mx-4"
            >
              <div className="text-center">
                <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-xl font-bold text-white mb-4">
                  Cập nhật thành công!
                </h2>
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Salon Details Modal */}
      {showSalonModal && salonData && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowSalonModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-lg w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Chi tiết salon</h2>
                <button
                  onClick={() => setShowSalonModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-300">
                  <span className="font-medium">Tên salon:</span>{" "}
                  {salonData.name}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Địa chỉ:</span>{" "}
                  {salonData.address}, {salonData.city}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Liên hệ:</span>{" "}
                  {salonData.contact}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Email:</span> {salonData.email}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Giờ mở cửa:</span>{" "}
                  {salonData.openingTime} - {salonData.closingTime}
                </p>
                <div>
                  <p className="text-gray-300 font-medium">Hình ảnh:</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {salonData.images && salonData.images.length > 0 ? (
                      salonData.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:8084/salon-images/${image}`}
                          alt={`Salon ${salonData.name} image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))
                    ) : (
                      <p className="text-gray-400">Không có hình ảnh</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSalonModal(false)}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Headerowner;
