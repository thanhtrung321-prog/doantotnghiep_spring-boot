import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaShieldAlt,
  FaCalendarAlt,
  FaEdit,
  FaHome,
  FaCrown,
  FaCamera,
  FaCog,
  FaTimes,
  FaMoon,
  FaSun,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import { fetchUser, updateUser } from "../../api/customer";

// Utility function to generate a color based on username
const getAvatarColor = (username) => {
  if (!username) return "from-gray-500 to-gray-700";
  const hash = username
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-red-500 to-orange-500",
    "from-indigo-500 to-violet-500",
  ];
  return colors[hash % colors.length];
};

// Utility function to get user initials
const getInitials = (name) => {
  if (!name) return "N/A";
  const names = name.trim().split(" ");
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`
    : names[0].slice(0, 2).toUpperCase();
};

const Profileuser = () => {
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editForm, setEditForm] = useState({});
  const [theme, setTheme] = useState(
    localStorage.getItem("profileTheme") || "light"
  );

  const containerRef = useRef(null);
  const avatarRef = useRef(null);
  const infoCardsRef = useRef([]);
  const actionsRef = useRef(null);
  const editModalRef = useRef(null);
  const settingsModalRef = useRef(null);
  const successModalRef = useRef(null);

  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        setErrorMessage("Vui lòng đăng nhập để xem hồ sơ.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchUser(userId);
        setUser(data);
        setOriginalUser(data);
        setEditForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          username: data.username || "",
          oldPassword: "",
          newPassword: "",
        });
      } catch (error) {
        console.error("Lỗi khi tải hồ sơ:", error.message);
        if (error.message.includes("401") || error.message.includes("403")) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          window.location.href = "/login";
        }
        setErrorMessage(error.message || "Không thể tải hồ sơ.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Apply theme
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.background =
        theme === "light"
          ? "rgba(255, 255, 255, 0.7)"
          : "linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(75, 85, 99, 0.9) 100%)";
      containerRef.current.style.color =
        theme === "light" ? "inherit" : "#e5e7eb";
    }
    localStorage.setItem("profileTheme", theme);
  }, [theme]);

  // GSAP animations
  useEffect(() => {
    if (!isLoading && user) {
      const tl = gsap.timeline();
      tl.fromTo(
        containerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8 }
      );
      tl.fromTo(
        avatarRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.8 },
        "-=0.5"
      );
      tl.fromTo(
        infoCardsRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        "-=0.6"
      );
      tl.fromTo(
        actionsRef.current.children,
        { scale: 0 },
        { scale: 1, duration: 0.4, stagger: 0.1 },
        "-=0.3"
      );
      return () => tl.kill();
    }
  }, [isLoading, user]);

  // Modal animations
  useEffect(() => {
    if (isEditModalOpen && editModalRef.current) {
      gsap.fromTo(
        editModalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4 }
      );
    }
    if (isSettingsModalOpen && settingsModalRef.current) {
      gsap.fromTo(
        settingsModalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4 }
      );
    }
    if (isSuccessModalOpen && successModalRef.current) {
      gsap.fromTo(
        successModalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4 }
      );
    }
  }, [isEditModalOpen, isSettingsModalOpen, isSuccessModalOpen]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
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

      // Handle password update
      if (editForm.oldPassword || editForm.newPassword) {
        if (!editForm.oldPassword || !editForm.newPassword) {
          setErrorMessage("Vui lòng nhập cả mật khẩu cũ và mới.");
          return;
        }
        // Note: Backend doesn't validate oldPassword, so we only send newPassword
        updatedFields.newPassword = editForm.newPassword;
      }

      if (Object.keys(updatedFields).length === 0) {
        setErrorMessage("Không có thay đổi để lưu.");
        return;
      }

      // Include unchanged required fields
      const payload = {
        fullName: updatedFields.fullName || originalUser.fullName || "",
        username: updatedFields.username || originalUser.username,
        email: updatedFields.email || originalUser.email,
        phone: updatedFields.phone || originalUser.phone || "",
        role: originalUser.role,
        newPassword: updatedFields.newPassword || undefined, // Send newPassword if provided
        salonId: originalUser.salonId,
      };

      const updatedUser = await updateUser(userId, payload);
      setUser(updatedUser); // Update local user state
      setOriginalUser(updatedUser);
      setEditForm((prev) => ({
        ...prev,
        fullName: updatedUser.fullName || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        username: updatedUser.username || "",
        oldPassword: "",
        newPassword: "",
      }));
      setErrorMessage("");
      setIsEditModalOpen(false);
      setIsSuccessModalOpen(true);

      // Refresh page after success (optional, since state is updated)
      setTimeout(() => {
        setIsSuccessModalOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error.message);
      if (error.message.includes("401") || error.message.includes("403")) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
      setErrorMessage(error.message || "Cập nhật hồ sơ thất bại.");
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  if (isLoading) {
    return (
      <div className="w-4/5 mx-auto py-16 mt-24 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 animate-spin">
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <FaUser className="text-purple-500 text-3xl animate-pulse" />
            </div>
          </div>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          Đang tải hồ sơ
        </h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-4/5 mx-auto py-16 mt-24 text-center">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-red-200">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
            <FaUser className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Chưa đăng nhập
          </h2>
          <p className="text-gray-600 mb-6">
            {errorMessage || "Vui lòng đăng nhập để xem hồ sơ"}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <FaUser />
            <span>Đăng nhập</span>
          </Link>
        </div>
      </div>
    );
  }

  const userInfo = [
    {
      icon: FaUser,
      label: "Họ và tên",
      value: user.fullName || "N/A",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: FaEnvelope,
      label: "Email",
      value: user.email || "N/A",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: FaPhone,
      label: "Số điện thoại",
      value: user.phone || "N/A",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: FaUserTag,
      label: "Tên đăng nhập",
      value: user.username || "N/A",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: FaShieldAlt,
      label: "Cấp độ",
      value: user.role || "N/A",
      gradient: "from-purple-500 to-violet-500",
    },
  ];

  return (
    <div className="w-4/5 mx-auto py-12 relative mt-24">
      <div
        ref={containerRef}
        className="relative z-10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
      >
        <div className="relative p-8 lg:p-12">
          <div className="relative grid lg:grid-cols-3 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div ref={avatarRef} className="relative inline-block mb-6">
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 p-1 shadow-2xl">
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br ${getAvatarColor(
                      user.username
                    )} flex items-center justify-center`}
                  >
                    <span className="text-3xl lg:text-4xl font-bold text-white">
                      {getInitials(user.fullName)}
                    </span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                  <FaCrown className="text-white text-lg" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                  Online
                </div>
                <button className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors">
                  <FaCamera className="text-sm" />
                </button>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                {user.fullName}
              </h1>
              <p className="text-lg text-purple-600 font-medium mb-4">
                {user.role}
              </p>
              <div className="flex justify-center lg:justify-start space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <FaCalendarAlt />
                  <span>Tham gia {new Date(user.createdAt).getFullYear()}</span>
                </span>
              </div>
            </div>
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
              {userInfo.map((info, index) => (
                <div
                  key={index}
                  ref={(el) => (infoCardsRef.current[index] = el)}
                  className="group relative bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:border-white/50 hover:bg-white/70 transition-all hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-r ${info.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <info.icon className="text-white text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {info.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {info.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        ref={actionsRef}
        className="flex flex-wrap justify-center gap-4 mt-5"
      >
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
        >
          <div className="relative flex items-center space-x-2">
            <FaEdit />
            <span>Chỉnh sửa hồ sơ</span>
          </div>
        </button>
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
        >
          <div className="relative flex items-center space-x-2">
            <FaCog />
            <span>Cài đặt</span>
          </div>
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="group relative px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
        >
          <div className="relative flex items-center space-x-2">
            <FaHome />
            <span>Trang chủ</span>
          </div>
        </button>
      </div>
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
      )}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={settingsModalRef}
            className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Cài đặt
              </h2>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-gray-600 hover:text-red-500"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Chế độ hiển thị
              </h3>
              <button
                onClick={toggleTheme}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 w-full"
              >
                <div className="relative flex items-center justify-center space-x-2">
                  {theme === "light" ? <FaMoon /> : <FaSun />}
                  <span>Chuyển sang {theme === "light" ? "Tối" : "Sáng"}</span>
                </div>
              </button>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
      )}
    </div>
  );
};

export default Profileuser;
