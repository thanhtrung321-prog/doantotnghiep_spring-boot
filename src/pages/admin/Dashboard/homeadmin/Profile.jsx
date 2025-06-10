import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaShieldAlt,
  FaCalendarAlt,
  FaEdit,
  FaTimes,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import { fetchUser, updateUser } from "../../api/apiadmin/usermannager";

const Profile = () => {
  const canvasRef = useRef(null);
  const editModalRef = useRef(null);
  const successModalRef = useRef(null);
  const localUser = JSON.parse(localStorage.getItem("user")) || {};
  const [profileData, setProfileData] = useState({
    id: localUser.id || "N/A",
    username: localUser.username || "N/A",
    email: localUser.email || "N/A",
    fullName: localUser.fullName || "N/A",
    phone: localUser.phone || "N/A",
    role: localUser.role || "N/A",
    createdAt: "Đang tải...",
    updatedAt: "Đang tải...",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    oldPassword: "",
    newPassword: "",
  });

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
        setProfileData({
          id: data.id || "N/A",
          username: data.username || "N/A",
          email: data.email || "N/A",
          fullName: data.fullName || "N/A",
          phone: data.phone || "N/A",
          role: data.role || "N/A",
          createdAt: data.createdAt || "N/A",
          updatedAt: data.updatedAt || "N/A",
        });
        setEditForm({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          username: data.username || "",
          oldPassword: "",
          newPassword: "",
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error.message);
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

  // Initialize ThreeJS background effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;

    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x8844ff,
    });

    // Mesh
    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    // Position camera
    camera.position.z = 5;

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Modal animations
  useEffect(() => {
    if (isEditModalOpen && editModalRef.current) {
      gsap.fromTo(
        editModalRef.current,
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
  }, [isEditModalOpen, isSuccessModalOpen]);

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
        if (editForm[key] && editForm[key] !== (profileData[key] || "")) {
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
        fullName: updatedFields.fullName || profileData.fullName || "",
        username: updatedFields.username || profileData.username,
        email: updatedFields.email || profileData.email,
        phone: updatedFields.phone || profileData.phone || "",
        role: profileData.role,
        newPassword: updatedFields.newPassword || undefined,
        salonId: profileData.salonId,
      };

      const updatedUser = await updateUser(userId, payload);
      setProfileData({
        ...profileData,
        fullName: updatedUser.fullName || "N/A",
        username: updatedUser.username || "N/A",
        email: updatedUser.email || "N/A",
        phone: updatedUser.phone || "N/A",
        role: updatedUser.role || "N/A",
        createdAt: updatedUser.createdAt || profileData.createdAt,
        updatedAt: updatedUser.updatedAt || profileData.updatedAt,
      });
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
      console.error("Lỗi khi cập nhật thông tin:", error.message);
      if (error.message.includes("401") || error.message.includes("403")) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
      setErrorMessage(error.message || "Cập nhật hồ sơ thất bại.");
    }
  };

  // Handle copy button
  const handleCopy = () => {
    const textToCopy = Object.entries(profileData)
      .filter(([key]) => key !== "password")
      .map(([key, value]) => `${formatLabel(key)}: ${value}`)
      .join("\n");
    navigator.clipboard.writeText(textToCopy);
    alert("Đã sao chép thông tin vào clipboard!");
  };

  // Get the first letter of the name for avatar
  const getInitial = () => {
    return profileData.fullName !== "N/A"
      ? profileData.fullName[0].toUpperCase()
      : "A";
  };

  // Generate a rainbow gradient based on name
  const generateGradient = () => {
    const nameHash = profileData.fullName
      .split("")
      .reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0);

    const hue1 = nameHash % 360;
    const hue2 = (hue1 + 120) % 360;
    const hue3 = (hue1 + 240) % 360;

    return `linear-gradient(135deg, 
      hsl(${hue1}, 80%, 60%), 
      hsl(${hue2}, 80%, 60%), 
      hsl(${hue3}, 80%, 60%))`;
  };

  // Convert key to formatted label
  const formatLabel = (key) => {
    return key
      .split(/(?=[A-Z])|_|-/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 animate-spin">
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <FaUser className="text-purple-500 text-3xl animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
            Đang tải hồ sơ
          </h2>
        </div>
      </div>
    );
  }

  if (!profileData.id || profileData.id === "N/A") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-red-200 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
            <FaUser className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Chưa đăng nhập
          </h2>
          <p className="text-gray-600 mb-6">
            {errorMessage || "Vui lòng đăng nhập để xem hồ sơ"}
          </p>
          <a
            href="/login"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <FaUser />
            <span>Đăng nhập</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ThreeJS Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 bg-opacity-40 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 p-8 lg:p-12 w-full max-w-3xl mx-auto transform transition-all hover:scale-[1.01] hover:shadow-purple-500/20 overflow-hidden relative">
          {/* Animated background glow */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-20 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-4000"></div>

          {/* Content container */}
          <div className="relative z-10">
            {/* Header with profile title */}
            <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-8">
              Thông tin tài khoản
            </h1>

            {/* Profile content */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left column with avatar */}
              <div className="md:w-1/3 flex flex-col items-center">
                <div
                  className="w-36 h-36 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg shadow-purple-500/20 mb-4"
                  style={{ background: generateGradient() }}
                >
                  {getInitial()}
                </div>

                <h2 className="text-xl font-semibold text-white text-center mb-2">
                  {profileData.fullName}
                </h2>

                <p className="text-purple-300 text-center mb-6">
                  <span className="text-gray-300">Tài khoản:</span>{" "}
                  <span className="text-purple-400 font-semibold text-2xl">
                    {profileData.username}
                  </span>
                </p>

                <button
                  onClick={handleCopy}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 font-medium flex items-center justify-center gap-2"
                  aria-label="Copy Profile Information"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Sao chép
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full mt-4 py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 font-medium flex items-center justify-center gap-2"
                  aria-label="Edit Profile"
                >
                  <FaEdit className="h-5 w-5" />
                  Chỉnh sửa hồ sơ
                </button>
              </div>

              {/* Right column with profile details */}
              <div className="md:w-2/3">
                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-purple-300 mb-4">
                    Chi tiết tài khoản
                  </h3>

                  <div className="space-y-4">
                    {Object.entries(profileData).map(
                      ([key, value]) =>
                        key !== "fullName" &&
                        key !== "username" && (
                          <div
                            key={key}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white border-b border-gray-700 pb-3 group hover:border-purple-400 transition-colors duration-300"
                          >
                            <span className="font-medium text-gray-300 group-hover:text-purple-300 transition-colors duration-300">
                              {formatLabel(key)}:
                            </span>
                            <span className="text-gray-200 mt-1 sm:mt-0">
                              {key === "createdAt" || key === "updatedAt"
                                ? new Date(value).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : value}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
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

      {/* Success Modal */}
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
    </>
  );
};

export default Profile;
